'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Music, Plus, Search, Play, MoreHorizontal, Lock, Users, Heart } from 'lucide-react'

export default function PlaylistsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  // Mock playlists data
  const playlists = [
    {
      id: 1,
      name: "My Favorites",
      description: "All my favorite tracks in one place",
      trackCount: 47,
      duration: "3h 12m",
      isPublic: false,
      createdAt: "2023-11-01",
      coverUrl: "/api/placeholder/200/200",
      isLiked: true
    },
    {
      id: 2,
      name: "Workout Vibes",
      description: "High energy tracks for the gym",
      trackCount: 23,
      duration: "1h 45m",
      isPublic: true,
      createdAt: "2023-10-15",
      coverUrl: "/api/placeholder/200/200",
      isLiked: false
    },
    {
      id: 3,
      name: "Chill Evening",
      description: "Relaxing music for unwinding",
      trackCount: 31,
      duration: "2h 18m",
      isPublic: false,
      createdAt: "2023-09-20",
      coverUrl: "/api/placeholder/200/200",
      isLiked: true
    }
  ]

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
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

        {/* Search */}
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

        {/* Playlists Grid */}
        {filteredPlaylists.length === 0 ? (
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
              <div key={playlist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700">
                      <Play className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    {playlist.isPublic ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Public
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">{playlist.name}</h3>
                    <div className="flex items-center gap-1 ml-2">
                      <button className={`p-1 transition-colors ${playlist.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                        <Heart className="h-4 w-4" fill={playlist.isLiked ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{playlist.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{playlist.trackCount} tracks</span>
                    <span>{playlist.duration}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Created {new Date(playlist.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-2xl font-bold text-gray-900">{playlists.filter(p => p.isPublic).length}</p>
                <p className="text-gray-600">Public Playlists</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{playlists.reduce((sum, p) => sum + p.trackCount, 0)}</p>
                <p className="text-gray-600">Total Tracks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Playlist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Tell people what this playlist is about..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-700">Make this playlist public</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
