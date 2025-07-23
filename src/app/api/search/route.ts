import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Search across the platform
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, tracks, artists, albums, playlists
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 })
    }

    // Mock search results
    const mockResults = {
      tracks: [
        {
          id: '1',
          title: 'Summer Vibes',
          slug: 'summer-vibes',
          duration: 210,
          audioUrl: 'https://storage.example.com/tracks/summer-vibes.mp3',
          genre: 'Pop',
          playCount: 15420,
          likeCount: 342,
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
          duration: 195,
          audioUrl: 'https://storage.example.com/tracks/midnight-blues.mp3',
          genre: 'Blues',
          playCount: 8900,
          likeCount: 156,
          owner: {
            id: 'artist2',
            name: 'Blues Brother',
            username: 'bluesbrother',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        }
      ],
      
      artists: [
        {
          id: 'artist1',
          name: 'Sarah Music',
          username: 'sarahmusic',
          bio: 'Pop artist creating feel-good music for the soul',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332de0b?w=150&h=150&fit=crop&crop=face',
          isVerified: true,
          followerCount: 8420,
          trackCount: 24,
          genre: ['Pop', 'Indie Pop']
        },
        {
          id: 'artist2',
          name: 'Blues Brother',
          username: 'bluesbrother',
          bio: 'Soulful blues musician from Chicago',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isVerified: false,
          followerCount: 3240,
          trackCount: 18,
          genre: ['Blues', 'Soul']
        }
      ],
      
      albums: [
        {
          id: 'album1',
          title: 'Summer Collection',
          slug: 'summer-collection',
          coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          trackCount: 8,
          releaseDate: '2024-01-01T00:00:00Z',
          price: 9.99,
          owner: {
            id: 'artist1',
            name: 'Sarah Music',
            username: 'sarahmusic'
          }
        }
      ],
      
      playlists: [
        {
          id: 'playlist1',
          title: 'Summer Hits 2024',
          description: 'The best summer tracks of the year',
          coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          isPublic: true,
          trackCount: 25,
          likeCount: 156,
          owner: {
            id: 'user1',
            name: 'Music Curator',
            username: 'musiccurator'
          }
        }
      ]
    }

    // Filter results based on type
    let results: any = {}
    
    if (type === 'all') {
      results = mockResults
    } else if (type in mockResults) {
      results = { [type]: (mockResults as any)[type] }
    } else {
      return NextResponse.json({ 
        error: 'Invalid search type' 
      }, { status: 400 })
    }

    // Apply search filtering (mock - in production use full-text search)
    const searchTerm = query.toLowerCase()
    
    Object.keys(results).forEach(key => {
      results[key] = results[key].filter((item: any) => {
        const searchableText = [
          item.title || item.name,
          item.description,
          item.bio,
          item.genre?.join(' '),
          item.owner?.name
        ].filter(Boolean).join(' ').toLowerCase()
        
        return searchableText.includes(searchTerm)
      })
    })

    // Calculate totals
    const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0)

    return NextResponse.json({
      query,
      type,
      results,
      totalResults,
      pagination: {
        page,
        limit,
        total: totalResults
      }
    })

  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
