import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Follow/unfollow an artist
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = params.id
    const { action } = await req.json()

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be "follow" or "unfollow"' 
      }, { status: 400 })
    }

    if (artistId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot follow yourself' 
      }, { status: 400 })
    }

    // Mock implementation
    const following = action === 'follow'
    const followerCount = Math.floor(Math.random() * 10000) + 100

    const followRecord = {
      id: `follow_${Date.now()}`,
      followerId: session.user.id,
      followingId: artistId,
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      following,
      followerCount,
      followRecord: following ? followRecord : null,
      message: following ? 'Successfully followed artist' : 'Successfully unfollowed artist'
    })

  } catch (error) {
    console.error('Failed to follow/unfollow artist:', error)
    return NextResponse.json(
      { error: 'Failed to follow/unfollow artist' },
      { status: 500 }
    )
  }
}

// Get follow status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const artistId = params.id

    if (!session?.user) {
      return NextResponse.json({ 
        following: false, 
        followerCount: Math.floor(Math.random() * 10000) + 100 
      })
    }

    // Mock: Check if user follows this artist
    const following = Math.random() > 0.5
    const followerCount = Math.floor(Math.random() * 10000) + 100

    return NextResponse.json({
      following,
      followerCount
    })

  } catch (error) {
    console.error('Failed to get follow status:', error)
    return NextResponse.json(
      { error: 'Failed to get follow status' },
      { status: 500 }
    )
  }
}
