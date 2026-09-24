'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import SubscriptionTiers from '@/components/subscription/SubscriptionTiers'
import { ArrowLeft, Users, Music, Star, MapPin, Calendar, ExternalLink, Crown, Heart, Loader2 } from 'lucide-react'

interface ArtistSubscribeData {
  id: string
  name: string | null
  bio: string | null
  createdAt: string
  creatorProfile: {
    genre: string[]
    location: string | null
    website: string | null
    socialLinks: Record<string, string> | null
  } | null
  isVerified: boolean
  followerCount: number
  totalStreams: number
  trackCount: number
  albumCount: number
}

export default function ArtistSubscriptionPage() {
  const params = useParams()
  const artistId = params.id as string
  const [artist, setArtist] = useState<ArtistSubscribeData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchArtist = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/artists/${artistId}`)
      if (res.ok) {
        const data = await res.json()
        setArtist(data.artist)
      }
    } finally {
      setLoading(false)
    }
  }, [artistId])

  useEffect(() => { fetchArtist() }, [fetchArtist])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist not found</h1>
            <Link href="/discover" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayName = artist.name || 'This artist'
  const socialLinks = artist.creatorProfile?.socialLinks || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-6">
          <Link href={`/artist/${artist.id}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <div className="text-white flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-6 w-6 text-yellow-400" />
                    <h1 className="text-4xl font-bold">{displayName}</h1>
                    {artist.isVerified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Star className="h-4 w-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  {artist.creatorProfile?.genre && artist.creatorProfile.genre.length > 0 && (
                    <p className="text-purple-100 mb-2">{artist.creatorProfile.genre.join(', ')}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm">
                    <span>{artist.followerCount.toLocaleString()} followers</span>
                    <span>{artist.totalStreams.toLocaleString()} plays</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {artist.bio && (
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
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                {(socialLinks.website || socialLinks.instagram) && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Connect with me</h4>
                    <div className="flex gap-4">
                      {socialLinks.website && (
                        <a
                          href={socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a
                          href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold text-purple-600">{artist.followerCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Tracks</span>
                    <span className="font-semibold">{artist.trackCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Albums</span>
                    <span className="font-semibold">{artist.albumCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Plays</span>
                    <span className="font-semibold">{artist.totalStreams.toLocaleString()}</span>
                  </div>
                  {artist.creatorProfile?.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" />{artist.creatorProfile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(artist.createdAt).getFullYear()}</span>
                  </div>
                </div>

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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <SubscriptionTiers artistId={artist.id} artistName={displayName} />
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Secure payments powered by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  )
}
