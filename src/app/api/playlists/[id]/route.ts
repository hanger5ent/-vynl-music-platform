import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get playlist details with tracks
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const playlistId = params.id

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        owner: { select: { id: true, name: true, username: true, avatar: true } },
        tracks: {
          orderBy: { position: 'asc' },
          include: {
            track: {
              select: {
                id: true, title: true, slug: true, duration: true, audioUrl: true,
                genre: true, price: true, isFree: true, playCount: true, processingStatus: true,
                owner: { select: { id: true, name: true, username: true, avatar: true } },
              },
            },
          },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const isOwner = session?.user?.id === playlist.ownerId
    if (!playlist.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        coverImage: playlist.coverImage,
        isPublic: playlist.isPublic,
        likeCount: playlist.likeCount,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        owner: playlist.owner,
        isOwner,
        trackCount: playlist.tracks.length,
        totalDuration: playlist.tracks.reduce((sum, t) => sum + t.track.duration, 0),
        tracks: playlist.tracks.map((pt) => ({
          ...pt.track,
          price: pt.track.price ? Number(pt.track.price) : null,
          position: pt.position,
          addedAt: pt.addedAt,
        })),
      },
    })

  } catch (error) {
    console.error('Failed to fetch playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}

async function assertOwnership(playlistId: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId }, select: { ownerId: true } })
  if (!playlist) return { error: 'Playlist not found', status: 404 as const }
  if (playlist.ownerId !== userId) return { error: 'You can only manage your own playlists', status: 403 as const }
  return null
}

// Update playlist
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const playlistId = params.id
    const ownership = await assertOwnership(playlistId, session.user.id)
    if (ownership) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status })
    }

    const { title, description, isPublic, coverImage } = await req.json()

    if (title !== undefined && (!title.trim() || title.length > 100)) {
      return NextResponse.json({ error: 'Playlist title must be 1-100 characters' }, { status: 400 })
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      playlist: updatedPlaylist,
      message: 'Playlist updated successfully'
    })

  } catch (error) {
    console.error('Failed to update playlist:', error)
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    )
  }
}

// Delete playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const playlistId = params.id
    const ownership = await assertOwnership(playlistId, session.user.id)
    if (ownership) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status })
    }

    await prisma.playlist.delete({ where: { id: playlistId } })

    return NextResponse.json({
      success: true,
      message: 'Playlist deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    )
  }
}
