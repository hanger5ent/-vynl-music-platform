'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ArtistStore from '@/components/fan/ArtistStore'
import Link from 'next/link'
import { ArrowLeft, Users, Music, Star, MapPin, Calendar, ExternalLink } from 'lucide-react'

interface Artist {
  id: string
  name: string
  bio: string
  genre: string
  followers: number
  monthlyListeners: number
  verified: boolean
  location: string
  joinDate: string
  coverImage: string
  avatar: string
  socialLinks: {
    website?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  stats: {
    totalTracks: number
    totalAlbums: number
    totalPlays: number
  }
}

export default function ArtistStorePage() {
  const params = useParams()
  const artistId = params.id as string
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with real API call
    const mockArtist: Artist = {
      id: artistId,
      name: 'Neon Nights',
      bio: 'Synthwave producer creating dreamy electronic soundscapes that transport listeners to neon-lit cityscapes and retro-futuristic worlds.',
      genre: 'Synthwave / Electronic',
      followers: 12500,
      monthlyListeners: 45000,
      verified: true,
      location: 'Los Angeles, CA',
      joinDate: '2019-03-15',
      coverImage: '/api/placeholder/1200/400',
      avatar: '/api/placeholder/150/150',
      socialLinks: {
        website: 'https://neonnights.music',
        instagram: '@neonnightsmusic',
        twitter: '@neonnights',
        youtube: 'NeonNightsOfficial'
      },
      stats: {
        totalTracks: 48,
        totalAlbums: 6,
        totalPlays: 2500000
      }
    }

    setTimeout(() => {
      setArtist(mockArtist)
      setLoading(false)
    }, 500)
  }, [artistId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist not found</h1>
            <Link
              href="/fan"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/fan"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Artist Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                
                {/* Artist Info */}
                <div className="text-white flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-4xl font-bold">{artist.name}</h1>
                    {artist.verified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Star className="h-4 w-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <p className="text-purple-100 mb-2">{artist.genre}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span>{artist.followers.toLocaleString()} followers</span>
                    <span>{artist.monthlyListeners.toLocaleString()} monthly listeners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bio */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{artist.bio}</p>
                
                {/* Social Links */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Connect</h4>
                  <div className="flex gap-4">
                    {artist.socialLinks.website && (
                      <a
                        href={artist.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {artist.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Tracks</span>
                    <span className="font-semibold">{artist.stats.totalTracks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Albums</span>
                    <span className="font-semibold">{artist.stats.totalAlbums}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Plays</span>
                    <span className="font-semibold">{artist.stats.totalPlays.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-semibold">{artist.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-semibold">
                      {new Date(artist.joinDate).getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Follow Button */}
                <button className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Follow Artist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Artist Store */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ArtistStore artistId={artistId} showAllArtists={false} />
        </div>
      </div>
    </div>
  )
}
