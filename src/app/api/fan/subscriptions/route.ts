import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCreatorTiers, type TierKey } from '@/lib/tiers'

// A fan's own creator subscriptions, with the creator's current (possibly
// customized) tier display name resolved via getCreatorTiers rather than a
// static lookup, so a renamed tier shows its current name here too.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptions = await prisma.creatorSubscription.findMany({
    where: { subscriberId: session.user.id },
    include: {
      creator: {
        select: { id: true, name: true, username: true, avatar: true, isVerified: true },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  const tiersByCreator = new Map<string, Awaited<ReturnType<typeof getCreatorTiers>>>()
  for (const sub of subscriptions) {
    if (!tiersByCreator.has(sub.creatorId)) {
      tiersByCreator.set(sub.creatorId, await getCreatorTiers(sub.creatorId))
    }
  }

  return NextResponse.json({
    subscriptions: subscriptions.map((sub) => {
      const creatorTiers = tiersByCreator.get(sub.creatorId) || []
      const tierKey = sub.tier.toLowerCase() as TierKey
      const resolved = creatorTiers.find((t) => t.id === tierKey)
      return {
        id: sub.id,
        creatorId: sub.creator.id,
        creatorName: sub.creator.name || sub.creator.username,
        creatorAvatar: sub.creator.avatar,
        creatorVerified: sub.creator.isVerified,
        tierName: resolved?.name || sub.tier,
        amount: Number(sub.amount),
        currency: sub.currency,
        status: sub.status,
        startDate: sub.startDate,
        nextBilling: sub.nextBilling,
        endDate: sub.endDate,
      }
    }),
  })
}
