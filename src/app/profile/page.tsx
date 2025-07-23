'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/ui/Card'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    location: '',
  })

  const handleSave = async () => {
    try {
      // In a real app, you'd save to your database
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      {session.user.avatar ? (
                        <img
                          src={session.user.avatar}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-gray-600">
                          {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        Change Photo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{session.user.name || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900">{session.user.email}</p>
                      <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-gray-900">{formData.bio || 'No bio set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.location || 'Not set'}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Account Stats & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">Dec 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscriptions</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Following</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href="/dashboard"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/discover"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Discover Music
                  </a>
                  {session.user.isArtist && (
                    <a
                      href="/artist"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50"
                    >
                      Artist Dashboard
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
