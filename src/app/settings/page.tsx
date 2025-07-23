'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Music, 
  Palette, 
  Globe, 
  Download,
  Eye,
  EyeOff,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: '@user',
    bio: '',
    location: '',
    website: '',
    phone: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewFollowers: true,
    emailNewMusic: true,
    emailPromotions: false,
    pushNewFollowers: true,
    pushNewMusic: true,
    pushPromotions: false
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    playlistVisibility: 'public',
    activityVisibility: 'friends',
    allowMessages: 'everyone'
  })

  const [audioSettings, setAudioSettings] = useState({
    quality: 'high',
    autoplay: true,
    crossfade: false,
    volume: 80,
    normalization: true
  })

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  {/* Profile Picture */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNewFollowers', label: 'New followers', desc: 'Get notified when someone follows you' },
                          { key: 'emailNewMusic', label: 'New music releases', desc: 'Get notified about new releases from artists you follow' },
                          { key: 'emailPromotions', label: 'Promotions and offers', desc: 'Receive promotional emails and special offers' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: e.target.checked
                              })}
                              className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Push Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'pushNewFollowers', label: 'New followers', desc: 'Get push notifications for new followers' },
                          { key: 'pushNewMusic', label: 'New music releases', desc: 'Get push notifications for new releases' },
                          { key: 'pushPromotions', label: 'Promotions and offers', desc: 'Receive push notifications for promotions' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: e.target.checked
                              })}
                              className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="public">Public - Anyone can see your profile</option>
                        <option value="friends">Friends - Only people you follow can see your profile</option>
                        <option value="private">Private - Only you can see your profile</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Playlist Visibility</label>
                      <select
                        value={privacySettings.playlistVisibility}
                        onChange={(e) => setPrivacySettings({...privacySettings, playlistVisibility: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="public">Public - Anyone can see your playlists</option>
                        <option value="friends">Friends - Only people you follow can see your playlists</option>
                        <option value="private">Private - Only you can see your playlists</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Visibility</label>
                      <select
                        value={privacySettings.activityVisibility}
                        onChange={(e) => setPrivacySettings({...privacySettings, activityVisibility: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="public">Public - Anyone can see your activity</option>
                        <option value="friends">Friends - Only people you follow can see your activity</option>
                        <option value="private">Private - Hide your activity</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Who can message you</label>
                      <select
                        value={privacySettings.allowMessages}
                        onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="friends">People I follow</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Settings */}
              {activeTab === 'audio' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Audio Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Audio Quality</label>
                      <select
                        value={audioSettings.quality}
                        onChange={(e) => setAudioSettings({...audioSettings, quality: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="low">Low - 96 kbps</option>
                        <option value="normal">Normal - 160 kbps</option>
                        <option value="high">High - 320 kbps</option>
                        <option value="lossless">Lossless - FLAC</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioSettings.volume}
                        onChange={(e) => setAudioSettings({...audioSettings, volume: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>0%</span>
                        <span>{audioSettings.volume}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={audioSettings.autoplay}
                          onChange={(e) => setAudioSettings({...audioSettings, autoplay: e.target.checked})}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Autoplay</p>
                          <p className="text-sm text-gray-600">Automatically play similar music when your music ends</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={audioSettings.crossfade}
                          onChange={(e) => setAudioSettings({...audioSettings, crossfade: e.target.checked})}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Crossfade</p>
                          <p className="text-sm text-gray-600">Smoothly transition between songs</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={audioSettings.normalization}
                          onChange={(e) => setAudioSettings({...audioSettings, normalization: e.target.checked})}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Audio Normalization</p>
                          <p className="text-sm text-gray-600">Set the same volume level for all tracks</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                      <p className="text-gray-600">Free Plan</p>
                      <p className="text-sm text-gray-500 mt-1">Upgrade to Premium for unlimited music access</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Payment Methods</h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600">No payment methods added</p>
                        <button className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Billing History</h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600">No billing history available</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Appearance</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((theme) => (
                          <label key={theme} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="theme"
                              value={theme}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="capitalize font-medium">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
