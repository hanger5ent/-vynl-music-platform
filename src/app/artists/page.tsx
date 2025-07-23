'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Play, Heart, Users, TrendingUp, Music } from 'lucide-react'

// Mock data for demonstration
const featuredArtists = [
  {
    id: '1',
    name: 'Luna Waves',
    stageName: 'Luna Waves',
    genre: ['Electronic', 'Ambient'],
    followers: 15420,
    totalStreams: 1254000,
    avatar: '/api/placeholder/120/120',
    isVerified: true,
    topTrack: 'Midnight Echoes',
    bio: 'Electronic music producer creating atmospheric soundscapes.'
  },
  {
    id: '2',
    name: 'The Midnight Collective',
    stageName: 'The Midnight Collective',
    genre: ['Indie Rock', 'Alternative'],
    followers: 8930,
    totalStreams: 567000,
    avatar: '/api/placeholder/120/120',
    isVerified: false,
    topTrack: 'City Lights',
    bio: 'Indie rock band from Portland with dreamy soundscapes.'
  },
  {
    id: '3',
    name: 'Sofia Melodic',
    stageName: 'Sofia Melodic',
    genre: ['Pop', 'Singer-Songwriter'],
    followers: 23100,
    totalStreams: 2100000,
    avatar: '/api/placeholder/120/120',
    isVerified: true,
    topTrack: 'Golden Hour',
    bio: 'Singer-songwriter crafting intimate pop melodies.'
  },
  {
    id: '4',
    name: 'Digital Dreams',
    stageName: 'Digital Dreams',
    genre: ['Synthwave', 'Electronic'],
    followers: 12750,
    totalStreams: 890000,
    avatar: '/api/placeholder/120/120',
    isVerified: true,
    topTrack: 'Neon Nights',
    bio: 'Synthwave artist bringing retro-futuristic vibes.'
  },
  {
    id: '5',
    name: 'Acoustic Soul',
    stageName: 'Acoustic Soul',
    genre: ['Folk', 'Acoustic'],
    followers: 6420,
    totalStreams: 340000,
    avatar: '/api/placeholder/120/120',
    isVerified: false,
    topTrack: 'Mountain Trail',
    bio: 'Folk musician with heartfelt acoustic compositions.'
  },
  {
    id: '6',
    name: 'Bass Brigade',
    stageName: 'Bass Brigade',
    genre: ['Hip Hop', 'Electronic'],
    followers: 19800,
    totalStreams: 1750000,
    avatar: '/api/placeholder/120/120',
    isVerified: true,
    topTrack: 'Underground',
    bio: 'Hip-hop collective pushing electronic boundaries.'
  }
]

const genres = ['All', 'Electronic', 'Pop', 'Hip Hop', 'Rock', 'Folk', 'Ambient', 'Alternative']

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [sortBy, setSortBy] = useState('followers')

  const filteredArtists = featuredArtists
    .filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesGenre = selectedGenre === 'All' || artist.genre.includes(selectedGenre)
      return matchesSearch && matchesGenre
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return b.followers - a.followers
        case 'streams':
          return b.totalStreams - a.totalStreams
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Artists</h1>
          <p className="text-lg text-gray-600">
            Explore talented creators on our invite-only platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search artists or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="followers">Most Followers</option>
            <option value="streams">Most Streams</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map(artist => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                {/* Avatar and Verification */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {artist.name.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {artist.stageName}
                      </h3>
                      {artist.isVerified && (
                        <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{artist.genre.join(', ')}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {artist.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{formatNumber(artist.followers)} followers</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">{formatNumber(artist.totalStreams)} streams</span>
                  </div>
                </div>

                {/* Top Track */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Music className="w-4 h-4 mr-2" />
                    <span className="text-sm truncate">Top: {artist.topTrack}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle play action
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Play className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle like action
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to discover more artists.
            </p>
          </div>
        )}

        {/* Call to Action for Creators */}
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
