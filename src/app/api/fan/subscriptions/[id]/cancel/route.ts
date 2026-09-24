import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await prisma.creatorSubscription.findUnique({ where: { id: params.id } })
  if (!subscription || subscription.subscriberId !== session.user.id) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }
  if (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE') {
    return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 })
  }

  if (subscription.stripeSubscriptionId) {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    } catch (error) {
      console.error('Failed to cancel Stripe subscription:', error)
      return NextResponse.json({ error: 'Failed to cancel subscription with Stripe' }, { status: 500 })
    }
  }

  // Cancel locally right away rather than waiting on the webhook, so the
  // fan sees the change immediately even if the webhook is delayed or (in
  // local dev) not configured at all.
  const updated = await prisma.creatorSubscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED', endDate: new Date() },
  })

  return NextResponse.json({ subscription: updated })
}
