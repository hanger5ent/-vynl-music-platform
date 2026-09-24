import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Toggle like on a track
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trackId = params.id
    const userId = session.user.id

    const track = await prisma.track.findUnique({ where: { id: trackId }, select: { id: true } })
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    const existing = await prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId } },
    })

    let liked: boolean
    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.track.update({ where: { id: trackId }, data: { likeCount: { decrement: 1 } } }),
      ])
      liked = false
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId, trackId } }),
        prisma.track.update({ where: { id: trackId }, data: { likeCount: { increment: 1 } } }),
      ])
      liked = true
    }

    const updated = await prisma.track.findUnique({ where: { id: trackId }, select: { likeCount: true } })

    return NextResponse.json({
      success: true,
      liked,
      likeCount: updated?.likeCount ?? 0,
      message: liked ? 'Track liked' : 'Track unliked'
    })

  } catch (error) {
    console.error('Failed to toggle like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// Get like status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const trackId = params.id

    const track = await prisma.track.findUnique({ where: { id: trackId }, select: { likeCount: true } })
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    if (!session?.user) {
      return NextResponse.json({ liked: false, likeCount: track.likeCount })
    }

    const existing = await prisma.like.findUnique({
      where: { userId_trackId: { userId: session.user.id, trackId } },
      select: { id: true },
    })

    return NextResponse.json({
      liked: !!existing,
      likeCount: track.likeCount
    })

  } catch (error) {
    console.error('Failed to get like status:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}
