import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCreatorTiers, TIER_KEYS, type TierKey } from '@/lib/tiers'
import { getPlatformFeePercent } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe is not configured' 
      }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { artistId, tier, returnUrl } = body

    if (!artistId || !tier || !TIER_KEYS.includes(tier as TierKey)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const creatorTiers = await getCreatorTiers(artistId)
    const tierConfig = creatorTiers.find((t) => t.id === tier)
    if (!tierConfig || !tierConfig.isActive) {
      return NextResponse.json({ error: 'This subscription tier is not available' }, { status: 400 })
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: artistId } })
    if (!creatorProfile?.stripeAccountId || !creatorProfile.stripeChargesEnabled) {
      return NextResponse.json({
        error: 'This creator hasn\'t finished setting up payouts yet, so they can\'t accept subscriptions.'
      }, { status: 400 })
    }
    const creatorStripeAccountId = creatorProfile.stripeAccountId

    // Create or get customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: session.user.email!,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: session.user.email!,
          name: session.user.name!,
          metadata: {
            userId: session.user.id || '',
            userType: 'fan',
          },
        })
      }
    } catch (error) {
      console.error('Error with customer:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Create or get price. The lookup key is versioned by price-in-cents so
    // that editing a tier's price (creator-set, can change any time) always
    // resolves to a fresh Stripe Price rather than a stale cached one —
    // Stripe prices are immutable once created.
    const lookupKey = `${tier}_${artistId}_${tierConfig.price}`
    let price
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        limit: 1,
      })

      if (prices.data.length > 0) {
        price = prices.data[0]
      } else {
        // Create product first
        const product = await stripe.products.create({
          name: `${tierConfig.name} - Artist ${artistId}`,
          description: `${tierConfig.name} subscription for artist ${artistId}`,
          metadata: {
            artistId,
            tier,
          },
        })

        // Create price
        price = await stripe.prices.create({
          unit_amount: tierConfig.price,
          currency: 'usd',
          recurring: {
            interval: tierConfig.interval as 'month' | 'year',
          },
          product: product.id,
          lookup_key: lookupKey,
          metadata: {
            artistId,
            tier,
          },
        })
      }
    } catch (error) {
      console.error('Error creating price:', error)
      return NextResponse.json({ error: 'Failed to create price' }, { status: 500 })
    }

    const platformFeePercent = await getPlatformFeePercent()

    // Create checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl || process.env.NEXTAUTH_URL}/fan?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || process.env.NEXTAUTH_URL}/artist/${artistId}/subscribe?canceled=true`,
        metadata: {
          artistId,
          tier,
          userId: session.user.id || '',
        },
        subscription_data: {
          metadata: {
            artistId,
            tier,
            userId: session.user.id || '',
          },
          application_fee_percent: platformFeePercent,
          transfer_data: {
            destination: creatorStripeAccountId,
          },
        },
      })

      return NextResponse.json({ 
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      })

    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
