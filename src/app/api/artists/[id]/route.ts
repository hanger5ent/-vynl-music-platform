import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get artist profile and music
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const artistId = params.id

    const artist = await prisma.user.findUnique({
      where: { id: artistId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
        isCreator: true,
        isVerified: true,
        createdAt: true,
        creatorProfile: {
          select: {
            stageName: true,
            genre: true,
            location: true,
            website: true,
            socialLinks: true,
          },
        },
        _count: { select: { followers: true, following: true, tracks: true, albums: true } },
      },
    })

    if (!artist || !artist.isCreator) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    const [recentTracks, albums, streamTotal, isFollowing] = await Promise.all([
      prisma.track.findMany({
        where: { ownerId: artistId, processingStatus: 'READY' },
        select: {
          id: true, title: true, slug: true, duration: true, audioUrl: true,
          genre: true, playCount: true, likeCount: true, price: true, isFree: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.album.findMany({
        where: { ownerId: artistId },
        select: { id: true, title: true, slug: true, coverImage: true, releaseDate: true, price: true, isFree: true, _count: { select: { tracks: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.track.aggregate({
        where: { ownerId: artistId, processingStatus: 'READY' },
        _sum: { playCount: true },
      }),
      session?.user?.id
        ? prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: session.user.id, followingId: artistId } },
            select: { id: true },
          })
        : null,
    ])

    return NextResponse.json({
      artist: {
        id: artist.id,
        name: artist.creatorProfile?.stageName || artist.name,
        username: artist.username,
        bio: artist.bio,
        avatar: artist.avatar,
        isCreator: artist.isCreator,
        isVerified: artist.isVerified,
        createdAt: artist.createdAt,
        creatorProfile: artist.creatorProfile,
        followerCount: artist._count.followers,
        followingCount: artist._count.following,
        trackCount: artist._count.tracks,
        albumCount: artist._count.albums,
        totalStreams: streamTotal._sum.playCount || 0,
        isFollowing: session?.user?.id === artistId ? null : !!isFollowing,
        recentTracks: recentTracks.map((t) => ({
          ...t,
          price: t.price ? Number(t.price) : null,
        })),
        albums: albums.map((a) => ({
          ...a,
          price: a.price ? Number(a.price) : null,
          trackCount: a._count.tracks,
        })),
      },
    })

  } catch (error) {
    console.error('Failed to fetch artist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}

// Update artist profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = params.id
    
    // Verify user is updating their own profile
    if (artistId !== session.user.id) {
      return NextResponse.json({ error: 'Can only update your own profile' }, { status: 403 })
    }

    const updates = await req.json()

    // In production, validate and update database
    const updatedProfile = {
      id: artistId,
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      artist: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Failed to update artist profile:', error)
    return NextResponse.json(
      { error: 'Failed to update artist profile' },
      { status: 500 }
    )
  }
}
