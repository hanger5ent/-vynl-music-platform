'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Music, Heart, Clock, Play, Search, Loader2 } from 'lucide-react'

interface LibraryTrack {
  id: string
  title: string
  duration: number
  audioUrl: string | null
  genre: string | null
  owner: { id: string; name: string | null; username: string }
  album: { id: string; title: string } | null
  likedAt: string
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTotalDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function MyLibraryPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [tracks, setTracks] = useState<LibraryTrack[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<LibraryTrack | null>(null)

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/library')
      const data = await res.json()
      setTracks(data.tracks || [])
      setTotalDuration(data.totalDuration || 0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchLibrary()
  }, [session?.user, fetchLibrary])

  const unlike = async (trackId: string) => {
    await fetch(`/api/music/tracks/${trackId}/like`, { method: 'POST' })
    await fetchLibrary()
  }

  const recordPlay = (trackId: string) => {
    fetch(`/api/music/tracks/${trackId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.owner.name || t.owner.username).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Tracks you've liked</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No music in your library</h3>
              <p className="text-gray-600 mb-4">Like tracks on Discover or an artist's page to save them here</p>
              <Link
                href="/discover"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Discover Music
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTracks.map((track) => (
                <div key={track.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <button
                        onClick={() => { setNowPlaying(track); recordPlay(track.id) }}
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0 group"
                      >
                        <Play className="h-4 w-4 text-white" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{track.owner.name || track.owner.username}</p>
                        {track.album && <p className="text-xs text-gray-500 truncate">{track.album.title}</p>}
                      </div>
                      <div className="hidden sm:block text-sm text-gray-500">{formatDuration(track.duration)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => unlike(track.id)} className="p-2 text-red-500 hover:text-gray-400 transition-colors">
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{tracks.length}</p>
                <p className="text-gray-600">Tracks Liked</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatTotalDuration(totalDuration)}</p>
                <p className="text-gray-600">Total Duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex items-center gap-3 z-40">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{nowPlaying.title}</div>
            <div className="text-xs text-gray-500">{nowPlaying.owner.name || nowPlaying.owner.username}</div>
          </div>
          {nowPlaying.audioUrl && <audio controls autoPlay src={nowPlaying.audioUrl} className="h-10 max-w-md w-full" />}
        </div>
      )}
    </div>
  )
}
