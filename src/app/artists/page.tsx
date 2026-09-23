'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Users, TrendingUp, Music, Loader2 } from 'lucide-react'

interface DirectoryArtist {
  id: string
  name: string
  username: string
  avatar: string | null
  isVerified: boolean
  genre: string[]
  location: string | null
  followerCount: number
  trackCount: number
  totalStreams: number
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'followers' | 'streams' | 'newest'>('followers')
  const [artists, setArtists] = useState<DirectoryArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArtists = useCallback(async (q: string, sort: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ sortBy: sort })
      if (q.trim()) params.set('q', q.trim())
      const res = await fetch(`/api/artists?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load artists')
      const data = await res.json()
      setArtists(data.artists || [])
    } catch {
      setError('Could not load artists.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchArtists(searchTerm, sortBy), 300)
    return () => clearTimeout(timeout)
  }, [searchTerm, sortBy, fetchArtists])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Artists</h1>
          <p className="text-lg text-gray-600">
            Explore talented creators on our invite-only platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="followers">Most Followers</option>
            <option value="streams">Most Streams</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {artists.length} artist{artists.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <Link key={artist.id} href={`/artist/${artist.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                        {artist.avatar ? (
                          <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          artist.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {artist.name}
                          </h3>
                          {artist.isVerified && (
                            <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{artist.genre.length > 0 ? artist.genre.join(', ') : `@${artist.username}`}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatNumber(artist.followerCount)} followers</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatNumber(artist.totalStreams)} streams</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mt-3">
                      <Music className="w-4 h-4 mr-2" />
                      <span className="text-sm">{artist.trackCount} track{artist.trackCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {artists.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600">
                  Try adjusting your search, or check back soon as more creators join.
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Are you an artist?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our invite-only platform and connect directly with your fans
          </p>
          <Link
            href="/for-artists"
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Learn More About Creating
          </Link>
        </div>
      </div>
    </div>
  )
}
