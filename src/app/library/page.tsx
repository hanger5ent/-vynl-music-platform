'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Music, Heart, Clock, Play, MoreHorizontal, Filter, Search } from 'lucide-react'

export default function MyLibraryPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Mock data for demonstration
  const libraryItems = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Luna Waves",
      album: "Ethereal Nights",
      duration: "3:45",
      addedDate: "2 days ago",
      type: "song",
      imageUrl: "/api/placeholder/50/50"
    },
    {
      id: 2,
      title: "Urban Symphony",
      artist: "Beat Collective",
      album: "City Sounds",
      duration: "4:12",
      addedDate: "1 week ago",
      type: "song",
      imageUrl: "/api/placeholder/50/50"
    },
    {
      id: 3,
      title: "Acoustic Sessions Vol. 1",
      artist: "Various Artists",
      album: "Acoustic Sessions Vol. 1",
      duration: "45:30",
      addedDate: "2 weeks ago",
      type: "album",
      imageUrl: "/api/placeholder/50/50"
    }
  ]

  const tabs = [
    { id: 'all', label: 'All', count: libraryItems.length },
    { id: 'songs', label: 'Songs', count: libraryItems.filter(item => item.type === 'song').length },
    { id: 'albums', label: 'Albums', count: libraryItems.filter(item => item.type === 'album').length },
    { id: 'recent', label: 'Recently Added', count: libraryItems.length }
  ]

  const filteredItems = libraryItems.filter(item => {
    if (activeTab === 'songs') return item.type === 'song'
    if (activeTab === 'albums') return item.type === 'album'
    if (searchQuery) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.artist.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Your saved music and favorite tracks</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Library Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No music in your library</h3>
              <p className="text-gray-600 mb-4">Start building your collection by saving your favorite tracks</p>
              <Link
                href="/discover"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Discover Music
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all rounded-lg group">
                          <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{item.artist}</p>
                        {item.album && (
                          <p className="text-xs text-gray-500 truncate">{item.album}</p>
                        )}
                      </div>
                      <div className="hidden sm:block text-sm text-gray-500">
                        {item.duration}
                      </div>
                      <div className="hidden md:block text-sm text-gray-500">
                        {item.addedDate}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{libraryItems.filter(item => item.type === 'song').length}</p>
                <p className="text-gray-600">Songs Saved</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{libraryItems.filter(item => item.type === 'album').length}</p>
                <p className="text-gray-600">Albums Saved</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
                <p className="text-gray-600">Total Duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
