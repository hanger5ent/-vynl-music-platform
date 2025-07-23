import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get user's playlists
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock user playlists
    const mockPlaylists = [
      {
        id: 'playlist1',
        title: 'My Favorites',
        description: 'All-time favorite tracks',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        isPublic: true,
        trackCount: 25,
        totalDuration: 6300, // in seconds
        likeCount: 12,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: 'playlist2',
        title: 'Workout Mix',
        description: 'High-energy tracks for workouts',
        coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        isPublic: true,
        trackCount: 18,
        totalDuration: 4320,
        likeCount: 8,
        createdAt: '2024-01-05T14:00:00Z',
        updatedAt: '2024-01-18T09:15:00Z'
      },
      {
        id: 'playlist3',
        title: 'Chill Vibes',
        description: 'Relaxing music for unwinding',
        coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
        isPublic: false,
        trackCount: 32,
        totalDuration: 7680,
        likeCount: 5,
        createdAt: '2024-01-10T20:00:00Z',
        updatedAt: '2024-01-19T11:45:00Z'
      }
    ]

    return NextResponse.json({
      playlists: mockPlaylists
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

    // Create playlist (mock implementation)
    const playlist = {
      id: `playlist_${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      coverImage: coverImage || null,
      isPublic: isPublic !== false, // Default to public
      ownerId: session.user.id,
      trackCount: 0,
      totalDuration: 0,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      tracks: []
    }

    return NextResponse.json({
      success: true,
      playlist,
      message: 'Playlist created successfully'
    })

  } catch (error) {
    console.error('Failed to create playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}
