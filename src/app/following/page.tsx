'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, UserPlus, UserMinus, Music, Search, Loader2 } from 'lucide-react'

interface FollowedArtist {
  id: string
  name: string | null
  username: string
  avatar: string | null
  isVerified: boolean
  genre: string[]
  followerCount: number
  trackCount: number
}

interface FollowedUser {
  id: string
  name: string | null
  username: string
  avatar: string | null
  playlistCount: number
}

export default function FollowingPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'artists' | 'users'>('artists')
  const [searchQuery, setSearchQuery] = useState('')
  const [artists, setArtists] = useState<FollowedArtist[]>([])
  const [users, setUsers] = useState<FollowedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFollows = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/follows')
      const data = await res.json()
      setArtists(data.artists || [])
      setUsers(data.users || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchFollows()
  }, [session?.user, fetchFollows])

  const unfollow = async (id: string) => {
    await fetch(`/api/artists/${id}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unfollow' }),
    })
    await fetchFollows()
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

  const filteredArtists = artists.filter((a) =>
    (a.name || a.username).toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredUsers = users.filter((u) =>
    (u.name || u.username).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'artists' as const, label: 'Artists', count: artists.length },
    { id: 'users' as const, label: 'Users', count: users.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">Artists and users you follow</p>
        </div>

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

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : activeTab === 'artists' ? (
          <div className="space-y-4">
            {filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600 mb-4">Discover and follow your favorite artists</p>
                <Link href="/discover" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Discover Artists
                </Link>
              </div>
            ) : (
              filteredArtists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <Link href={`/artist/${artist.id}`} className="flex items-center space-x-4 group">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
                        {artist.avatar ? <img src={artist.avatar} alt={artist.name || ''} className="w-full h-full object-cover" /> : (artist.name || artist.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">{artist.name || artist.username}</h3>
                          {artist.isVerified && <span className="text-blue-500">✓</span>}
                        </div>
                        <p className="text-gray-600">@{artist.username}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{artist.followerCount.toLocaleString()} followers</span>
                          <span>{artist.trackCount} tracks</span>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => unfollow(artist.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </button>
                  </div>
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
                <p className="text-gray-600">Follow other music lovers to see them here</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
                        {user.avatar ? <img src={user.avatar} alt={user.name || ''} className="w-full h-full object-cover" /> : (user.name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name || user.username}</h3>
                        <p className="text-gray-600">@{user.username}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{user.playlistCount} playlists</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => unfollow(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{artists.length}</p>
                <p className="text-gray-600">Artists Following</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-gray-600">Users Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
