import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Creates (if needed) a Stripe Connect Express account for the signed-in
// creator and returns a fresh onboarding link. Call this again any time —
// Account Links expire quickly and are single-use, so "continue onboarding"
// and "refresh an expired link" both just call this endpoint again.
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators can set up payouts' }, { status: 403 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin

    let creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })

    let accountId = creatorProfile?.stripeAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: session.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { userId: session.user.id },
      })
      accountId = account.id

      creatorProfile = await prisma.creatorProfile.upsert({
        where: { userId: session.user.id },
        update: { stripeAccountId: accountId },
        create: { userId: session.user.id, stripeAccountId: accountId },
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/creator/payouts?refresh=true`,
      return_url: `${baseUrl}/creator/payouts?onboarding=complete`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })

  } catch (error) {
    console.error('Failed to start Stripe Connect onboarding:', error)
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 })
  }
}
