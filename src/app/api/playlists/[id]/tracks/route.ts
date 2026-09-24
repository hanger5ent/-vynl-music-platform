import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function assertOwnership(playlistId: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId }, select: { ownerId: true } })
  if (!playlist) return { error: 'Playlist not found', status: 404 as const }
  if (playlist.ownerId !== userId) return { error: 'You can only manage your own playlists', status: 403 as const }
  return null
}

// Add track to playlist
export async function POST(
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

    const { trackId } = await req.json()
    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 })
    }

    const track = await prisma.track.findUnique({ where: { id: trackId }, select: { id: true, processingStatus: true } })
    if (!track || track.processingStatus !== 'READY') {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    const existing = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId, trackId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Track is already in this playlist' }, { status: 409 })
    }

    const lastPosition = await prisma.playlistTrack.aggregate({
      where: { playlistId },
      _max: { position: true },
    })

    const playlistTrack = await prisma.$transaction([
      prisma.playlistTrack.create({
        data: {
          playlistId,
          trackId,
          position: (lastPosition._max.position ?? 0) + 1,
        },
      }),
      prisma.playlist.update({ where: { id: playlistId }, data: { updatedAt: new Date() } }),
    ])

    return NextResponse.json({
      success: true,
      playlistTrack: playlistTrack[0],
      message: 'Track added to playlist successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to add track to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    )
  }
}

// Remove track from playlist
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

    const { searchParams } = new URL(req.url)
    const trackId = searchParams.get('trackId')

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 })
    }

    await prisma.playlistTrack.deleteMany({ where: { playlistId, trackId } })

    return NextResponse.json({
      success: true,
      message: 'Track removed from playlist successfully'
    })

  } catch (error) {
    console.error('Failed to remove track from playlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove track from playlist' },
      { status: 500 }
    )
  }
}

// Reorder tracks in playlist
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

    const { trackOrders } = await req.json()

    if (!Array.isArray(trackOrders)) {
      return NextResponse.json({
        error: 'Track orders must be an array'
      }, { status: 400 })
    }

    await prisma.$transaction(
      trackOrders.map((t: { trackId: string; position: number }) =>
        prisma.playlistTrack.updateMany({
          where: { playlistId, trackId: t.trackId },
          data: { position: t.position },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Playlist tracks reordered successfully'
    })

  } catch (error) {
    console.error('Failed to reorder playlist tracks:', error)
    return NextResponse.json(
      { error: 'Failed to reorder playlist tracks' },
      { status: 500 }
    )
  }
}
