'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'

interface MarketingRequest {
  id: string
  title: string
  description: string
  adType: 'banner' | 'sponsored-post' | 'video' | 'audio-spot'
  budget: number
  targetAudience: string
  preferredStartDate: string
  status: 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected'
  submittedAt?: string
  adminNotes?: string
}

export function CreatorMarketingHub() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Mock data for existing requests
  const [marketingRequests] = useState<MarketingRequest[]>([
    {
      id: '1',
      title: 'New EP Launch Campaign',
      description: 'Promote my upcoming 5-track EP "Urban Dreams" targeting indie music fans.',
      adType: 'sponsored-post',
      budget: 800,
      targetAudience: 'Indie music fans, age 18-35, urban areas',
      preferredStartDate: '2025-08-01',
      status: 'in-review',
      submittedAt: '2025-07-20T10:30:00Z',
    },
    {
      id: '2',
      title: 'Summer Concert Series',
      description: 'Promote my acoustic concert series happening every Friday in August.',
      adType: 'banner',
      budget: 500,
      targetAudience: 'Local music fans, acoustic music lovers',
      preferredStartDate: '2025-07-28',
      status: 'approved',
      submittedAt: '2025-07-15T14:20:00Z',
      adminNotes: 'Great concept! Approved with budget adjustment to maximize reach.'
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adType: 'sponsored-post' as const,
    budget: 500,
    targetAudience: '',
    preferredStartDate: '',
    goals: '',
    additionalInfo: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting marketing request:', formData)
    // In a real app, this would send the request to your API
    setShowRequestForm(false)
    setFormData({
      title: '',
      description: '',
      adType: 'sponsored-post',
      budget: 500,
      targetAudience: '',
      preferredStartDate: '',
      goals: '',
      additionalInfo: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'in-review':
        return 'bg-blue-100 text-blue-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const MarketingOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Active Campaigns</div>
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-sm text-green-600">1 approved this month</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Total Reach</div>
          <div className="text-2xl font-bold text-gray-900">24,500</div>
          <div className="text-sm text-blue-600">Estimated impressions</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Marketing Budget Used</div>
          <div className="text-2xl font-bold text-gray-900">$450</div>
          <div className="text-sm text-purple-600">of $1,300 total</div>
        </Card>
      </div>

      {/* Marketing Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Marketing Tips for Creators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Target Your Audience</div>
                <div className="text-sm text-gray-600">Be specific about your ideal listeners - age, interests, location</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Choose the Right Format</div>
                <div className="text-sm text-gray-600">Video ads perform 3x better for music content</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Budget Wisely</div>
                <div className="text-sm text-gray-600">Start small and scale successful campaigns</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Track Performance</div>
                <div className="text-sm text-gray-600">Monitor clicks, plays, and engagement metrics</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Marketing Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <div>
                <div className="font-medium">Campaign Approved</div>
                <div className="text-sm text-gray-600">Summer Concert Series campaign is now live</div>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 days ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">👀</span>
              </div>
              <div>
                <div className="font-medium">Campaign Under Review</div>
                <div className="text-sm text-gray-600">EP Launch campaign is being reviewed by our team</div>
              </div>
            </div>
            <span className="text-xs text-gray-500">5 days ago</span>
          </div>
        </div>
      </Card>
    </div>
  )

  const MyRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">My Marketing Requests</h3>
        <button 
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
        >
          + New Request
        </button>
      </div>
      
      <div className="grid gap-6">
        {marketingRequests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{request.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Ad Type</div>
                    <div className="font-medium capitalize">{request.adType.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Budget</div>
                    <div className="font-medium">${request.budget}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Start Date</div>
                    <div className="font-medium">{new Date(request.preferredStartDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Submitted</div>
                    <div className="font-medium">{request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'Draft'}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Target Audience</div>
                  <div className="text-sm">{request.targetAudience}</div>
                </div>
                
                {request.adminNotes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Admin Feedback</div>
                    <div className="text-sm text-blue-700">{request.adminNotes}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              {request.status === 'approved' && (
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                  View Campaign
                </button>
              )}
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                View Details
              </button>
              {request.status === 'draft' && (
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Edit & Submit
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const RequestForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">New Marketing Request</h3>
        <button 
          onClick={() => setShowRequestForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmitRequest} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., New Single Launch Campaign"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Describe what you want to promote and your goals"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Type *
              </label>
              <select
                name="adType"
                value={formData.adType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="sponsored-post">Sponsored Post</option>
                <option value="banner">Banner Ad</option>
                <option value="video">Video Ad</option>
                <option value="audio-spot">Audio Spot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($) *
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="50"
                max="10000"
                step="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <div className="text-xs text-gray-500 mt-1">Minimum: $50, Maximum: $10,000</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Hip-hop fans, age 18-25, major cities"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Start Date *
            </label>
            <input
              type="date"
              name="preferredStartDate"
              value={formData.preferredStartDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Goals
            </label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="What do you want to achieve? (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Any additional details or special requests (optional)"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium"
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', component: MarketingOverview },
    { id: 'requests', name: 'My Requests', component: MyRequests },
  ]

  if (showRequestForm) {
    return <RequestForm />
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MarketingOverview

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Hub</h2>
          <p className="text-gray-600">Promote your music and grow your audience</p>
        </div>
        
        <button 
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
        >
          📢 Request Campaign
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  )
}

// Export alias for easier importing
export const MarketingHub = CreatorMarketingHub
