'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ArtistStore from '@/components/fan/ArtistStore'
import Link from 'next/link'
import { ArrowLeft, Users, Star, MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react'

interface ArtistStoreData {
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
  isFollowing: boolean | null
}

export default function ArtistStorePage() {
  const params = useParams()
  const artistId = params.id as string
  const { data: session } = useSession()
  const [artist, setArtist] = useState<ArtistStoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

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

  const toggleFollow = async () => {
    if (!artist || !session?.user) return
    setIsFollowLoading(true)
    try {
      const res = await fetch(`/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: artist.isFollowing ? 'unfollow' : 'follow' }),
      })
      const data = await res.json()
      if (res.ok) {
        setArtist({ ...artist, isFollowing: data.following, followerCount: data.followerCount })
      }
    } finally {
      setIsFollowLoading(false)
    }
  }

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{artist.bio || 'This artist hasn\'t added a bio yet.'}</p>

                {(socialLinks.website || socialLinks.instagram) && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Connect</h4>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stats</h3>
                <div className="space-y-4">
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

                {artist.isFollowing !== null && (
                  <button
                    onClick={toggleFollow}
                    disabled={isFollowLoading}
                    className={`w-full mt-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                      artist.isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {artist.isFollowing ? 'Following' : 'Follow Artist'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <ArtistStore artistId={artistId} showAllArtists={false} />
        </div>
      </div>
    </div>
  )
}
