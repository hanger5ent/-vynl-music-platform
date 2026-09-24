'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Music, Lock, Users, Loader2, Play, Trash2, Search, Plus, ArrowLeft } from 'lucide-react'

interface PlaylistTrack {
  id: string
  title: string
  duration: number
  audioUrl: string | null
  genre: string | null
  isFree: boolean
  price: number | null
  owner: { id: string; name: string | null; username: string }
}

interface PlaylistDetail {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  trackCount: number
  totalDuration: number
  owner: { id: string; name: string | null; username: string }
  isOwner: boolean
  tracks: PlaylistTrack[]
}

interface SearchResultTrack {
  id: string
  title: string
  owner: { name: string | null; username: string }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const playlistId = params.id as string

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<PlaylistTrack | null>(null)
  const [showAddTrack, setShowAddTrack] = useState(false)
  const [trackSearch, setTrackSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultTrack[]>([])
  const [addError, setAddError] = useState<string | null>(null)

  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/playlists/${playlistId}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      const data = await res.json()
      setPlaylist(data.playlist)
    } catch {
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }, [playlistId])

  useEffect(() => { fetchPlaylist() }, [fetchPlaylist])

  useEffect(() => {
    if (!trackSearch.trim()) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/music/tracks?search=${encodeURIComponent(trackSearch.trim())}&limit=10`)
      const data = await res.json()
      setSearchResults(data.tracks || [])
    }, 300)
    return () => clearTimeout(timeout)
  }, [trackSearch])

  const addTrack = async (trackId: string) => {
    setAddError(null)
    const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddError(data.error || 'Could not add track')
      return
    }
    setTrackSearch('')
    setSearchResults([])
    await fetchPlaylist()
  }

  const removeTrack = async (trackId: string) => {
    await fetch(`/api/playlists/${playlistId}/tracks?trackId=${trackId}`, { method: 'DELETE' })
    await fetchPlaylist()
  }

  const recordPlay = (trackId: string) => {
    fetch(`/api/music/tracks/${trackId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (notFound || !playlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Playlist not found</h1>
          <Link href="/playlists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Playlists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Link href="/playlists" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Playlists
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{playlist.title}</h1>
                {playlist.isPublic ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" /> Public
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">by {playlist.owner.name || playlist.owner.username} &middot; {playlist.trackCount} tracks</p>
            </div>
            {playlist.isOwner && (
              <button
                onClick={() => setShowAddTrack((v) => !v)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Add tracks
              </button>
            )}
          </div>
          {playlist.description && <p className="text-gray-700 mt-3">{playlist.description}</p>}

          {showAddTrack && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tracks to add..."
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
              {searchResults.length > 0 && (
                <ul className="mt-2 divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {searchResults.map((track) => (
                    <li key={track.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50">
                      <span>{track.title} <span className="text-gray-400">&middot; {track.owner.name || track.owner.username}</span></span>
                      <button onClick={() => addTrack(track.id)} className="text-indigo-600 hover:text-indigo-700 font-medium">Add</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {playlist.tracks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Music className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No tracks in this playlist yet.
            </div>
          ) : (
            playlist.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <div className="w-8 text-center text-gray-400 text-sm">{index + 1}</div>
                <div className="flex-1 mx-4 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{track.owner.name || track.owner.username}</p>
                </div>
                <div className="text-sm text-gray-500 mr-4">{formatDuration(track.duration)}</div>
                <button onClick={() => { setNowPlaying(track); recordPlay(track.id) }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <Play className="w-4 h-4 text-gray-600" />
                </button>
                {playlist.isOwner && (
                  <button onClick={() => removeTrack(track.id)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
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
