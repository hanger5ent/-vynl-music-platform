import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Current Connect status for the signed-in creator. Re-fetches from Stripe
// (rather than trusting our cached booleans) so the page is accurate right
// after the creator returns from onboarding, before any account.updated
// webhook has necessarily arrived.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators have payout settings' }, { status: 403 })
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })

    if (!creatorProfile?.stripeAccountId) {
      return NextResponse.json({ connected: false })
    }

    if (!stripe) {
      return NextResponse.json({
        connected: true,
        chargesEnabled: creatorProfile.stripeChargesEnabled,
        payoutsEnabled: creatorProfile.stripePayoutsEnabled,
        detailsSubmitted: creatorProfile.stripeDetailsSubmitted,
      })
    }

    const account = await stripe.accounts.retrieve(creatorProfile.stripeAccountId)

    const updated = await prisma.creatorProfile.update({
      where: { userId: session.user.id },
      data: {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeDetailsSubmitted: account.details_submitted,
      },
    })

    return NextResponse.json({
      connected: true,
      chargesEnabled: updated.stripeChargesEnabled,
      payoutsEnabled: updated.stripePayoutsEnabled,
      detailsSubmitted: updated.stripeDetailsSubmitted,
      requirementsDue: account.requirements?.currently_due || [],
    })

  } catch (error) {
    console.error('Failed to fetch Stripe Connect status:', error)
    return NextResponse.json({ error: 'Failed to fetch payout status' }, { status: 500 })
  }
}
