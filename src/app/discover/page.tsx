'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BetaFeature, BetaBadge, BETA_FEATURES } from '@/lib/beta'
import { 
  Search, 
  Filter, 
  Play, 
  Heart, 
  Share2, 
  TrendingUp, 
  Clock, 
  Music, 
  Users,
  Star,
  ChevronRight,
  Sparkles,
  UserPlus,
  Plus,
  ShoppingCart
} from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  price: number
  genre: string
  isLiked: boolean
  playCount: number
  image: string
}

interface Artist {
  id: string
  name: string
  genre: string
  followers: number
  isVerified: boolean
  image: string
  topTrack: string
}

interface Playlist {
  id: string
  name: string
  description: string
  trackCount: number
  image: string
  curator: string
}

export default function DiscoverPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'playlists'>('tracks')
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const genres = [
    'all', 'electronic', 'synthwave', 'ambient', 'house', 'techno', 'dubstep', 'trance', 'drum-and-bass'
  ]

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockTracks: Track[] = [
      {
        id: '1',
        title: 'Neon Dreams',
        artist: 'Synthwave Collective',
        album: 'Retro Future',
        duration: '3:45',
        price: 2.99,
        genre: 'synthwave',
        isLiked: false,
        playCount: 12450,
        image: '/api/placeholder/200/200'
      },
      {
        id: '2',
        title: 'Digital Rain',
        artist: 'Cyber Artist',
        album: 'Matrix Sounds',
        duration: '4:12',
        price: 1.99,
        genre: 'electronic',
        isLiked: true,
        playCount: 8900,
        image: '/api/placeholder/200/200'
      },
      {
        id: '3',
        title: 'Midnight Drive',
        artist: 'Neon Nights',
        album: 'Night Cruise',
        duration: '5:20',
        price: 3.49,
        genre: 'synthwave',
        isLiked: false,
        playCount: 15600,
        image: '/api/placeholder/200/200'
      },
      {
        id: '4',
        title: 'Bass Drop',
        artist: 'Electronic Waves',
        album: 'Deep Frequencies',
        duration: '3:30',
        price: 2.49,
        genre: 'dubstep',
        isLiked: true,
        playCount: 22100,
        image: '/api/placeholder/200/200'
      },
      {
        id: '5',
        title: 'Ambient Space',
        artist: 'Cosmic Sounds',
        album: 'Universe',
        duration: '6:15',
        price: 2.99,
        genre: 'ambient',
        isLiked: false,
        playCount: 5400,
        image: '/api/placeholder/200/200'
      },
      {
        id: '6',
        title: 'House Party',
        artist: 'Beat Masters',
        album: 'Club Nights',
        duration: '4:05',
        price: 1.99,
        genre: 'house',
        isLiked: false,
        playCount: 18700,
        image: '/api/placeholder/200/200'
      }
    ]

    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Synthwave Collective',
        genre: 'Synthwave',
        followers: 25400,
        isVerified: true,
        image: '/api/placeholder/150/150',
        topTrack: 'Neon Dreams'
      },
      {
        id: '2',
        name: 'Cyber Artist',
        genre: 'Electronic',
        followers: 18900,
        isVerified: true,
        image: '/api/placeholder/150/150',
        topTrack: 'Digital Rain'
      },
      {
        id: '3',
        name: 'Neon Nights',
        genre: 'Synthwave',
        followers: 32100,
        isVerified: true,
        image: '/api/placeholder/150/150',
        topTrack: 'Midnight Drive'
      },
      {
        id: '4',
        name: 'Electronic Waves',
        genre: 'Dubstep',
        followers: 41200,
        isVerified: false,
        image: '/api/placeholder/150/150',
        topTrack: 'Bass Drop'
      }
    ]

    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Synthwave Essentials',
        description: 'The best synthwave tracks for your retro journey',
        trackCount: 42,
        image: '/api/placeholder/200/200',
        curator: 'VYNL Editorial'
      },
      {
        id: '2',
        name: 'Electronic Vibes',
        description: 'Fresh electronic beats to fuel your day',
        trackCount: 38,
        image: '/api/placeholder/200/200',
        curator: 'Beat Curators'
      },
      {
        id: '3',
        name: 'Ambient Focus',
        description: 'Atmospheric sounds for deep concentration',
        trackCount: 28,
        image: '/api/placeholder/200/200',
        curator: 'Study Music Co'
      }
    ]

    setTracks(mockTracks)
    setArtists(mockArtists)
    setPlaylists(mockPlaylists)
  }, [])

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || artist.genre.toLowerCase() === selectedGenre
    return matchesSearch && matchesGenre
  })

  const toggleLike = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, isLiked: !track.isLiked } : track
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Music</h1>
          <p className="text-gray-600">Find your next favorite track, artist, or playlist</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracks, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Beta AI Recommendations */}
        <BetaFeature feature={BETA_FEATURES.AI_RECOMMENDATIONS}>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
                <BetaBadge variant="small" />
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Discover music tailored to your unique taste using our advanced AI recommendation engine.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-medium text-gray-900 mb-2">🎯 Smart Discovery</h4>
                <p className="text-sm text-gray-600">Find hidden gems based on your listening patterns</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-medium text-gray-900 mb-2">🔄 Dynamic Playlists</h4>
                <p className="text-sm text-gray-600">Auto-updating playlists that evolve with your taste</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-medium text-gray-900 mb-2">🤝 Social Matching</h4>
                <p className="text-sm text-gray-600">Connect with users who share your musical interests</p>
              </div>
            </div>
          </div>
        </BetaFeature>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'tracks', label: 'Tracks', icon: Music },
              { id: 'artists', label: 'Artists', icon: Users },
              { id: 'playlists', label: 'Playlists', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tracks' | 'artists' | 'playlists')}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            {filteredTracks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tracks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredTracks.map((track) => (
                <div key={track.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Album Art */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-white" />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{track.title}</h3>
                      <p className="text-gray-600">{track.artist} • {track.album}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {track.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {track.playCount.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {track.genre}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${track.price}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Play className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => toggleLike(track.id)}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                          track.isLiked ? 'text-red-500' : 'text-gray-600'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${track.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </button>
                      <Link
                        href={`/artist/${track.artist.replace(/\s+/g, '-').toLowerCase()}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Buy
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                    {artist.isVerified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{artist.genre}</p>
                  <p className="text-gray-500 text-xs mb-3">{artist.followers.toLocaleString()} followers</p>
                  <p className="text-gray-700 text-sm">
                    Latest: <span className="font-medium">{artist.topTrack}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{playlist.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{playlist.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{playlist.trackCount} tracks</span>
                    <span>by {playlist.curator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
