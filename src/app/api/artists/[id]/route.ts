import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get artist profile and music
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = params.id

    // Mock artist profile
    const mockArtist = {
      id: artistId,
      name: 'Sarah Music',
      username: 'sarahmusic',
      email: 'sarah@example.com',
      bio: 'Pop artist creating feel-good music for the soul. Based in Los Angeles, bringing summer vibes year-round.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332de0b?w=400&h=400&fit=crop&crop=face',
      isArtist: true,
      isVerified: true,
      createdAt: '2023-06-15T10:00:00Z',
      
      // Artist-specific profile
      artistProfile: {
        stageName: 'Sarah Music',
        genre: ['Pop', 'Indie Pop', 'Electronic'],
        location: 'Los Angeles, CA',
        website: 'https://sarahmusic.com',
        socialLinks: {
          instagram: 'https://instagram.com/sarahmusic',
          twitter: 'https://twitter.com/sarahmusic',
          spotify: 'https://open.spotify.com/artist/sarahmusic',
          youtube: 'https://youtube.com/@sarahmusic'
        },
        totalStreams: 1250000,
        totalRevenue: 15750.50,
      },
      
      // Stats
      followerCount: 8420,
      followingCount: 245,
      trackCount: 24,
      albumCount: 3,
      
      // Recent tracks
      recentTracks: [
        {
          id: '1',
          title: 'Summer Vibes',
          slug: 'summer-vibes',
          duration: 210,
          audioUrl: 'https://storage.example.com/tracks/summer-vibes.mp3',
          genre: 'Pop',
          playCount: 15420,
          likeCount: 342,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '4',
          title: 'City Lights',
          slug: 'city-lights',
          duration: 185,
          audioUrl: 'https://storage.example.com/tracks/city-lights.mp3',
          genre: 'Indie Pop',
          playCount: 9850,
          likeCount: 198,
          createdAt: '2024-01-12T14:30:00Z'
        }
      ],
      
      // Albums
      albums: [
        {
          id: 'album1',
          title: 'Summer Collection',
          slug: 'summer-collection',
          coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          trackCount: 8,
          releaseDate: '2024-01-01T00:00:00Z',
          price: 9.99
        },
        {
          id: 'album2',
          title: 'City Dreams',
          slug: 'city-dreams',
          coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
          trackCount: 6,
          releaseDate: '2023-09-15T00:00:00Z',
          price: 7.99
        }
      ]
    }

    return NextResponse.json({ artist: mockArtist })

  } catch (error) {
    console.error('Failed to fetch artist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}

// Update artist profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = params.id
    
    // Verify user is updating their own profile
    if (artistId !== session.user.id) {
      return NextResponse.json({ error: 'Can only update your own profile' }, { status: 403 })
    }

    const updates = await req.json()

    // In production, validate and update database
    const updatedProfile = {
      id: artistId,
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      artist: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Failed to update artist profile:', error)
    return NextResponse.json(
      { error: 'Failed to update artist profile' },
      { status: 500 }
    )
  }
}
