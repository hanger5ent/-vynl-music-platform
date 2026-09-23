import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// The signed-in user's follows — creators and regular users, split for the UI
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const follows = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        following: {
          select: {
            id: true, name: true, username: true, avatar: true, isCreator: true, isVerified: true,
            creatorProfile: { select: { genre: true } },
            _count: { select: { followers: true, tracks: true, playlists: true } },
          },
        },
      },
    })

    const artists = follows
      .filter((f) => f.following.isCreator)
      .map((f) => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        avatar: f.following.avatar,
        isVerified: f.following.isVerified,
        genre: f.following.creatorProfile?.genre || [],
        followerCount: f.following._count.followers,
        trackCount: f.following._count.tracks,
        followedAt: f.createdAt,
      }))

    const users = follows
      .filter((f) => !f.following.isCreator)
      .map((f) => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        avatar: f.following.avatar,
        playlistCount: f.following._count.playlists,
        followedAt: f.createdAt,
      }))

    return NextResponse.json({ artists, users })

  } catch (error) {
    console.error('Failed to fetch follows:', error)
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 })
  }
}
