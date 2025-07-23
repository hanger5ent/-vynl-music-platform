import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get all tracks with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Mock data - in production, this would query your database
    const mockTracks = [
      {
        id: '1',
        title: 'Summer Vibes',
        slug: 'summer-vibes',
        description: 'A feel-good summer anthem',
        audioUrl: 'https://storage.example.com/tracks/summer-vibes.mp3',
        genre: 'Pop',
        tags: ['summer', 'upbeat', 'feel-good'],
        duration: 210,
        price: 1.99,
        isFree: false,
        playCount: 15420,
        likeCount: 342,
        createdAt: '2024-01-15T10:00:00Z',
        owner: {
          id: 'artist1',
          name: 'Sarah Music',
          username: 'sarahmusic',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332de0b?w=150&h=150&fit=crop&crop=face'
        }
      },
      {
        id: '2',
        title: 'Midnight Blues',
        slug: 'midnight-blues',
        description: 'Soulful blues for late night listening',
        audioUrl: 'https://storage.example.com/tracks/midnight-blues.mp3',
        genre: 'Blues',
        tags: ['blues', 'soulful', 'night'],
        duration: 195,
        price: null,
        isFree: true,
        playCount: 8900,
        likeCount: 156,
        createdAt: '2024-01-10T14:30:00Z',
        owner: {
          id: 'artist2',
          name: 'Blues Brother',
          username: 'bluesbrother',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      },
      {
        id: '3',
        title: 'Electronic Dreams',
        slug: 'electronic-dreams',
        description: 'Ambient electronic soundscape',
        audioUrl: 'https://storage.example.com/tracks/electronic-dreams.mp3',
        genre: 'Electronic',
        tags: ['electronic', 'ambient', 'chill'],
        duration: 240,
        price: 2.49,
        isFree: false,
        playCount: 12300,
        likeCount: 278,
        createdAt: '2024-01-08T16:45:00Z',
        owner: {
          id: 'artist3',
          name: 'Synth Master',
          username: 'synthmaster',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      }
    ]

    // Apply filters
    let filteredTracks = mockTracks

    if (genre) {
      filteredTracks = filteredTracks.filter(track => 
        track.genre.toLowerCase() === genre.toLowerCase()
      )
    }

    if (search) {
      filteredTracks = filteredTracks.filter(track =>
        track.title.toLowerCase().includes(search.toLowerCase()) ||
        track.description?.toLowerCase().includes(search.toLowerCase()) ||
        track.owner.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply sorting
    filteredTracks.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'playCount':
          aValue = a.playCount
          bValue = b.playCount
          break
        case 'likeCount':
          aValue = a.likeCount
          bValue = b.likeCount
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTracks = filteredTracks.slice(startIndex, endIndex)

    return NextResponse.json({
      tracks: paginatedTracks,
      pagination: {
        page,
        limit,
        total: filteredTracks.length,
        totalPages: Math.ceil(filteredTracks.length / limit),
        hasNext: endIndex < filteredTracks.length,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Failed to fetch tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}

// Create a new track
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isArtist) {
      return NextResponse.json({ error: 'Only artists can create tracks' }, { status: 403 })
    }

    const { title, description, genre, tags, price, audioUrl, duration } = await req.json()

    if (!title || !audioUrl) {
      return NextResponse.json({ 
        error: 'Title and audio URL are required' 
      }, { status: 400 })
    }

    // Create track (mock implementation)
    const track = {
      id: `track_${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      audioUrl,
      genre,
      tags: tags || [],
      duration: duration || 180,
      price: price || null,
      isFree: !price || price === 0,
      ownerId: session.user.id,
      playCount: 0,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      track,
      message: 'Track created successfully'
    })

  } catch (error) {
    console.error('Failed to create track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
