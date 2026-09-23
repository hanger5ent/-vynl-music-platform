'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BetaFeature, BetaBadge, BETA_FEATURES } from '@/lib/beta'
import {
  Search,
  Play,
  TrendingUp,
  Clock,
  Music,
  Users,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react'

interface DiscoverTrack {
  id: string
  title: string
  duration: number
  genre: string | null
  playCount: number
  likeCount: number
  audioUrl: string | null
  owner: { id: string; name: string | null; username: string; avatar: string | null }
}

interface DiscoverArtist {
  id: string
  name: string
  username: string
  avatar: string | null
  isVerified: boolean
  genre: string[]
  followerCount: number
  trackCount: number
  totalStreams: number
}

function formatDuration(seconds: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists'>('tracks')
  const [tracks, setTracks] = useState<DiscoverTrack[]>([])
  const [artists, setArtists] = useState<DiscoverArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<DiscoverTrack | null>(null)

  const fetchData = useCallback(async (q: string) => {
    setIsLoading(true)
    try {
      if (q.trim()) {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=all&limit=30`)
        const data = await res.json()
        setTracks(data.results?.tracks || [])
        setArtists((data.results?.artists || []).map((a: DiscoverArtist) => a))
      } else {
        const [tracksRes, artistsRes] = await Promise.all([
          fetch('/api/music/tracks?sortBy=playCount&sortOrder=desc&limit=30'),
          fetch('/api/artists?sortBy=followers&limit=12'),
        ])
        const tracksData = await tracksRes.json()
        const artistsData = await artistsRes.json()
        setTracks(tracksData.tracks || [])
        setArtists(artistsData.artists || [])
      }
    } catch {
      setTracks([])
      setArtists([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchData(searchQuery), 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, fetchData])

  const recordPlay = (trackId: string) => {
    fetch(`/api/music/tracks/${trackId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Music</h1>
          <p className="text-gray-600">Find your next favorite track or artist</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tracks or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

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

        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'tracks', label: 'Tracks', icon: Music },
              { id: 'artists', label: 'Artists', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tracks' | 'artists')}
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

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            {activeTab === 'tracks' && (
              <div className="space-y-4">
                {tracks.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tracks found</h3>
                    <p className="text-gray-600">Try a different search, or check back as more creators upload.</p>
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div key={track.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
                          <Music className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{track.title}</h3>
                          <Link href={`/artist/${track.owner.id}`} className="text-gray-600 hover:text-purple-600 text-sm">
                            {track.owner.name || track.owner.username}
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(track.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {formatNumber(track.playCount)}
                            </span>
                            {track.genre && (
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{track.genre}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => { setNowPlaying(track); recordPlay(track.id) }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                        >
                          <Play className="h-5 w-5 text-purple-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'artists' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artists.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                  </div>
                ) : (
                  artists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all transform hover:scale-105"
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                          {artist.avatar ? (
                            <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                          {artist.isVerified && (
                            <div className="bg-blue-500 rounded-full p-1">
                              <Star className="h-3 w-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{artist.genre.length > 0 ? artist.genre.join(', ') : `@${artist.username}`}</p>
                        <p className="text-gray-500 text-xs">{formatNumber(artist.followerCount)} followers</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex items-center gap-3 z-40">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{nowPlaying.title}</div>
            <div className="text-xs text-gray-500">{nowPlaying.owner.name || nowPlaying.owner.username}</div>
          </div>
          {nowPlaying.audioUrl && (
            <audio controls autoPlay src={nowPlaying.audioUrl} className="h-10 max-w-md w-full" />
          )}
        </div>
      )}
    </div>
  )
}
