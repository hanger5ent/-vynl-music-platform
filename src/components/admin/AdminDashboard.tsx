'use client'

import { useState, useEffect, useCallback } from 'react'
import { InviteCreator } from '@/components/admin/InviteCreator'
import { UserManagement } from '@/components/admin/UserManagement'
import { ContentModeration } from '@/components/admin/ContentModeration'
import { Analytics } from '@/components/admin/Analytics'
import { SystemSettings } from '@/components/admin/SystemSettings'
import { BetaSettings } from '@/components/admin/BetaSettings'
import { AdManagement } from '@/components/admin/AdManagement'
import { ApplicationsReview } from '@/components/admin/ApplicationsReview'
import { Loader2 } from 'lucide-react'

type Tab = 'overview' | 'users' | 'invites' | 'applications' | 'content' | 'analytics' | 'settings' | 'beta' | 'ads'

interface Stats {
  totalUsers: number
  totalCreators: number
  totalTracks: number
  totalPlays: number
  pendingApplications: number
}

interface ActivityItem {
  id: string
  message: string
  createdAt: string
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview' as Tab, name: 'Overview', icon: '📊' },
    { id: 'users' as Tab, name: 'Users', icon: '👥' },
    { id: 'invites' as Tab, name: 'Invites', icon: '✉️' },
    { id: 'applications' as Tab, name: 'Applications', icon: '📝', badge: stats?.pendingApplications },
    { id: 'content' as Tab, name: 'Content', icon: '🎵' },
    { id: 'ads' as Tab, name: 'Ads', icon: '📢' },
    { id: 'analytics' as Tab, name: 'Analytics', icon: '📈' },
    { id: 'settings' as Tab, name: 'Settings', icon: '⚙️' },
    { id: 'beta' as Tab, name: 'Beta', icon: '🚀' },
  ]

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {!!tab.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          loading ? (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🎤</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Creators</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalCreators}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🎵</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tracks</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalTracks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">▶️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Plays</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalPlays}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">📝</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Apps</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                          <p className="text-sm text-gray-600 flex-1">{item.message}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'invites' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Create User Invites</h3>
            <InviteCreator />
          </div>
        )}
        {activeTab === 'applications' && <ApplicationsReview />}
        {activeTab === 'content' && <ContentModeration />}
        {activeTab === 'ads' && <AdManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <SystemSettings />}
        {activeTab === 'beta' && <BetaSettings />}
      </div>
    </div>
  )
}
