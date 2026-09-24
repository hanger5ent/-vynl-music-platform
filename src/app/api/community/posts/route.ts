import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
})

// List forum posts, optionally filtered by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const posts = await prisma.forumPost.findMany({
      where: category && category !== 'all' ? { category } : undefined,
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, isCreator: true }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Failed to fetch community posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    )
  }
}

// Create a new forum post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createPostSchema.parse(body)

    const post = await prisma.forumPost.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, isCreator: true }
        },
        _count: { select: { comments: true } }
      }
    })

    return NextResponse.json({ success: true, post }, { status: 201 })

  } catch (error) {
    console.error('Failed to create community post:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create community post' },
      { status: 500 }
    )
  }
}
