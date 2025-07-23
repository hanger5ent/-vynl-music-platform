'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Play, Heart, Share2, Users, TrendingUp, Calendar, MapPin, Globe, ShoppingCart, Crown } from 'lucide-react'
import Link from 'next/link'

// Mock data - in a real app, this would come from your API
const getArtistData = (id: string) => {
  const artists = {
    '1': {
      id: '1',
      name: 'Luna Waves',
      stageName: 'Luna Waves',
      bio: 'Electronic music producer creating atmospheric soundscapes that transport listeners to otherworldly realms. Luna has been crafting immersive audio experiences for over 8 years, blending ambient textures with intricate beat patterns.',
      genre: ['Electronic', 'Ambient'],
      followers: 15420,
      totalStreams: 1254000,
      avatar: '/api/placeholder/200/200',
      coverImage: '/api/placeholder/800/300',
      isVerified: true,
      location: 'Berlin, Germany',
      website: 'https://lunawaves.com',
      joinedDate: '2019-03-15',
      socialLinks: {
        twitter: '@lunawaves',
        instagram: '@lunawaves_music',
        spotify: 'Luna Waves'
      },
      tracks: [
        { id: '1', title: 'Midnight Echoes', duration: '4:32', streams: 125400, price: 2.99 },
        { id: '2', title: 'Digital Rain', duration: '3:45', streams: 98200, price: 2.99 },
        { id: '3', title: 'Ethereal Drift', duration: '5:18', streams: 87300, price: 2.99 },
        { id: '4', title: 'Neon Dreams', duration: '4:01', streams: 76500, price: 2.99 }
      ],
      albums: [
        { id: '1', title: 'Atmospheric Horizons', releaseDate: '2024-01-15', tracks: 8, price: 15.99 },
        { id: '2', title: 'Echoes of Tomorrow', releaseDate: '2023-06-20', tracks: 10, price: 18.99 }
      ],
      merchandise: [
        { id: '1', name: 'Luna Waves T-Shirt', price: 25.99, image: '/api/placeholder/150/150' },
        { id: '2', name: 'Atmospheric Vinyl LP', price: 35.99, image: '/api/placeholder/150/150' }
      ]
    },
    '2': {
      id: '2',
      name: 'The Midnight Collective',
      stageName: 'The Midnight Collective',
      bio: 'Indie rock band from Portland creating dreamy soundscapes with introspective lyrics and atmospheric guitar work.',
      genre: ['Indie Rock', 'Alternative'],
      followers: 8930,
      totalStreams: 567000,
      avatar: '/api/placeholder/200/200',
      coverImage: '/api/placeholder/800/300',
      isVerified: false,
      location: 'Portland, OR',
      website: 'https://midnightcollective.band',
      joinedDate: '2020-08-10',
      socialLinks: {
        twitter: '@midnightcoll',
        instagram: '@themidnightcollective'
      },
      tracks: [
        { id: '1', title: 'City Lights', duration: '3:24', streams: 45600, price: 1.99 },
        { id: '2', title: 'Midnight Walk', duration: '4:12', streams: 38900, price: 1.99 },
        { id: '3', title: 'Urban Dreams', duration: '3:58', streams: 32100, price: 1.99 }
      ],
      albums: [
        { id: '1', title: 'Night Visions', releaseDate: '2023-11-12', tracks: 12, price: 12.99 }
      ],
      merchandise: []
    }
  }
  
  return artists[id as keyof typeof artists] || null
}

export default function ArtistProfilePage() {
  const params = useParams()
  const artistId = params.id as string
  const artist = getArtistData(artistId)
  
  const [activeTab, setActiveTab] = useState('tracks')
  const [isFollowing, setIsFollowing] = useState(false)

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">The artist you're looking for doesn't exist.</p>
          <Link
            href="/artists"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Artist Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 md:-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl md:text-5xl border-4 border-white shadow-lg">
              {artist.name.charAt(0)}
            </div>

            {/* Artist Details */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {artist.stageName}
                    </h1>
                    {artist.isVerified && (
                      <div className="ml-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{artist.genre.join(', ')}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {artist.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {artist.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(artist.joinedDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(artist.followers)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Followers</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(artist.totalStreams)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Total Streams</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Play className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {artist.tracks.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Tracks</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingCart className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {artist.albums.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Albums</p>
            </div>
          </div>

          {/* Bio and Links */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
              
              {artist.website && (
                <div className="mt-4">
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Official Website
                  </a>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
              <div className="space-y-3">
                {Object.entries(artist.socialLinks || {}).map(([platform, handle]) => (
                  <div key={platform} className="flex items-center">
                    <span className="text-gray-600 capitalize w-20">{platform}:</span>
                    <span className="text-indigo-600">{handle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['tracks', 'albums', 'store', 'subscribe'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'tracks' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {artist.tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <div className="w-8 text-center text-gray-500 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 mx-4">
                        <h4 className="font-medium text-gray-900">{track.title}</h4>
                        <p className="text-sm text-gray-500">{formatNumber(track.streams)} streams</p>
                      </div>
                      <div className="text-sm text-gray-500 mr-4">
                        {track.duration}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mr-4">
                        ${track.price}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <Play className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'albums' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artist.albums.map((album) => (
                    <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{album.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(album.releaseDate)} • {album.tracks} tracks
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">${album.price}</span>
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                            Buy Album
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'subscribe' && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Support {artist.name}</h3>
                  <p className="text-gray-600 mb-6">Get exclusive content, early releases, and direct access through subscription tiers.</p>
                  <Link
                    href={`/artist/${artist.id}/subscribe`}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Crown className="w-4 h-4" />
                    View Subscription Tiers
                  </Link>
                </div>
              )}

              {activeTab === 'store' && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Visit {artist.name}'s Store</h3>
                  <p className="text-gray-600 mb-6">Discover exclusive merchandise, music, and digital content from this artist.</p>
                  <Link
                    href={`/artist/${artist.id}/store`}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Browse Store
                  </Link>
                </div>
              )}

              {activeTab === 'merchandise' && (
                <div>
                  {artist.merchandise.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artist.merchandise.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="aspect-square bg-gray-200"></div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">${item.price}</span>
                              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No merchandise available</h3>
                      <p className="text-gray-600">This artist hasn't added any merchandise yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
