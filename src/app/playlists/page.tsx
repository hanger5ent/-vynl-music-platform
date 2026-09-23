'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Music, Plus, Search, Lock, Users, Loader2 } from 'lucide-react'

interface PlaylistSummary {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  isPublic: boolean
  trackCount: number
  totalDuration: number
  createdAt: string
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function PlaylistsPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', isPublic: true })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/playlists')
      if (!res.ok) throw new Error('Failed to load playlists')
      const data = await res.json()
      setPlaylists(data.playlists || [])
    } catch {
      setError('Could not load your playlists.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchPlaylists()
  }, [session?.user, fetchPlaylists])

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not create playlist')
        return
      }
      setForm({ title: '', description: '', isPublic: true })
      setShowCreateModal(false)
      await fetchPlaylists()
    } finally {
      setIsCreating(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const filteredPlaylists = playlists.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Playlists</h1>
            <p className="text-gray-600">Create and manage your music collections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Playlist
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists found</h3>
            <p className="text-gray-600 mb-4">Create your first playlist to organize your music</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaylists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-12 w-12 text-white/70" />
                  )}
                  <div className="absolute top-2 right-2">
                    {playlist.isPublic ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Users className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{playlist.title}</h3>
                  {playlist.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{playlist.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{playlist.trackCount} track{playlist.trackCount !== 1 ? 's' : ''}</span>
                    <span>{formatDuration(playlist.totalDuration)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{playlists.length}</p>
                <p className="text-gray-600">Total Playlists</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{playlists.filter((p) => p.isPublic).length}</p>
                <p className="text-gray-600">Public Playlists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={createPlaylist} className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Playlist"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Tell people what this playlist is about..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make this playlist public</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
