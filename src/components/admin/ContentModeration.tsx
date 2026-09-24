'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Ban, RotateCcw } from 'lucide-react'

interface AdminTrack {
  id: string
  title: string
  genre: string | null
  playCount: number
  likeCount: number
  processingStatus: string
  isTakenDown: boolean
  takedownReason: string | null
  takenDownAt: string | null
  createdAt: string
  owner: { id: string; name: string | null; username: string }
}

const FILTERS = [
  { id: 'all', label: 'All Tracks' },
  { id: 'takenDown', label: 'Taken Down' },
] as const

export function ContentModeration() {
  const [tracks, setTracks] = useState<AdminTrack[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<typeof FILTERS[number]['id']>('all')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [takingDownId, setTakingDownId] = useState<string | null>(null)
  const [takedownReason, setTakedownReason] = useState('')

  const fetchTracks = useCallback(async (q: string, f: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, limit: '50' })
      if (f === 'takenDown') params.set('filter', 'takenDown')
      const res = await fetch(`/api/admin/content?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTracks(data.tracks || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchTracks(query, filter), 300)
    return () => clearTimeout(timeout)
  }, [query, filter, fetchTracks])

  const moderate = async (id: string, action: 'takedown' | 'restore', reason?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/content/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      if (res.ok) {
        const data = await res.json()
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data.track } : t)))
        setTakingDownId(null)
        setTakedownReason('')
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative max-w-md flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by track title or artist..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === f.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">No tracks found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {tracks.map((track) => (
            <div key={track.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{track.title}</h4>
                    {track.isTakenDown && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Taken Down</span>
                    )}
                    {track.processingStatus !== 'READY' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{track.processingStatus}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    by {track.owner.name || track.owner.username} &middot; {track.genre || 'No genre'} &middot; {track.playCount} plays &middot; {track.likeCount} likes
                  </p>
                  {track.isTakenDown && track.takedownReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {track.takedownReason}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {track.isTakenDown ? (
                    <button
                      onClick={() => moderate(track.id, 'restore')}
                      disabled={processingId === track.id}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => setTakingDownId(takingDownId === track.id ? null : track.id)}
                      disabled={processingId === track.id}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Ban className="h-3.5 w-3.5" /> Take Down
                    </button>
                  )}
                </div>
              </div>
              {takingDownId === track.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={takedownReason}
                    onChange={(e) => setTakedownReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="text-sm px-2 py-1.5 border border-gray-300 rounded-lg flex-1"
                  />
                  <button
                    onClick={() => moderate(track.id, 'takedown', takedownReason || undefined)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
