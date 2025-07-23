import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get comments for a track
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock comments data
    const mockComments = [
      {
        id: 'comment1',
        text: 'This song is absolutely amazing! Love the energy and the production quality.',
        createdAt: '2024-01-16T08:30:00Z',
        updatedAt: '2024-01-16T08:30:00Z',
        user: {
          id: 'user1',
          name: 'Music Lover',
          username: 'musiclover',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'
        },
        replies: [
          {
            id: 'reply1',
            text: 'Totally agree! The beat is infectious.',
            createdAt: '2024-01-16T09:15:00Z',
            user: {
              id: 'user3',
              name: 'Beat Head',
              username: 'beathead',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
            }
          }
        ]
      },
      {
        id: 'comment2',
        text: 'Perfect for my summer playlist! The lyrics really speak to me 🎵',
        createdAt: '2024-01-17T14:15:00Z',
        updatedAt: '2024-01-17T14:15:00Z',
        user: {
          id: 'user2',
          name: 'Beach Vibes',
          username: 'beachvibes',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
        },
        replies: []
      },
      {
        id: 'comment3',
        text: 'Been listening to this on repeat! When is the next album coming out?',
        createdAt: '2024-01-18T10:45:00Z',
        updatedAt: '2024-01-18T10:45:00Z',
        user: {
          id: 'user4',
          name: 'Repeat Player',
          username: 'repeatplayer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
        },
        replies: []
      }
    ]

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedComments = mockComments.slice(startIndex, endIndex)

    return NextResponse.json({
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total: mockComments.length,
        totalPages: Math.ceil(mockComments.length / limit),
        hasNext: endIndex < mockComments.length,
        hasPrev: page > 1
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

// Add a comment to a track
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

    // Create comment (mock implementation)
    const comment = {
      id: `comment_${Date.now()}`,
      text: text.trim(),
      trackId,
      userId: session.user.id,
      parentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        avatar: session.user.image
      },
      replies: []
    }

    return NextResponse.json({
      success: true,
      comment,
      message: parentId ? 'Reply added successfully' : 'Comment added successfully'
    })

  } catch (error) {
    console.error('Failed to add comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
