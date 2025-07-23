'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { UseInviteForm } from '@/components/auth/UseInviteForm'
import { Music, Heart, ShoppingCart, Users, TrendingUp, Star } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [showInviteForm, setShowInviteForm] = useState(false)

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            {session?.user?.isArtist 
              ? 'Manage your music, analytics, and fan engagement.' 
              : 'Discover amazing music and support your favorite artists.'
            }
          </p>
        </div>

        {/* Creator Status */}
        {!session?.user?.isArtist && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  🎵 Become a Creator
                </h2>
                <p className="text-gray-600 mb-4">
                  Ready to share your music with the world? Join our exclusive creator community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/for-artists"
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-center"
                  >
                    Apply for Creator Access
                  </Link>
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="inline-block border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Use Invitation Code
                  </button>
                </div>
              </div>
            </div>
            
            {showInviteForm && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <UseInviteForm onSuccess={() => {
                  setShowInviteForm(false)
                  window.location.reload() // Refresh to update user session
                }} />
              </div>
            )}
          </div>
        )}

        {/* Artist Dashboard */}
        {session?.user?.isArtist && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Creator Dashboard
              </h2>
              <p className="opacity-90">
                Manage your music, track analytics, and connect with fans.
              </p>
              <Link
                href="/creator"
                className="inline-block mt-4 bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Go to Creator Dashboard
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Library */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Music className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">My Library</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Access your purchased tracks, albums, and saved music.
            </p>
            <Link
              href="/dashboard/library"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Library
            </Link>
          </div>

          {/* Playlists */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-pink-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Playlists</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Create and manage your custom playlists.
            </p>
            <Link
              href="/dashboard/playlists"
              className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
            >
              My Playlists
            </Link>
          </div>

          {/* Following */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Following</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Artists and creators you follow.
            </p>
            <Link
              href="/dashboard/following"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              View Following
            </Link>
          </div>

          {/* Purchases */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <ShoppingCart className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Purchases</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Your purchase history and downloads.
            </p>
            <Link
              href="/dashboard/purchases"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              View Purchases
            </Link>
          </div>

          {/* Discover */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Discover</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Find new artists and trending music.
            </p>
            <Link
              href="/artists"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Explore Artists
            </Link>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Star className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your account and preferences.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Account Settings
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">24</div>
              <div className="text-sm text-gray-600">Tracks Owned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">8</div>
              <div className="text-sm text-gray-600">Playlists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">$47.50</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
