'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MarketingHub } from '@/components/creator/MarketingHub'
import { AnalyticsDashboard } from '@/components/creator/AnalyticsDashboard'
import SubscriberManager from '@/components/creator/SubscriberManager'
import EditTierModal from '@/components/creator/EditTierModal'
import Link from 'next/link'
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Music,
  BarChart3,
  CheckCircle,
  Megaphone,
  Loader2,
  Pencil
} from 'lucide-react'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  isActive: boolean
  isCustomized: boolean
  subscriberCount: number
  monthlyRevenue: number
}

interface DashboardData {
  overview: {
    totalSubscribers: number
    monthlyRecurringRevenue: number
    totalRevenue: number
    totalTracks: number
    totalPlays: number
  }
  revenueBreakdown: {
    subscriptions: number
    trackSales: number
    merchandise: number
  }
  tiers: SubscriptionTier[]
  analytics: {
    arpu: number
    cancellationRate: number
  }
}

export default function CreatorDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/creator/dashboard')
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const overview = data?.overview
  const revenueBreakdown = data?.revenueBreakdown
  const tiers = data?.tiers || []
  const analytics = data?.analytics

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Creator Dashboard 🎵
          </h1>
          <p className="text-gray-600">Manage your music, subscribers, and earnings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
              { id: 'subscribers', label: 'Subscribers', icon: Users },
              { id: 'marketing', label: 'Marketing', icon: Megaphone },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'content', label: 'Content', icon: Music }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
        <>
        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                    <p className="text-3xl font-bold text-purple-600">{overview.totalSubscribers}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-green-600">${overview.monthlyRecurringRevenue.toFixed(0)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tracks</p>
                    <p className="text-3xl font-bold text-blue-600">{overview.totalTracks}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Music className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Plays</p>
                    <p className="text-3xl font-bold text-orange-600">{overview.totalPlays.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            {revenueBreakdown && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Sources</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${revenueBreakdown.subscriptions.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Subscriptions</div>
                    <div className="text-xs text-gray-500">Net of platform fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${revenueBreakdown.trackSales.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Track &amp; Album Sales</div>
                    <div className="text-xs text-gray-500">Net of platform fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${revenueBreakdown.merchandise.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Merchandise</div>
                    <div className="text-xs text-gray-500">Net of platform fee</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                >
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Manage Tiers</span>
                </button>
                <Link
                  href="/creator/studio"
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <Music className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Upload Track</span>
                </Link>
                <button
                  onClick={() => setActiveTab('subscribers')}
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">View Fans</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Subscription Tiers</h2>
            </div>
            <p className="text-sm text-gray-500 -mt-4">
              Customize the name, price, and perks for each tier. Fans only see tiers you&apos;ve turned on.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${tier.isActive ? 'border-purple-500' : 'border-gray-300 opacity-75'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                      {!tier.isActive && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Not offered to fans
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingTier(tier)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      aria-label={`Edit ${tier.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${tier.price}</p>
                        <p className="text-xs text-gray-500">per {tier.interval}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{tier.subscriberCount}</p>
                        <p className="text-xs text-gray-500">subscribers</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Monthly Revenue</p>
                      <p className="text-lg font-bold text-green-600">${tier.monthlyRevenue.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Features:</p>
                      <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscription Analytics */}
            {overview && analytics && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${analytics.arpu.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">ARPU</div>
                    <div className="text-xs text-gray-500">Average Revenue Per User</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.cancellationRate}%</div>
                    <div className="text-sm text-gray-600">Cancellation Rate</div>
                    <div className="text-xs text-gray-500">Of all-time subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${overview.totalRevenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-xs text-gray-500">All-time earnings</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && <SubscriberManager />}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && <MarketingHub />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard userId={session?.user?.id} />}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Management</h3>
            <p className="text-gray-600 mb-4">Upload and manage your music content in the studio.</p>
            <Link
              href="/creator/studio"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Music className="h-4 w-4" />
              Go to Studio
            </Link>
          </div>
        )}
        </>
        )}

        {editingTier && (
          <EditTierModal
            tier={editingTier}
            onClose={() => setEditingTier(null)}
            onSaved={fetchDashboard}
          />
        )}
      </div>
    </div>
  )
}
