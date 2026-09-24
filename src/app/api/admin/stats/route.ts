import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ActivityItem {
  id: string
  message: string
  createdAt: Date
}

// Real platform overview stats + a merged recent-activity feed from actual
// signups, track uploads, and creator applications (no fabricated
// "active users"/engagement numbers - nothing in the app tracks those yet).
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const [totalUsers, totalCreators, totalTracks, totalPlays, pendingApplications, recentUsers, recentTrackEvents, recentApplications] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isCreator: true } }),
      prisma.track.count(),
      prisma.event.count({ where: { type: 'track.played' } }),
      prisma.creatorApplication.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        select: { id: true, name: true, username: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.event.findMany({
        where: { type: 'track.uploaded' },
        select: {
          id: true,
          createdAt: true,
          track: { select: { title: true, owner: { select: { name: true, username: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.creatorApplication.findMany({
        select: { id: true, artistName: true, status: true, createdAt: true, reviewedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  const activity: ActivityItem[] = [
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      message: `New user registered: ${u.name || u.username}`,
      createdAt: u.createdAt,
    })),
    ...recentTrackEvents
      .filter((e) => e.track)
      .map((e) => ({
        id: `track-${e.id}`,
        message: `New track uploaded: "${e.track!.title}" by ${e.track!.owner.name || e.track!.owner.username}`,
        createdAt: e.createdAt,
      })),
    ...recentApplications.map((a) => ({
      id: `application-${a.id}`,
      message: a.status === 'PENDING'
        ? `Creator application submitted by ${a.artistName}`
        : `Creator application ${a.status.toLowerCase()}: ${a.artistName}`,
      createdAt: a.reviewedAt || a.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)

  return NextResponse.json({
    stats: {
      totalUsers,
      totalCreators,
      totalTracks,
      totalPlays,
      pendingApplications,
    },
    recentActivity: activity,
  })
}
