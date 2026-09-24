import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const userSelect = { id: true, name: true, username: true, avatar: true } as const

// Get comments for a track — top-level comments, each with its replies
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id
    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 50)

    const where = { trackId, parentId: null }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        select: {
          id: true, content: true, createdAt: true, updatedAt: true, userId: true,
          user: { select: userSelect },
          replies: {
            orderBy: { createdAt: 'asc' },
            select: { id: true, content: true, createdAt: true, updatedAt: true, userId: true, user: { select: userSelect } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    return NextResponse.json({
      comments: comments.map((c) => ({ ...c, text: c.content })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// Add a comment (or, with parentId, a reply) to a track
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
    const { text, parentId } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        error: 'Comment text is required'
      }, { status: 400 })
    }

    if (text.length > 500) {
      return NextResponse.json({
        error: 'Comment must be 500 characters or less'
      }, { status: 400 })
    }

    const track = await prisma.track.findUnique({ where: { id: trackId }, select: { id: true } })
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { trackId: true, parentId: true } })
      if (!parent || parent.trackId !== trackId) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
      if (parent.parentId) {
        return NextResponse.json({ error: 'Replies can only be one level deep' }, { status: 400 })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: text.trim(),
        trackId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      select: {
        id: true, content: true, createdAt: true, updatedAt: true, userId: true,
        user: { select: userSelect },
      },
    })

    return NextResponse.json({
      success: true,
      comment: { ...comment, text: comment.content, replies: [] },
      message: parentId ? 'Reply added successfully' : 'Comment added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to add comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
