import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Toggle like on a track
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
    const userId = session.user.id

    // Mock: Check if already liked
    const isLiked = Math.random() > 0.5 // Random for demo
    const newLikeState = !isLiked

    // In production, toggle like in database
    const result = {
      id: `like_${Date.now()}`,
      trackId,
      userId,
      liked: newLikeState,
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      liked: newLikeState,
      likeCount: Math.floor(Math.random() * 1000) + 100,
      message: newLikeState ? 'Track liked' : 'Track unliked'
    })

  } catch (error) {
    console.error('Failed to toggle like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// Get like status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const trackId = params.id

    if (!session?.user) {
      return NextResponse.json({ liked: false, likeCount: 0 })
    }

    // Mock: Check if user liked this track
    const liked = Math.random() > 0.5
    const likeCount = Math.floor(Math.random() * 1000) + 100

    return NextResponse.json({
      liked,
      likeCount
    })

  } catch (error) {
    console.error('Failed to get like status:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}
