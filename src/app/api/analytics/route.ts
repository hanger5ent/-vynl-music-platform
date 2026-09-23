import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TIMEFRAME_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function bucketByDay<T>(rows: T[], getDate: (row: T) => Date, getValue: (row: T) => number, start: Date, end: Date) {
  const buckets = new Map<string, number>()
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    buckets.set(dateKey(d), 0)
  }
  for (const row of rows) {
    const key = dateKey(getDate(row))
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + getValue(row))
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }))
}

function percentGrowth(current: number, prior: number) {
  if (prior === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prior) / prior) * 1000) / 10
}

// Real creator analytics — derived from Track.playCount/likeCount, Follow,
// and RevenueLedger. Deliberately has no geography/age-demographics section:
// this platform doesn't collect that data anywhere, so it isn't fabricated
// here the way the old mock response did.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    const userId = searchParams.get('userId') || session.user.id
    const days = TIMEFRAME_DAYS[timeframe] || 30

    if (userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { isCreator: true } })
    if (!targetUser?.isCreator) {
      return NextResponse.json({ error: 'Analytics are only available for creator accounts' }, { status: 400 })
    }

    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - days)
    const priorPeriodStart = new Date(periodStart)
    priorPeriodStart.setDate(priorPeriodStart.getDate() - days)

    const tracks = await prisma.track.findMany({
      where: { ownerId: userId },
      select: { id: true, title: true, playCount: true, likeCount: true },
    })
    const trackIds = tracks.map((t) => t.id)

    const [
      currentPlays, priorPlays,
      currentLikes, priorLikes,
      currentFollowers, priorFollowers,
      currentRevenue, priorRevenue,
      totalRevenueAgg,
      chartPlayEvents,
      chartRevenueEntries,
      trackPurchaseRevenue,
    ] = await Promise.all([
      prisma.event.count({ where: { trackId: { in: trackIds }, type: 'track.played', createdAt: { gte: periodStart } } }),
      prisma.event.count({ where: { trackId: { in: trackIds }, type: 'track.played', createdAt: { gte: priorPeriodStart, lt: periodStart } } }),
      prisma.like.count({ where: { trackId: { in: trackIds }, createdAt: { gte: periodStart } } }),
      prisma.like.count({ where: { trackId: { in: trackIds }, createdAt: { gte: priorPeriodStart, lt: periodStart } } }),
      prisma.follow.count({ where: { followingId: userId, createdAt: { gte: periodStart } } }),
      prisma.follow.count({ where: { followingId: userId, createdAt: { gte: priorPeriodStart, lt: periodStart } } }),
      prisma.revenueLedger.aggregate({ where: { creatorId: userId, createdAt: { gte: periodStart } }, _sum: { amount: true } }),
      prisma.revenueLedger.aggregate({ where: { creatorId: userId, createdAt: { gte: priorPeriodStart, lt: periodStart } }, _sum: { amount: true } }),
      prisma.revenueLedger.aggregate({ where: { creatorId: userId }, _sum: { amount: true } }),
      prisma.event.findMany({
        where: { trackId: { in: trackIds }, type: 'track.played', createdAt: { gte: periodStart } },
        select: { createdAt: true },
      }),
      prisma.revenueLedger.findMany({
        where: { creatorId: userId, createdAt: { gte: periodStart } },
        select: { createdAt: true, amount: true },
      }),
      prisma.revenueLedger.findMany({
        where: { creatorId: userId, type: 'TRACK_PURCHASE', purchase: { trackId: { in: trackIds } } },
        select: { amount: true, purchase: { select: { trackId: true } } },
      }),
    ])

    const revenueByTrack = new Map<string, number>()
    for (const entry of trackPurchaseRevenue) {
      const trackId = entry.purchase?.trackId
      if (!trackId) continue
      revenueByTrack.set(trackId, (revenueByTrack.get(trackId) || 0) + Number(entry.amount))
    }

    const topTracks = [...tracks]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        plays: t.playCount,
        likes: t.likeCount,
        revenue: Math.round((revenueByTrack.get(t.id) || 0) * 100) / 100,
      }))

    return NextResponse.json({
      analytics: {
        overview: {
          totalPlays: tracks.reduce((sum, t) => sum + t.playCount, 0),
          totalLikes: tracks.reduce((sum, t) => sum + t.likeCount, 0),
          totalFollowers: await prisma.follow.count({ where: { followingId: userId } }),
          totalRevenue: Number(totalRevenueAgg._sum.amount || 0),
          growthMetrics: {
            playsGrowth: percentGrowth(currentPlays, priorPlays),
            likesGrowth: percentGrowth(currentLikes, priorLikes),
            followersGrowth: percentGrowth(currentFollowers, priorFollowers),
            revenueGrowth: percentGrowth(Number(currentRevenue._sum.amount || 0), Number(priorRevenue._sum.amount || 0)),
          },
        },
        chartData: {
          plays: bucketByDay(chartPlayEvents, (e) => e.createdAt, () => 1, periodStart, now),
          revenue: bucketByDay(chartRevenueEntries, (e) => e.createdAt, (e) => Number(e.amount), periodStart, now),
        },
        topTracks,
        timeframe,
        lastUpdated: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
