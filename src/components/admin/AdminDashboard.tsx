'use client'

import { useState, useEffect } from 'react'
import { InviteCreator } from '@/components/admin/InviteCreator'
import { UserManagement } from '@/components/admin/UserManagement'
import { ContentModeration } from '@/components/admin/ContentModeration'
import { Analytics } from '@/components/admin/Analytics'
import { SystemSettings } from '@/components/admin/SystemSettings'
import { BetaSettings } from '@/components/admin/BetaSettings'
import { AdManagement } from '@/components/admin/AdManagement'

type Tab = 'overview' | 'users' | 'invites' | 'content' | 'analytics' | 'settings' | 'beta' | 'ads'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalArtists: 0,
    totalTracks: 0,
    pendingApplications: 0,
  })

  const tabs = [
    { id: 'overview' as Tab, name: 'Overview', icon: '📊' },
    { id: 'users' as Tab, name: 'Users', icon: '👥' },
    { id: 'invites' as Tab, name: 'Invites', icon: '✉️' },
    { id: 'content' as Tab, name: 'Content', icon: '🎵' },
    { id: 'ads' as Tab, name: 'Ads', icon: '📢' },
    { id: 'analytics' as Tab, name: 'Analytics', icon: '📈' },
    { id: 'settings' as Tab, name: 'Settings', icon: '⚙️' },
    { id: 'beta' as Tab, name: 'Beta', icon: '🚀' },
  ]

  useEffect(() => {
    // In a real app, fetch actual stats from your API
    setStats({
      totalUsers: 1247,
      activeUsers: 892,
      totalArtists: 156,
      totalTracks: 3421,
      pendingApplications: 23,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
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
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✨</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
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
                    <p className="text-sm font-medium text-gray-500">Artists</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalArtists}</p>
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
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">New ad request: Sarah Martinez - EP Launch Campaign ($800)</p>
                    <span className="text-xs text-gray-400">5 minutes ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">New user registration: john.doe@example.com</p>
                    <span className="text-xs text-gray-400">12 minutes ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Creator application submitted by Sarah Music</p>
                    <span className="text-xs text-gray-400">15 minutes ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">New track uploaded: &quot;Summer Vibes&quot; by DJ Alex</p>
                    <span className="text-xs text-gray-400">1 hour ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Ad campaign completed: Summer Festival ($2,800 spent)</p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'invites' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Create User Invites</h3>
            <InviteCreator />
          </div>
        )}
        {activeTab === 'content' && <ContentModeration />}
        {activeTab === 'ads' && <AdManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <SystemSettings />}
        {activeTab === 'beta' && <BetaSettings />}
      </div>
    </div>
  )
}
