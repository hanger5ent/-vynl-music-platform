import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get specific track
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true, isVerified: true, bio: true }
        },
        album: {
          select: { id: true, title: true, coverImage: true }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } }
          }
        },
        _count: { select: { likes: true, comments: true } },
      },
    })

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    return NextResponse.json({ track })

  } catch (error) {
    console.error('Failed to fetch track:', error)
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    )
  }
}

// Update track (owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.track.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own tracks' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, genre, tags, price, lyrics } = body

    const track = await prisma.track.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(genre !== undefined ? { genre } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(lyrics !== undefined ? { lyrics } : {}),
        ...(price !== undefined ? { price: price > 0 ? price : null, isFree: !price || price <= 0 } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      track,
      message: 'Track updated successfully'
    })

  } catch (error) {
    console.error('Failed to update track:', error)
    return NextResponse.json(
      { error: 'Failed to update track' },
      { status: 500 }
    )
  }
}

// Delete track (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.track.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own tracks' }, { status: 403 })
    }

    await prisma.track.delete({ where: { id: params.id } })

    return NextResponse.json({
      success: true,
      message: 'Track deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete track:', error)
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    )
  }
}
