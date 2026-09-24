'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Play, Users, TrendingUp, Calendar, MapPin, Globe, ShoppingCart, Crown, Loader2, ChevronUp, MessageCircle, Heart } from 'lucide-react'
import Link from 'next/link'
import { TrackComments } from '@/components/tracks/TrackComments'

interface ArtistTrack {
  id: string
  title: string
  duration: number
  audioUrl: string | null
  playCount: number
  likeCount: number
  price: number | null
  isFree: boolean
  likedByMe: boolean
}

interface ArtistAlbum {
  id: string
  title: string
  releaseDate: string | null
  price: number | null
  trackCount: number
}

interface ArtistProfile {
  id: string
  name: string
  username: string
  bio: string | null
  avatar: string | null
  isVerified: boolean
  createdAt: string
  creatorProfile: {
    genre: string[]
    location: string | null
    website: string | null
    socialLinks: Record<string, string> | null
  } | null
  followerCount: number
  totalStreams: number
  isFollowing: boolean | null
  recentTracks: ArtistTrack[]
  albums: ArtistAlbum[]
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDuration(seconds: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArtistProfilePage() {
  const params = useParams()
  const artistId = params.id as string
  const { data: session } = useSession()

  const [artist, setArtist] = useState<ArtistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('tracks')
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState<ArtistTrack | null>(null)
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null)

  const fetchArtist = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/artists/${artistId}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      if (!res.ok) throw new Error('Failed to load artist')
      const data = await res.json()
      setArtist(data.artist)
    } catch {
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }, [artistId])

  useEffect(() => { fetchArtist() }, [fetchArtist])

  const toggleFollow = async () => {
    if (!artist || !session?.user) return
    setIsFollowLoading(true)
    try {
      const res = await fetch(`/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: artist.isFollowing ? 'unfollow' : 'follow' }),
      })
      const data = await res.json()
      if (res.ok) {
        setArtist({ ...artist, isFollowing: data.following, followerCount: data.followerCount })
      }
    } finally {
      setIsFollowLoading(false)
    }
  }

  const recordPlay = (trackId: string) => {
    fetch(`/api/music/tracks/${trackId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }

  const toggleLike = async (trackId: string) => {
    if (!artist) return
    const res = await fetch(`/api/music/tracks/${trackId}/like`, { method: 'POST' })
    if (!res.ok) return
    const data = await res.json()
    setArtist({
      ...artist,
      recentTracks: artist.recentTracks.map((t) =>
        t.id === trackId ? { ...t, likedByMe: data.liked, likeCount: data.likeCount } : t
      ),
    })
  }

  const buyTrack = async (track: ArtistTrack) => {
    if (!artist) return
    setBuyingId(track.id)
    try {
      const res = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: track.id, kind: 'track', name: track.title, price: track.price, artistId: artist.id }],
        }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Could not start checkout')
      }
    } finally {
      setBuyingId(null)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (notFound || !artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">The artist you're looking for doesn't exist.</p>
          <Link href="/artists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-64 md:h-80 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 md:-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl md:text-5xl border-4 border-white shadow-lg overflow-hidden">
              {artist.avatar ? (
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                artist.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{artist.name}</h1>
                    {artist.isVerified && (
                      <div className="ml-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {artist.creatorProfile?.genre && artist.creatorProfile.genre.length > 0 && (
                    <p className="text-gray-600 mb-2">{artist.creatorProfile.genre.join(', ')}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {artist.creatorProfile?.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {artist.creatorProfile.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(artist.createdAt)}
                    </div>
                  </div>
                </div>

                {artist.isFollowing !== null && (
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                      onClick={toggleFollow}
                      disabled={isFollowLoading || !session?.user}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        artist.isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {artist.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{formatNumber(artist.followerCount)}</span>
              </div>
              <p className="text-gray-600 text-sm">Followers</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{formatNumber(artist.totalStreams)}</span>
              </div>
              <p className="text-gray-600 text-sm">Total Streams</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Play className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{artist.recentTracks.length}</span>
              </div>
              <p className="text-gray-600 text-sm">Tracks</p>
            </div>
          </div>

          {artist.bio && (
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
                {artist.creatorProfile?.website && (
                  <div className="mt-4">
                    <a href={artist.creatorProfile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-700">
                      <Globe className="w-4 h-4 mr-2" />
                      Official Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['tracks', 'albums', 'subscribe'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'tracks' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {artist.recentTracks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No tracks yet.</div>
                  ) : (
                    artist.recentTracks.map((track, index) => (
                      <div key={track.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 text-center text-gray-500 text-sm">{index + 1}</div>
                          <div className="flex-1 mx-4">
                            <h4 className="font-medium text-gray-900">{track.title}</h4>
                            <p className="text-sm text-gray-500">{formatNumber(track.playCount)} plays</p>
                          </div>
                          <div className="text-sm text-gray-500 mr-4">{formatDuration(track.duration)}</div>
                          <div className="text-sm font-medium text-gray-900 mr-4">
                            {track.isFree ? 'Free' : `$${track.price?.toFixed(2)}`}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => { setNowPlaying(track); recordPlay(track.id) }}
                              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Play className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => toggleLike(track.id)}
                              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Heart className={`w-4 h-4 ${track.likedByMe ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={() => setExpandedCommentsId(expandedCommentsId === track.id ? null : track.id)}
                              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              {expandedCommentsId === track.id ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <MessageCircle className="w-4 h-4 text-gray-600" />}
                            </button>
                            {!track.isFree && track.price && (
                              <button
                                onClick={() => buyTrack(track)}
                                disabled={buyingId === track.id}
                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              >
                                {buyingId === track.id ? '...' : 'Buy'}
                              </button>
                            )}
                          </div>
                        </div>
                        {expandedCommentsId === track.id && <TrackComments trackId={track.id} />}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'albums' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artist.albums.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">No albums yet.</div>
                  ) : (
                    artist.albums.map((album) => (
                      <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{album.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {album.releaseDate ? formatDate(album.releaseDate) : 'Unreleased'} &middot; {album.trackCount} tracks
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{album.price ? `$${album.price.toFixed(2)}` : 'Free'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'subscribe' && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Support {artist.name}</h3>
                  <p className="text-gray-600 mb-6">Get exclusive content, early releases, and direct access through subscription tiers.</p>
                  <Link
                    href={`/artist/${artist.id}/subscribe`}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Crown className="w-4 h-4" />
                    View Subscription Tiers
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex items-center gap-3 z-40">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{nowPlaying.title}</div>
            <div className="text-xs text-gray-500">{artist.name}</div>
          </div>
          {nowPlaying.audioUrl && (
            <audio controls autoPlay src={nowPlaying.audioUrl} className="h-10 max-w-md w-full" />
          )}
        </div>
      )}
    </div>
  )
}
