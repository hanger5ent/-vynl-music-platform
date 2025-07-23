import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get playlist details with tracks
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id

    // Mock playlist with tracks
    const mockPlaylist = {
      id: playlistId,
      title: 'My Favorites',
      description: 'All-time favorite tracks that never get old',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      isPublic: true,
      trackCount: 3,
      totalDuration: 645, // 10:45
      likeCount: 12,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      owner: {
        id: 'user1',
        name: 'Music Lover',
        username: 'musiclover',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
      },
      tracks: [
        {
          id: '1',
          title: 'Summer Vibes',
          slug: 'summer-vibes',
          duration: 210,
          audioUrl: 'https://storage.example.com/tracks/summer-vibes.mp3',
          genre: 'Pop',
          price: 1.99,
          isFree: false,
          playCount: 15420,
          position: 1,
          addedAt: '2024-01-15T10:00:00Z',
          owner: {
            id: 'artist1',
            name: 'Sarah Music',
            username: 'sarahmusic',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332de0b?w=50&h=50&fit=crop&crop=face'
          }
        },
        {
          id: '2',
          title: 'Midnight Blues',
          slug: 'midnight-blues',
          duration: 195,
          audioUrl: 'https://storage.example.com/tracks/midnight-blues.mp3',
          genre: 'Blues',
          price: null,
          isFree: true,
          playCount: 8900,
          position: 2,
          addedAt: '2024-01-16T14:30:00Z',
          owner: {
            id: 'artist2',
            name: 'Blues Brother',
            username: 'bluesbrother',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
          }
        },
        {
          id: '3',
          title: 'Electronic Dreams',
          slug: 'electronic-dreams',
          duration: 240,
          audioUrl: 'https://storage.example.com/tracks/electronic-dreams.mp3',
          genre: 'Electronic',
          price: 2.49,
          isFree: false,
          playCount: 12300,
          position: 3,
          addedAt: '2024-01-17T16:45:00Z',
          owner: {
            id: 'artist3',
            name: 'Synth Master',
            username: 'synthmaster',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
          }
        }
      ]
    }

    return NextResponse.json({ playlist: mockPlaylist })

  } catch (error) {
    console.error('Failed to fetch playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
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
    const updates = await req.json()

    // In production, verify ownership and update database
    const updatedPlaylist = {
      id: playlistId,
      ...updates,
      updatedAt: new Date()
    }

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

    // In production, verify ownership and delete from database
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
