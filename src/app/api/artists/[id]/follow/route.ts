import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Follow/unfollow an artist
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = params.id
    const { action } = await req.json()

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({
        error: 'Action must be "follow" or "unfollow"'
      }, { status: 400 })
    }

    if (artistId === session.user.id) {
      return NextResponse.json({
        error: 'Cannot follow yourself'
      }, { status: 400 })
    }

    const artist = await prisma.user.findUnique({ where: { id: artistId }, select: { id: true } })
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    const key = { followerId_followingId: { followerId: session.user.id, followingId: artistId } }

    if (action === 'follow') {
      await prisma.follow.upsert({
        where: key,
        update: {},
        create: { followerId: session.user.id, followingId: artistId },
      })
    } else {
      await prisma.follow.deleteMany({ where: { followerId: session.user.id, followingId: artistId } })
    }

    const followerCount = await prisma.follow.count({ where: { followingId: artistId } })
    const following = action === 'follow'

    return NextResponse.json({
      success: true,
      following,
      followerCount,
      message: following ? 'Successfully followed artist' : 'Successfully unfollowed artist'
    })

  } catch (error) {
    console.error('Failed to follow/unfollow artist:', error)
    return NextResponse.json(
      { error: 'Failed to follow/unfollow artist' },
      { status: 500 }
    )
  }
}

// Get follow status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const artistId = params.id

    const followerCount = await prisma.follow.count({ where: { followingId: artistId } })

    if (!session?.user) {
      return NextResponse.json({ following: false, followerCount })
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: artistId } },
      select: { id: true },
    })

    return NextResponse.json({
      following: !!existing,
      followerCount
    })

  } catch (error) {
    console.error('Failed to get follow status:', error)
    return NextResponse.json(
      { error: 'Failed to get follow status' },
      { status: 500 }
    )
  }
}
