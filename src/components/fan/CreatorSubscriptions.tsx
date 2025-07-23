'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Crown, 
  Star, 
  Heart, 
  Music, 
  Users, 
  Gift,
  Check,
  Zap,
  Shield,
  Download,
  Headphones,
  MessageCircle,
  Calendar,
  Ticket,
  X,
  Plus,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  description: string
  features: string[]
  color: string
  icon: React.ComponentType<any>
  badge?: string
  isPopular?: boolean
  artistId: string
  artistName: string
  subscriberCount: number
}

interface Artist {
  id: string
  name: string
  genre: string
  avatar: string
  followers: number
  isVerified: boolean
  bio: string
  subscriptionTiers: SubscriptionTier[]
}

interface Subscription {
  id: string
  artistId: string
  artistName: string
  tierName: string
  tierColor: string
  price: number
  interval: string
  startDate: string
  nextBilling: string
  status: 'active' | 'cancelled' | 'expired'
}

interface CreatorSubscriptionsProps {
  artistId?: string
  showAllArtists?: boolean
}

export default function CreatorSubscriptions({ artistId, showAllArtists = true }: CreatorSubscriptionsProps) {
  const { data: session } = useSession()
  const [artists, setArtists] = useState<Artist[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [activeTab, setActiveTab] = useState<'discover' | 'subscriptions'>('discover')
  const [loading, setLoading] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Neon Nights',
        genre: 'Synthwave',
        avatar: '/api/placeholder/80/80',
        followers: 12500,
        isVerified: true,
        bio: 'Creating dreamy synthwave soundscapes for the digital age.',
        subscriptionTiers: [
          {
            id: 'fan-1',
            name: 'Fan',
            price: 4.99,
            interval: 'monthly',
            description: 'Support and get exclusive content',
            features: [
              'Early access to new releases',
              'Exclusive behind-the-scenes content',
              'Monthly fan-only livestream',
              'Digital wallpapers and artwork'
            ],
            color: 'blue',
            icon: Heart,
            artistId: '1',
            artistName: 'Neon Nights',
            subscriberCount: 342
          },
          {
            id: 'supporter-1',
            name: 'Supporter',
            price: 9.99,
            interval: 'monthly',
            description: 'Enhanced support with more perks',
            features: [
              'All Fan tier benefits',
              'High-quality FLAC downloads',
              'Exclusive remixes and B-sides',
              'Direct message access',
              'Monthly video calls (group)',
              'Physical stickers pack'
            ],
            color: 'purple',
            icon: Star,
            badge: 'Popular',
            isPopular: true,
            artistId: '1',
            artistName: 'Neon Nights',
            subscriberCount: 156
          },
          {
            id: 'vip-1',
            name: 'VIP',
            price: 19.99,
            interval: 'monthly',
            description: 'Ultimate fan experience',
            features: [
              'All previous tier benefits',
              'Personalized voice messages',
              '1-on-1 video call (quarterly)',
              'Signed physical merchandise',
              'Concert ticket presale access',
              'Input on upcoming projects',
              'Annual VIP meetup invitation'
            ],
            color: 'gold',
            icon: Crown,
            badge: 'Exclusive',
            artistId: '1',
            artistName: 'Neon Nights',
            subscriberCount: 23
          }
        ]
      },
      {
        id: '2',
        name: 'Synthwave Stars',
        genre: 'Electronic',
        avatar: '/api/placeholder/80/80',
        followers: 8300,
        isVerified: true,
        bio: 'Retro-futuristic electronic music with a modern twist.',
        subscriptionTiers: [
          {
            id: 'fan-2',
            name: 'Cosmic Fan',
            price: 3.99,
            interval: 'monthly',
            description: 'Join the cosmic journey',
            features: [
              'Exclusive track previews',
              'Monthly playlist curation',
              'Fan community access',
              'Digital artwork collection'
            ],
            color: 'cyan',
            icon: Sparkles,
            artistId: '2',
            artistName: 'Synthwave Stars',
            subscriberCount: 189
          },
          {
            id: 'stellar-2',
            name: 'Stellar Supporter',
            price: 12.99,
            interval: 'monthly',
            description: 'Stellar level of support',
            features: [
              'All Cosmic Fan benefits',
              'Stem files for remixing',
              'Production tutorials',
              'Monthly production livestream',
              'Exclusive vinyl pressings',
              'Concert meet & greet passes'
            ],
            color: 'indigo',
            icon: Zap,
            badge: 'Best Value',
            isPopular: true,
            artistId: '2',
            artistName: 'Synthwave Stars',
            subscriberCount: 87
          }
        ]
      }
    ]

    const mockSubscriptions: Subscription[] = [
      {
        id: 'sub-1',
        artistId: '1',
        artistName: 'Neon Nights',
        tierName: 'Supporter',
        tierColor: 'purple',
        price: 9.99,
        interval: 'monthly',
        startDate: '2024-12-01',
        nextBilling: '2025-01-01',
        status: 'active'
      }
    ]

    if (artistId && !showAllArtists) {
      setArtists(mockArtists.filter(a => a.id === artistId))
    } else {
      setArtists(mockArtists)
    }
    setSubscriptions(mockSubscriptions)
  }, [artistId, showAllArtists])

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        artistId: tier.artistId,
        artistName: tier.artistName,
        tierName: tier.name,
        tierColor: tier.color,
        price: tier.price,
        interval: tier.interval,
        startDate: new Date().toISOString().split('T')[0],
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      }
      setSubscriptions(prev => [...prev, newSubscription])
      setShowSubscribeModal(false)
      setSelectedTier(null)
      setLoading(false)
    }, 2000)
  }

  const cancelSubscription = (subscriptionId: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, status: 'cancelled' as const }
          : sub
      )
    )
  }

  const getTierColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      gold: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getTierButtonClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      gold: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      cyan: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Creator Subscriptions</h2>
          <p className="text-gray-600">Support your favorite artists and get exclusive perks</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discover'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Subscriptions ({subscriptions.filter(s => s.status === 'active').length})
          </button>
        </nav>
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-8">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-xl shadow-sm p-6">
              {/* Artist Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900">{artist.name}</h3>
                    {artist.isVerified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{artist.genre}</p>
                  <p className="text-sm text-gray-500">{artist.followers.toLocaleString()} followers</p>
                </div>
                <Link
                  href={`/artist/${artist.id}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View Profile →
                </Link>
              </div>

              {/* Subscription Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artist.subscriptionTiers.map((tier) => {
                  const Icon = tier.icon
                  const isSubscribed = subscriptions.some(
                    sub => sub.artistId === artist.id && sub.tierName === tier.name && sub.status === 'active'
                  )

                  return (
                    <div
                      key={tier.id}
                      className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                        tier.isPopular
                          ? 'border-purple-300 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${getTierColorClasses(tier.color)}`}
                    >
                      {/* Popular Badge */}
                      {tier.badge && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {tier.badge}
                          </span>
                        </div>
                      )}

                      {/* Tier Header */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex p-3 rounded-lg mb-3 ${
                          tier.color === 'blue' ? 'bg-blue-100' :
                          tier.color === 'purple' ? 'bg-purple-100' :
                          tier.color === 'gold' ? 'bg-yellow-100' :
                          tier.color === 'cyan' ? 'bg-cyan-100' :
                          'bg-indigo-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            tier.color === 'blue' ? 'text-blue-600' :
                            tier.color === 'purple' ? 'text-purple-600' :
                            tier.color === 'gold' ? 'text-yellow-600' :
                            tier.color === 'cyan' ? 'text-cyan-600' :
                            'text-indigo-600'
                          }`} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{tier.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                        <div className="text-2xl font-bold text-gray-900">
                          ${tier.price}<span className="text-sm font-normal text-gray-500">/{tier.interval}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {tier.subscriberCount} supporters
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Subscribe Button */}
                      <button
                        onClick={() => {
                          if (!isSubscribed) {
                            setSelectedTier(tier)
                            setSelectedArtist(artist)
                            setShowSubscribeModal(true)
                          }
                        }}
                        disabled={isSubscribed}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          isSubscribed
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : getTierButtonClasses(tier.color)
                        }`}
                      >
                        {isSubscribed ? 'Subscribed' : `Subscribe for $${tier.price}`}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
              <p className="text-gray-600 mb-6">Start supporting your favorite artists to get exclusive content and perks</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Discover Artists
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.artistName}</h3>
                      <p className={`text-sm font-medium ${
                        subscription.tierColor === 'purple' ? 'text-purple-600' :
                        subscription.tierColor === 'blue' ? 'text-blue-600' :
                        subscription.tierColor === 'gold' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {subscription.tierName} Tier
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${subscription.price}/{subscription.interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    {subscription.status === 'active' && (
                      <div className="flex justify-between">
                        <span>Next billing:</span>
                        <span>{new Date(subscription.nextBilling).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/artist/${subscription.artistId}`}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm text-center transition-colors"
                    >
                      View Profile
                    </Link>
                    {subscription.status === 'active' && (
                      <button
                        onClick={() => cancelSubscription(subscription.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedTier && selectedArtist && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowSubscribeModal(false)} />
            <div className="relative bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subscribe to {selectedArtist.name}</h3>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-lg mb-3 ${
                  selectedTier.color === 'blue' ? 'bg-blue-100' :
                  selectedTier.color === 'purple' ? 'bg-purple-100' :
                  selectedTier.color === 'gold' ? 'bg-yellow-100' :
                  selectedTier.color === 'cyan' ? 'bg-cyan-100' :
                  'bg-indigo-100'
                }`}>
                  <selectedTier.icon className={`h-6 w-6 ${
                    selectedTier.color === 'blue' ? 'text-blue-600' :
                    selectedTier.color === 'purple' ? 'text-purple-600' :
                    selectedTier.color === 'gold' ? 'text-yellow-600' :
                    selectedTier.color === 'cyan' ? 'text-cyan-600' :
                    'text-indigo-600'
                  }`} />
                </div>
                <h4 className="text-xl font-semibold mb-2">{selectedTier.name}</h4>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  ${selectedTier.price}<span className="text-sm font-normal text-gray-500">/{selectedTier.interval}</span>
                </p>
                <p className="text-gray-600">{selectedTier.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {selectedTier.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {selectedTier.features.length > 4 && (
                  <p className="text-sm text-gray-500">+ {selectedTier.features.length - 4} more benefits</p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(selectedTier)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : getTierButtonClasses(selectedTier.color)
                }`}
              >
                {loading ? 'Processing...' : `Subscribe for $${selectedTier.price}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment • Cancel anytime • Instant access
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
