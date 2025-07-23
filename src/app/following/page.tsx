'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Users, UserPlus, UserMinus, Music, Play, Search, Filter } from 'lucide-react'

export default function FollowingPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('artists')
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

  // Mock data
  const followedArtists = [
    {
      id: 1,
      name: "Luna Waves",
      username: "@lunawaves",
      followers: 12500,
      tracks: 23,
      avatar: "/api/placeholder/80/80",
      isVerified: true,
      latestRelease: "Midnight Dreams",
      releaseDate: "2 days ago"
    },
    {
      id: 2,
      name: "Beat Collective",
      username: "@beatcollective",
      followers: 8900,
      tracks: 45,
      avatar: "/api/placeholder/80/80",
      isVerified: false,
      latestRelease: "Urban Symphony",
      releaseDate: "1 week ago"
    },
    {
      id: 3,
      name: "Synthwave Dreams",
      username: "@synthwavedreams",
      followers: 15200,
      tracks: 67,
      avatar: "/api/placeholder/80/80",
      isVerified: true,
      latestRelease: "Neon Nights",
      releaseDate: "3 days ago"
    }
  ]

  const followedUsers = [
    {
      id: 1,
      name: "Alex Johnson",
      username: "@alexj",
      playlists: 12,
      avatar: "/api/placeholder/80/80",
      mutualFollows: 5,
      lastActivity: "Created playlist 'Summer Vibes'"
    },
    {
      id: 2,
      name: "Sarah Chen",
      username: "@sarahc",
      playlists: 8,
      avatar: "/api/placeholder/80/80",
      mutualFollows: 3,
      lastActivity: "Liked 'Acoustic Sessions'"
    }
  ]

  const tabs = [
    { id: 'artists', label: 'Artists', count: followedArtists.length },
    { id: 'users', label: 'Users', count: followedUsers.length }
  ]

  const filteredArtists = followedArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = followedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">Artists and users you follow</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search following..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Discover Artists
          </Link>
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

        {/* Content */}
        {activeTab === 'artists' ? (
          <div className="space-y-4">
            {filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600 mb-4">Discover and follow your favorite artists</p>
                <Link
                  href="/discover"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Discover Artists
                </Link>
              </div>
            ) : (
              filteredArtists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                          {artist.isVerified && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                        <p className="text-gray-600">{artist.username}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{artist.followers.toLocaleString()} followers</span>
                          <span>{artist.tracks} tracks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Play className="h-5 w-5" />
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </button>
                    </div>
                  </div>
                  {artist.latestRelease && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Latest: <span className="font-medium text-gray-900">{artist.latestRelease}</span>
                        <span className="text-gray-500 ml-2">• {artist.releaseDate}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">Connect with other music lovers</p>
                <Link
                  href="/discover"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Users
                </Link>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">{user.username}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{user.playlists} playlists</span>
                          <span>{user.mutualFollows} mutual follows</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </button>
                  </div>
                  {user.lastActivity && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Recent activity: <span className="font-medium text-gray-900">{user.lastActivity}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{followedArtists.length}</p>
                <p className="text-gray-600">Artists Following</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{followedUsers.length}</p>
                <p className="text-gray-600">Users Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
