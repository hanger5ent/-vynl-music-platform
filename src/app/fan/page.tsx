'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Play, 
  Heart, 
  Download, 
  Music, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  Calendar,
  ShoppingCart,
  Headphones,
  Volume2,
  SkipForward,
  Shuffle,
  Repeat,
  Plus,
  Search,
  Filter,
  Store,
  Crown
} from 'lucide-react'
import ArtistStore from '@/components/fan/ArtistStore'
import CreatorSubscriptions from '@/components/fan/CreatorSubscriptions'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  coverUrl?: string
  isLiked: boolean
  playCount: number
}

interface Artist {
  id: string
  name: string
  genre: string
  followers: number
  isFollowing: boolean
  coverUrl?: string
}

interface Playlist {
  id: string
  name: string
  trackCount: number
  duration: string
  isPublic: boolean
  coverUrl?: string
}

export default function FanDashboard() {
  const { data: session } = useSession()
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [listeningStats, setListeningStats] = useState({
    totalHours: 0,
    thisMonth: 0,
    topGenre: '',
    tracksPlayed: 0
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - replace with real API calls
  useEffect(() => {
    setRecentTracks([
      {
        id: '1',
        title: 'Electric Vibes',
        artist: 'Neon Nights',
        album: 'Synthwave Dreams',
        duration: '3:42',
        isLiked: true,
        playCount: 23,
        coverUrl: '/api/placeholder/50/50'
      },
      {
        id: '2',
        title: 'Midnight Dreams',
        artist: 'Synthwave Stars',
        album: 'Night Drive',
        duration: '4:15',
        isLiked: false,
        playCount: 15,
        coverUrl: '/api/placeholder/50/50'
      },
      {
        id: '3',
        title: 'Ocean Waves',
        artist: 'Chill Collective',
        album: 'Peaceful Moments',
        duration: '5:20',
        isLiked: true,
        playCount: 31,
        coverUrl: '/api/placeholder/50/50'
      }
    ])

    setFollowedArtists([
      {
        id: '1',
        name: 'Neon Nights',
        genre: 'Synthwave',
        followers: 12500,
        isFollowing: true,
        coverUrl: '/api/placeholder/60/60'
      },
      {
        id: '2',
        name: 'Chill Collective',
        genre: 'Ambient',
        followers: 8300,
        isFollowing: true,
        coverUrl: '/api/placeholder/60/60'
      }
    ])

    setPlaylists([
      {
        id: '1',
        name: 'Chill Mix',
        trackCount: 25,
        duration: '1h 23m',
        isPublic: false,
        coverUrl: '/api/placeholder/60/60'
      },
      {
        id: '2',
        name: 'Workout Beats',
        trackCount: 18,
        duration: '58m',
        isPublic: true,
        coverUrl: '/api/placeholder/60/60'
      }
    ])

    setListeningStats({
      totalHours: 127,
      thisMonth: 23,
      topGenre: 'Synthwave',
      tracksPlayed: 342
    })
  }, [])

  const handlePlay = (track: Track) => {
    setCurrentlyPlaying(track)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleLike = (trackId: string) => {
    setRecentTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked }
          : track
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || 'Music Fan'}! 🎵
          </h1>
          <p className="text-gray-600">Discover, play, and enjoy your favorite music</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'library', label: 'My Library', icon: Music },
              { id: 'playlists', label: 'Playlists', icon: Headphones },
              { id: 'following', label: 'Following', icon: Users },
              { id: 'store', label: 'Store', icon: Store },
              { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
              { id: 'activity', label: 'Activity', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Library</p>
                    <p className="text-3xl font-bold text-purple-600">42</p>
                    <p className="text-xs text-gray-500">songs purchased</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Music className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Listening Time</p>
                    <p className="text-3xl font-bold text-green-600">{listeningStats.thisMonth}h</p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Following</p>
                    <p className="text-3xl font-bold text-blue-600">{followedArtists.length}</p>
                    <p className="text-xs text-gray-500">artists</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Playlists</p>
                    <p className="text-3xl font-bold text-orange-600">{playlists.length}</p>
                    <p className="text-xs text-gray-500">created</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Headphones className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                    <p className="text-3xl font-bold text-yellow-600">1</p>
                    <p className="text-xs text-gray-500">active</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Playing Widget */}
            {currentlyPlaying && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <Music className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currentlyPlaying.title}</h3>
                      <p className="text-purple-100">{currentlyPlaying.artist}</p>
                      <p className="text-sm text-purple-200">{currentlyPlaying.album}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <Shuffle className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <SkipForward className="h-5 w-5 rotate-180" />
                    </button>
                    <button 
                      onClick={togglePlayPause}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isPlaying ? <Volume2 className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <SkipForward className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <Repeat className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recently Played */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recently Played</h2>
                <Link href="/library" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handlePlay(track)}
                        className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors"
                      >
                        <Play className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                      </button>
                      <div>
                        <h3 className="font-medium text-gray-900">{track.title}</h3>
                        <p className="text-sm text-gray-600">{track.artist} • {track.album}</p>
                        <p className="text-xs text-gray-500">{track.playCount} plays</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{track.duration}</span>
                      <button 
                        onClick={() => toggleLike(track.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          track.isLiked 
                            ? 'text-red-500 hover:bg-red-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${track.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Library</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search library..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your library</h3>
                <p className="text-gray-600 mb-6">Purchase songs and albums to add them to your personal collection</p>
                <Link
                  href="/artists"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Browse Music
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Playlists</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="h-4 w-4" />
                Create Playlist
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                    <Headphones className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{playlist.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{playlist.trackCount} songs • {playlist.duration}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      playlist.isPublic 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Following</h2>
              <Link
                href="/artists"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Discover Artists
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedArtists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{artist.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{artist.genre}</p>
                    <p className="text-xs text-gray-500 mb-4">{artist.followers.toLocaleString()} followers</p>
                    <div className="flex gap-2">
                      <Link
                        href={`/artist/${artist.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                      >
                        View Profile
                      </Link>
                      <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors">
                        Playing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <CreatorSubscriptions showAllArtists={true} />
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <ArtistStore showAllArtists={true} />
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Liked <span className="font-medium">"Electric Vibes"</span> by Neon Nights</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Added to playlist <span className="font-medium">"Chill Mix"</span></p>
                    <p className="text-sm text-gray-500">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Started following <span className="font-medium">Synthwave Stars</span></p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Purchased album <span className="font-medium">"Night Drive"</span></p>
                    <p className="text-sm text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
