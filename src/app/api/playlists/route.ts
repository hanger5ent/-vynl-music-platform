import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get the signed-in user's playlists, or another user's public playlists via ?ownerId=
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get('ownerId')

    if (!session?.user && !ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetOwnerId = ownerId || session!.user.id
    const isOwnProfile = session?.user?.id === targetOwnerId

    const playlists = await prisma.playlist.findMany({
      where: {
        ownerId: targetOwnerId,
        ...(isOwnProfile ? {} : { isPublic: true }),
      },
      include: {
        tracks: { select: { track: { select: { duration: true } } } },
        _count: { select: { tracks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      playlists: playlists.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        coverImage: p.coverImage,
        isPublic: p.isPublic,
        trackCount: p._count.tracks,
        totalDuration: p.tracks.reduce((sum, t) => sum + t.track.duration, 0),
        likeCount: p.likeCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    })

  } catch (error) {
    console.error('Failed to fetch playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
}

// Create a new playlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, isPublic, coverImage } = await req.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json({
        error: 'Playlist title is required'
      }, { status: 400 })
    }

    if (title.length > 100) {
      return NextResponse.json({
        error: 'Playlist title must be 100 characters or less'
      }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        isPublic: isPublic !== false,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      playlist: { ...playlist, trackCount: 0, totalDuration: 0 },
      message: 'Playlist created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}
