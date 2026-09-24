'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Crown,
  Heart,
  Users,
  Check,
  Plus,
  Star,
  Loader2
} from 'lucide-react'

interface Creator {
  id: string
  name: string
  username: string
  avatar: string | null
  isVerified: boolean
  genre: string[]
  followerCount: number
  totalStreams: number
}

interface Subscription {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string | null
  creatorVerified: boolean
  tierName: string
  amount: number
  currency: string
  status: string
  startDate: string
  nextBilling: string | null
}

interface CreatorSubscriptionsProps {
  artistId?: string
  showAllArtists?: boolean
}

export default function CreatorSubscriptions({ artistId, showAllArtists = true }: CreatorSubscriptionsProps) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeTab, setActiveTab] = useState<'discover' | 'subscriptions'>('discover')
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [creatorsRes, subsRes] = await Promise.all([
        showAllArtists || !artistId
          ? fetch('/api/artists?sortBy=followers&limit=12')
          : fetch(`/api/artists/${artistId}`),
        fetch('/api/fan/subscriptions'),
      ])
      if (creatorsRes.ok) {
        const data = await creatorsRes.json()
        if (showAllArtists || !artistId) {
          setCreators(data.artists || [])
        } else if (data.artist) {
          setCreators([{
            id: data.artist.id,
            name: data.artist.name,
            username: data.artist.username,
            avatar: data.artist.avatar,
            isVerified: data.artist.isVerified,
            genre: data.artist.creatorProfile?.genre || [],
            followerCount: data.artist.followerCount,
            totalStreams: data.artist.totalStreams,
          }])
        }
      }
      if (subsRes.ok) {
        const data = await subsRes.json()
        setSubscriptions(data.subscriptions || [])
      }
    } finally {
      setLoading(false)
    }
  }, [artistId, showAllArtists])

  useEffect(() => { fetchData() }, [fetchData])

  const cancelSubscription = async (subscriptionId: string) => {
    setCancellingId(subscriptionId)
    try {
      const res = await fetch(`/api/fan/subscriptions/${subscriptionId}/cancel`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSubscriptions((prev) => prev.map((s) => (s.id === subscriptionId ? { ...s, status: data.subscription.status } : s)))
      }
    } finally {
      setCancellingId(null)
    }
  }

  const isSubscribedTo = (creatorId: string) =>
    subscriptions.some((s) => s.creatorId === creatorId && s.status === 'ACTIVE')

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
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
            My Subscriptions ({subscriptions.filter((s) => s.status === 'ACTIVE').length})
          </button>
        </nav>
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No creators to show yet.</div>
          ) : creators.map((creator) => {
            const subscribed = isSubscribedTo(creator.id)
            return (
              <div key={creator.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                      {creator.isVerified && (
                        <div className="bg-blue-500 rounded-full p-0.5 flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    {creator.genre.length > 0 && (
                      <p className="text-sm text-gray-600 truncate">{creator.genre.join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-500">{creator.followerCount.toLocaleString()} followers</p>
                  </div>
                </div>

                <Link
                  href={subscribed ? `/artist/${creator.id}` : `/artist/${creator.id}/subscribe`}
                  className={`w-full block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    subscribed
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {subscribed ? (
                    <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4" /> Subscribed</span>
                  ) : (
                    'View Tiers & Subscribe'
                  )}
                </Link>
              </div>
            )
          })}
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
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{subscription.creatorName}</h3>
                        <p className="text-sm font-medium text-purple-600">{subscription.tierName}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      subscription.status === 'PAST_DUE' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.status.charAt(0) + subscription.status.slice(1).toLowerCase()}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${subscription.amount.toFixed(2)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    {subscription.status === 'ACTIVE' && subscription.nextBilling && (
                      <div className="flex justify-between">
                        <span>Next billing:</span>
                        <span>{new Date(subscription.nextBilling).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/artist/${subscription.creatorId}`}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm text-center transition-colors"
                    >
                      View Profile
                    </Link>
                    {subscription.status === 'ACTIVE' && (
                      <button
                        onClick={() => cancelSubscription(subscription.id)}
                        disabled={cancellingId === subscription.id}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        {cancellingId === subscription.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
