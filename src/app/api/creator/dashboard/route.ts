import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SUBSCRIPTION_TIERS, PLATFORM_FEE_PERCENT } from '@/lib/stripe'

type TierKey = keyof typeof SUBSCRIPTION_TIERS
const TIER_KEYS = Object.keys(SUBSCRIPTION_TIERS) as TierKey[]

// Everything the creator dashboard's Overview/Subscriptions tabs need,
// computed from real data: CreatorSubscription for tiers, RevenueLedger for
// revenue. (The Subscribers tab has its own dedicated /api/creator/subscribers
// endpoint.) Tiers themselves (name/price/features) are still the fixed
// platform-wide three (see SUBSCRIPTION_TIERS) — creators can't yet define
// custom tiers, so this reports on those three rather than pretending
// per-creator tiers exist.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators have a dashboard' }, { status: 403 })
    }

    const creatorId = session.user.id

    const [subscriptions, trackCount, playCountAgg, revenueByType, totalRevenueAgg] = await Promise.all([
      prisma.creatorSubscription.findMany({
        where: { creatorId },
        select: { id: true, tier: true, status: true, amount: true },
      }),
      prisma.track.count({ where: { ownerId: creatorId } }),
      prisma.track.aggregate({ where: { ownerId: creatorId }, _sum: { playCount: true } }),
      prisma.revenueLedger.groupBy({
        by: ['type'],
        where: { creatorId, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.revenueLedger.aggregate({ where: { creatorId }, _sum: { amount: true } }),
    ])

    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE')
    const cancelledSubs = subscriptions.filter((s) => s.status === 'CANCELLED')
    const monthlyRecurringRevenue = activeSubs.reduce((sum, s) => sum + Number(s.amount), 0)

    const tiers = TIER_KEYS.map((key) => {
      const config = SUBSCRIPTION_TIERS[key]
      const tierActiveSubs = activeSubs.filter((s) => s.tier === key.toUpperCase())
      return {
        id: key,
        name: config.name,
        price: config.price / 100,
        interval: config.interval,
        features: config.features,
        subscriberCount: tierActiveSubs.length,
        monthlyRevenue: tierActiveSubs.reduce((sum, s) => sum + Number(s.amount), 0),
      }
    })

    const grossByType = new Map(revenueByType.map((r) => [r.type, Number(r._sum.amount || 0)]))
    const netFactor = 1 - PLATFORM_FEE_PERCENT / 100
    // Gross-earned breakdown by category (not adjusted for later refunds —
    // totalRevenue below is the refund-and-fee-accurate figure).
    const revenueBreakdown = {
      subscriptions: (grossByType.get('SUBSCRIPTION_PAYMENT') || 0) * netFactor,
      trackSales: ((grossByType.get('TRACK_PURCHASE') || 0) + (grossByType.get('ALBUM_PURCHASE') || 0)) * netFactor,
      merchandise: (grossByType.get('PRODUCT_PURCHASE') || 0) * netFactor,
    }

    const subscriberCancellationDenominator = activeSubs.length + cancelledSubs.length
    const cancellationRate = subscriberCancellationDenominator > 0
      ? Math.round((cancelledSubs.length / subscriberCancellationDenominator) * 1000) / 10
      : 0

    return NextResponse.json({
      overview: {
        totalSubscribers: activeSubs.length,
        monthlyRecurringRevenue,
        totalRevenue: Number(totalRevenueAgg._sum.amount || 0),
        totalTracks: trackCount,
        totalPlays: playCountAgg._sum.playCount || 0,
      },
      revenueBreakdown,
      tiers,
      analytics: {
        arpu: activeSubs.length > 0 ? Math.round((monthlyRecurringRevenue / activeSubs.length) * 100) / 100 : 0,
        cancellationRate,
      },
    })

  } catch (error) {
    console.error('Failed to fetch creator dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch creator dashboard' }, { status: 500 })
  }
}
