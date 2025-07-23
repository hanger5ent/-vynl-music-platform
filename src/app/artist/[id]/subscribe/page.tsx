'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import CreatorSubscriptions from '@/components/fan/CreatorSubscriptions'
import Link from 'next/link'
import { ArrowLeft, Users, Music, Star, MapPin, Calendar, ExternalLink, Crown, Heart } from 'lucide-react'

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
    totalSubscribers: number
  }
}

export default function ArtistSubscriptionPage() {
  const params = useParams()
  const artistId = params.id as string
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with real API call
    const mockArtist: Artist = {
      id: artistId,
      name: 'Neon Nights',
      bio: 'Synthwave producer creating dreamy electronic soundscapes that transport listeners to neon-lit cityscapes and retro-futuristic worlds. Support me to get exclusive content, early releases, and behind-the-scenes access to my creative process.',
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
        totalPlays: 2500000,
        totalSubscribers: 521
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
                    <Crown className="h-6 w-6 text-yellow-400" />
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
                    <span>{artist.stats.totalSubscribers} supporters</span>
                    <span>{artist.monthlyListeners.toLocaleString()} monthly listeners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Message */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Support My Music Journey</h3>
                  <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Why Subscribe Section */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Subscribe?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Music className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Exclusive Content</h4>
                      <p className="text-sm text-gray-600">Get early access to new releases, unreleased tracks, and exclusive remixes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Direct Connection</h4>
                      <p className="text-sm text-gray-600">Join private livestreams, Q&As, and get personal messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Behind the Scenes</h4>
                      <p className="text-sm text-gray-600">See my creative process, studio sessions, and upcoming projects</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">VIP Perks</h4>
                      <p className="text-sm text-gray-600">Concert presales, merchandise discounts, and special events</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Connect with me</h4>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Supporters</span>
                    <span className="font-semibold text-purple-600">{artist.stats.totalSubscribers}</span>
                  </div>
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
                    <span className="text-gray-600">Active since</span>
                    <span className="font-semibold">
                      {new Date(artist.joinDate).getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <Link
                    href={`/artist/${artist.id}`}
                    className="w-full block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm text-center transition-colors"
                  >
                    View Full Profile
                  </Link>
                  <Link
                    href={`/artist/${artist.id}/store`}
                    className="w-full block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm text-center transition-colors"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Support {artist.name}</h3>
            <p className="text-gray-600">Choose a subscription tier to get exclusive content and support this artist</p>
          </div>
          
          {/* Import the new subscription component */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Tier */}
            <div className="border-2 border-blue-200 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Supporter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$4.99</div>
                <p className="text-gray-600 text-sm">per month</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Exclusive content access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Early release previews</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Direct messages</span>
                </li>
              </ul>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Support {artist.name}
              </button>
            </div>

            {/* Premium Tier */}
            <div className="border-2 border-purple-200 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Supporter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$9.99</div>
                <p className="text-gray-600 text-sm">per month</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">All Basic features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Behind the scenes content</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Monthly Q&A sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Merchandise discounts</span>
                </li>
              </ul>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Support {artist.name}
              </button>
            </div>

            {/* VIP Tier */}
            <div className="border-2 border-yellow-200 ring-2 ring-yellow-300 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">VIP Supporter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$19.99</div>
                <p className="text-gray-600 text-sm">per month</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">All Premium features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">One-on-one video calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Concert presale access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Limited edition merchandise</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Support {artist.name}
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Secure payments powered by Stripe</p>
            <p className="text-xs text-gray-400">All subscriptions include a 30-day satisfaction guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}
