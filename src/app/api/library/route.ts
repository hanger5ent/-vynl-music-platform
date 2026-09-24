import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// The signed-in user's liked tracks — "My Library"
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const likes = await prisma.like.findMany({
      where: { userId: session.user.id, trackId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        track: {
          select: {
            id: true, title: true, slug: true, duration: true, audioUrl: true,
            genre: true, processingStatus: true,
            owner: { select: { id: true, name: true, username: true, avatar: true } },
            album: { select: { id: true, title: true } },
          },
        },
      },
    })

    const tracks = likes
      .filter((l) => l.track && l.track.processingStatus === 'READY')
      .map((l) => ({ ...l.track, likedAt: l.createdAt }))

    return NextResponse.json({
      tracks,
      totalDuration: tracks.reduce((sum, t) => sum + (t!.duration || 0), 0),
    })

  } catch (error) {
    console.error('Failed to fetch library:', error)
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 })
  }
}
