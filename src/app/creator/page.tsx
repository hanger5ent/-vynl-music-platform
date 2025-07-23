'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MarketingHub } from '@/components/creator/MarketingHub'
import Link from 'next/link'
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Music, 
  Settings,
  BarChart3,
  Plus,
  Edit,
  CheckCircle,
  Megaphone
} from 'lucide-react'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  description: string
  features: string[]
  color: string
  subscriberCount: number
  isActive: boolean
  monthlyRevenue: number
}

interface Subscriber {
  id: string
  name: string
  email: string
  tierName: string
  tierColor: string
  startDate: string
  nextBilling: string
  status: 'active' | 'cancelled' | 'expired'
  totalPaid: number
}

export default function CreatorDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    monthlyRecurringRevenue: 0,
    totalRevenue: 0,
    averageRevenuePerUser: 0,
    churnRate: 0,
    views: 254612,
    activeListeners: 256
  })

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockTiers: SubscriptionTier[] = [
      {
        id: 'fan-tier',
        name: 'Fan',
        price: 4.99,
        interval: 'monthly',
        description: 'Support and get exclusive content',
        features: ['Early access to new releases', 'Exclusive behind-the-scenes content', 'Fan-only Discord community'],
        color: 'blue',
        subscriberCount: 156,
        isActive: true,
        monthlyRevenue: 779.44
      },
      {
        id: 'supporter-tier',
        name: 'Supporter',
        price: 9.99,
        interval: 'monthly',
        description: 'Enhanced support with extra perks',
        features: ['All Fan benefits', 'Monthly virtual meet & greet', 'Personalized thank you messages', 'Demo tracks access'],
        color: 'purple',
        subscriberCount: 89,
        isActive: true,
        monthlyRevenue: 889.11
      },
      {
        id: 'vip-tier',
        name: 'VIP',
        price: 19.99,
        interval: 'monthly',
        description: 'Ultimate fan experience',
        features: ['All Supporter benefits', 'Private video calls', 'Custom requests', 'Merchandise discounts', 'Concert tickets priority'],
        color: 'gold',
        subscriberCount: 34,
        isActive: true,
        monthlyRevenue: 679.66
      }
    ]

    const mockSubscribers: Subscriber[] = [
      {
        id: 'sub-1',
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        tierName: 'VIP',
        tierColor: 'gold',
        startDate: '2024-10-15',
        nextBilling: '2025-01-15',
        status: 'active',
        totalPaid: 59.97
      },
      {
        id: 'sub-2',
        name: 'Sarah Miller',
        email: 'sarah.miller@example.com',
        tierName: 'Supporter',
        tierColor: 'purple',
        startDate: '2024-11-01',
        nextBilling: '2025-01-01',
        status: 'active',
        totalPaid: 19.98
      },
      {
        id: 'sub-3',
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        tierName: 'Fan',
        tierColor: 'blue',
        startDate: '2024-12-01',
        nextBilling: '2025-01-01',
        status: 'active',
        totalPaid: 4.99
      }
    ]

    setSubscriptionTiers(mockTiers)
    setSubscribers(mockSubscribers)
    
    const totalSubs = mockTiers.reduce((sum, tier) => sum + tier.subscriberCount, 0)
    const totalMRR = mockTiers.reduce((sum, tier) => sum + tier.monthlyRevenue, 0)
    
    setStats({
      totalSubscribers: totalSubs,
      monthlyRecurringRevenue: totalMRR,
      totalRevenue: 15847.32,
      averageRevenuePerUser: totalMRR / totalSubs,
      churnRate: 3.2,
      views: 254612,
      activeListeners: 256
    })
  }, [])

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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Subscribers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalSubscribers}</p>
                    <p className="text-xs text-green-600">+12% this month</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Monthly Recurring Revenue */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-green-600">${stats.monthlyRecurringRevenue.toFixed(0)}</p>
                    <p className="text-xs text-green-600">+8% this month</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Views */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Views</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.views.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">+15% this week</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Active Listeners */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listeners</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.activeListeners}</p>
                    <p className="text-xs text-orange-600">+5% this week</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${stats.monthlyRecurringRevenue.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Subscriptions</div>
                  <div className="text-xs text-gray-500">Monthly recurring</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$1,240</div>
                  <div className="text-sm text-gray-600">Track Sales</div>
                  <div className="text-xs text-gray-500">One-time purchases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$325</div>
                  <div className="text-sm text-gray-600">Tips & Donations</div>
                  <div className="text-xs text-gray-500">Fan support</div>
                </div>
              </div>
            </div>

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
                <button className="flex items-center gap-3 p-4 border-2 border-dashed border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
                  <Music className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Upload Track</span>
                </button>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="h-4 w-4" />
                Create New Tier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier) => (
                <div key={tier.id} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                      <p className="text-sm text-gray-600">{tier.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <div className={`w-3 h-3 rounded-full ${tier.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
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
                        {tier.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {tier.features.length > 3 && (
                          <li className="text-xs text-gray-500">+{tier.features.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscription Analytics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${stats.averageRevenuePerUser.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">ARPU</div>
                  <div className="text-xs text-gray-500">Average Revenue Per User</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.churnRate}%</div>
                  <div className="text-sm text-gray-600">Churn Rate</div>
                  <div className="text-xs text-gray-500">Monthly cancellations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-xs text-gray-500">All-time earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">97%</div>
                  <div className="text-sm text-gray-600">Retention</div>
                  <div className="text-xs text-gray-500">3-month retention rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && <MarketingHub />}

        {/* Other tabs placeholder */}
        {(activeTab === 'analytics' || activeTab === 'content' || activeTab === 'subscribers') && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'analytics' ? <BarChart3 className="h-8 w-8 text-gray-400" /> : 
               activeTab === 'subscribers' ? <Users className="h-8 w-8 text-gray-400" /> :
               <Music className="h-8 w-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'analytics' ? 'Analytics Dashboard' : 
               activeTab === 'subscribers' ? 'Subscriber Management' :
               'Content Management'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'analytics' 
                ? 'Detailed analytics and insights coming soon.' 
                : activeTab === 'subscribers'
                ? 'Manage your subscribers and communication tools.'
                : 'Upload and manage your music content here.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
