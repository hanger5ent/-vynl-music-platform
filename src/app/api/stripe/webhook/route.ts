import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { recordCreatorEarning, recordRefund, hasLedgerEntryForPaymentIntent } from '@/lib/revenue-ledger'
import type { SubscriptionStatus, SubscriptionTier } from '@prisma/client'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

function normalizeTier(tier: string | undefined): SubscriptionTier {
  const upper = (tier || '').toUpperCase()
  if (upper === 'BASIC' || upper === 'PREMIUM' || upper === 'VIP') return upper
  return 'BASIC'
}

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'ACTIVE'
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE'
    case 'canceled':
      return 'CANCELLED'
    case 'paused':
      return 'PAUSED'
    case 'incomplete_expired':
      return 'EXPIRED'
    default:
      return 'ACTIVE'
  }
}

// Upserts our CreatorSubscription row from a Stripe Subscription object.
// Used on checkout completion, renewals, and any out-of-band subscription
// change (upgrade/downgrade, dunning recovery, cancel-at-period-end), so
// there's exactly one place that knows how to translate Stripe's shape into
// ours.
async function upsertCreatorSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const { artistId, tier, userId } = subscription.metadata || {}
  if (!artistId || !tier || !userId) {
    console.error(`Stripe subscription ${subscription.id} is missing artistId/tier/userId metadata`)
    return null
  }

  const item = subscription.items.data[0]
  const nextBilling = item?.current_period_end ? new Date(item.current_period_end * 1000) : null
  const amount = (item?.price.unit_amount ?? 0) / 100
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const data = {
    tier: normalizeTier(tier),
    status: mapStripeSubscriptionStatus(subscription.status),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    priceId: item?.price.id,
    amount,
    currency: subscription.currency,
    nextBilling,
  }

  return prisma.creatorSubscription.upsert({
    where: { subscriberId_creatorId: { subscriberId: userId, creatorId: artistId } },
    update: data,
    create: { subscriberId: userId, creatorId: artistId, ...data },
  })
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) return
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
  if (!subscriptionId) {
    console.error(`checkout.session.completed ${session.id} is subscription mode but has no subscription`)
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await upsertCreatorSubscriptionFromStripe(subscription)
  // Revenue ledger entries for the initial charge and every renewal are
  // recorded uniformly in handleInvoicePaid, since Stripe fires invoice.paid
  // for both — no need to special-case the first payment here.
}

// One row per (track/album purchase) x (payment). Handles both the initial
// checkout and any subsequent renewal invoice the same way.
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!stripe) return

  const subscriptionRef = invoice.parent?.subscription_details?.subscription
  const stripeSubscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id
  if (!stripeSubscriptionId) return // not a subscription invoice

  let creatorSubscription = await prisma.creatorSubscription.findFirst({ where: { stripeSubscriptionId } })
  if (!creatorSubscription) {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    creatorSubscription = await upsertCreatorSubscriptionFromStripe(subscription)
  }
  if (!creatorSubscription) return

  const amount = (invoice.amount_paid ?? 0) / 100
  if (amount <= 0) return

  // Invoice IDs are stable and unique per billing event (initial charge and
  // every renewal each get their own), so they double as our idempotency
  // key here — simpler than chasing the underlying charge/PaymentIntent id
  // through the newer Invoice.payments relation, which needs its own
  // expand.
  const dedupeKey = invoice.id
  const subscription = creatorSubscription

  await prisma.$transaction(async (tx) => {
    if (dedupeKey) {
      const alreadyRecorded = await hasLedgerEntryForPaymentIntent(tx, dedupeKey, 'SUBSCRIPTION_PAYMENT')
      if (alreadyRecorded) return
    }

    await recordCreatorEarning(tx, {
      creatorId: subscription.creatorId,
      type: 'SUBSCRIPTION_PAYMENT',
      grossAmount: amount,
      currency: invoice.currency,
      subscriptionId: subscription.id,
      stripePaymentIntentId: dedupeKey,
      description: `${subscription.tier} subscription payment (${invoice.billing_reason || 'invoice'})`,
    })

    await tx.creatorSubscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    })
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription
  const stripeSubscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id
  if (!stripeSubscriptionId) return

  await prisma.creatorSubscription.updateMany({
    where: { stripeSubscriptionId },
    data: { status: 'PAST_DUE' },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.creatorSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELLED', endDate: new Date() },
  })
}

async function recordTrackOrAlbumPurchase(opts: {
  kind: 'track' | 'album'
  refId: string
  userId: string
  amount: number
  sessionId: string
  paymentIntentId?: string
}) {
  const { kind, refId, userId, amount, sessionId, paymentIntentId } = opts

  const owner = kind === 'track'
    ? await prisma.track.findUnique({ where: { id: refId }, select: { ownerId: true, title: true } })
    : await prisma.album.findUnique({ where: { id: refId }, select: { ownerId: true, title: true } })

  if (!owner) {
    console.error(`${kind} ${refId} referenced by checkout session ${sessionId} was not found`)
    return
  }

  await prisma.$transaction(async (tx) => {
    if (paymentIntentId) {
      const existing = await tx.purchase.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
      if (existing) return
    }

    const purchase = await tx.purchase.create({
      data: {
        userId,
        trackId: kind === 'track' ? refId : undefined,
        albumId: kind === 'album' ? refId : undefined,
        amount,
        stripeSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
        status: 'COMPLETED',
      },
    })

    await recordCreatorEarning(tx, {
      creatorId: owner.ownerId,
      type: kind === 'track' ? 'TRACK_PURCHASE' : 'ALBUM_PURCHASE',
      grossAmount: amount,
      purchaseId: purchase.id,
      stripePaymentIntentId: paymentIntentId,
      description: `${kind === 'track' ? 'Track' : 'Album'} purchase: ${owner.title}`,
    })
  })
}

async function handlePaymentCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) return
  const userId = session.metadata?.userId
  if (!userId) {
    console.error(`checkout.session.completed ${session.id} (payment mode) is missing userId metadata`)
    return
  }

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
    limit: 100,
  })

  for (const item of lineItems.data) {
    const product = item.price?.product
    if (!product || typeof product === 'string' || 'deleted' in product) continue

    const { kind, refId } = product.metadata || {}
    const amount = (item.amount_total ?? 0) / 100
    if (!refId || amount <= 0) continue

    if (kind === 'track' || kind === 'album') {
      await recordTrackOrAlbumPurchase({ kind, refId, userId, amount, sessionId: session.id, paymentIntentId })
    } else {
      // Shop merchandise purchased through the generic cart isn't
      // reconciled into an Order here: no pending Order row exists to
      // attach it to (the cart/checkout UI that would create one ahead of
      // payment hasn't been built), and merch isn't part of the creator
      // RevenueLedger in this schema. Flagged rather than silently dropped.
      console.log(`checkout.session.completed ${session.id}: no reconciliation for line item kind="${kind || 'unknown'}" (shop/product purchases aren't wired to Order records yet)`)
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription') {
    await handleSubscriptionCheckoutCompleted(session)
  } else if (session.mode === 'payment') {
    await handlePaymentCheckoutCompleted(session)
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  await prisma.creatorProfile.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
    },
  })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return

  const purchase = await prisma.purchase.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
  if (!purchase || purchase.status === 'REFUNDED') return

  const refundAmount = (charge.amount_refunded ?? 0) / 100
  if (refundAmount <= 0) return

  const earningEntry = await prisma.revenueLedger.findFirst({
    where: { purchaseId: purchase.id, type: { in: ['TRACK_PURCHASE', 'ALBUM_PURCHASE'] } },
  })
  if (!earningEntry) return

  await prisma.$transaction(async (tx) => {
    await tx.purchase.update({ where: { id: purchase.id }, data: { status: 'REFUNDED' } })
    await recordRefund(tx, {
      creatorId: earningEntry.creatorId,
      amount: refundAmount,
      purchaseId: purchase.id,
      stripePaymentIntentId: paymentIntentId,
      description: 'Refund issued',
    })
  })
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhooks are not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.updated':
        await upsertCreatorSubscriptionFromStripe(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
      default:
        // Unhandled event type — acknowledge so Stripe doesn't retry it.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, error)
    // 500 so Stripe retries — the failure is ours (e.g. a DB hiccup), not a
    // malformed or unexpected event.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
