'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'

interface Ad {
  id: string
  title: string
  description: string
  imageUrl: string
  targetUrl: string
  budget: number
  status: 'active' | 'paused' | 'scheduled' | 'completed'
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  spent: number
  creator?: {
    name: string
    email: string
  }
}

interface AdRequest {
  id: string
  creatorName: string
  creatorEmail: string
  adType: 'banner' | 'sponsored-post' | 'video' | 'audio-spot'
  title: string
  description: string
  budget: number
  targetAudience: string
  preferredStartDate: string
  status: 'pending' | 'approved' | 'rejected' | 'in-review'
  submittedAt: string
  notes?: string
}

export function AdManagement() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const [ads] = useState<Ad[]>([
    {
      id: '1',
      title: 'Summer Music Festival 2025',
      description: 'Promote the biggest music festival of the year',
      imageUrl: '/api/placeholder/300/200',
      targetUrl: 'https://summerfest2025.com',
      budget: 5000,
      status: 'active',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      impressions: 45000,
      clicks: 1200,
      spent: 2800,
      creator: {
        name: 'Festival Organizers',
        email: 'promo@summerfest2025.com'
      }
    },
    {
      id: '2',
      title: 'New Album Release - The Midnight Sessions',
      description: 'Promote new indie album release',
      imageUrl: '/api/placeholder/300/200',
      targetUrl: 'https://spotify.com/midnight-sessions',
      budget: 1500,
      status: 'paused',
      startDate: '2025-07-15',
      endDate: '2025-08-15',
      impressions: 12000,
      clicks: 380,
      spent: 450,
      creator: {
        name: 'The Midnight Sessions',
        email: 'band@midnightsessions.com'
      }
    }
  ])

  const [adRequests] = useState<AdRequest[]>([
    {
      id: '1',
      creatorName: 'Sarah Martinez',
      creatorEmail: 'sarah@musicworld.com',
      adType: 'sponsored-post',
      title: 'New EP Launch Campaign',
      description: 'I want to promote my new 5-track EP "Urban Dreams" to indie music fans.',
      budget: 800,
      targetAudience: 'Indie music fans, age 18-35, urban areas',
      preferredStartDate: '2025-08-01',
      status: 'pending',
      submittedAt: '2025-07-20T10:30:00Z',
    },
    {
      id: '2',
      creatorName: 'DJ Alex Thompson',
      creatorEmail: 'alex@electrobeats.com',
      adType: 'banner',
      title: 'Electronic Music Masterclass',
      description: 'Promote my online course for aspiring electronic music producers.',
      budget: 2000,
      targetAudience: 'Electronic music producers, beginner to intermediate',
      preferredStartDate: '2025-07-25',
      status: 'approved',
      submittedAt: '2025-07-18T14:15:00Z',
      notes: 'Approved with suggested budget adjustment'
    },
    {
      id: '3',
      creatorName: 'Luna Garcia',
      creatorEmail: 'luna@soulfulmusic.com',
      adType: 'video',
      title: 'Acoustic Sessions Live Stream',
      description: 'Weekly acoustic sessions every Friday night, building regular audience.',
      budget: 500,
      targetAudience: 'Acoustic music lovers, live music fans',
      preferredStartDate: '2025-07-28',
      status: 'in-review',
      submittedAt: '2025-07-19T09:45:00Z',
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'paused':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-review':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    console.log(`${action} request ${requestId}`)
    // In a real app, this would update the database
  }

  const AdOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Total Ad Revenue</div>
          <div className="text-2xl font-bold text-gray-900">$12,450</div>
          <div className="text-sm text-green-600">+15.3% from last month</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Active Campaigns</div>
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-sm text-blue-600">3 pending approval</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Total Impressions</div>
          <div className="text-2xl font-bold text-gray-900">1.2M</div>
          <div className="text-sm text-green-600">+22.1% this week</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Click-Through Rate</div>
          <div className="text-2xl font-bold text-gray-900">2.8%</div>
          <div className="text-sm text-green-600">Above industry average</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium">New ad request from Sarah Martinez</div>
              <div className="text-sm text-gray-600">EP Launch Campaign - $800 budget</div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Pending Review
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-medium">Campaign approved: DJ Alex Thompson</div>
              <div className="text-sm text-gray-600">Electronic Music Masterclass - $2000</div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Approved
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <div className="font-medium">Budget milestone reached</div>
              <div className="text-sm text-gray-600">Summer Festival campaign spent $2800 of $5000</div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Monitor
            </span>
          </div>
        </div>
      </Card>
    </div>
  )

  const ActiveAds = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Active Ad Campaigns</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Create New Campaign
        </button>
      </div>
      
      <div className="grid gap-6">
        {ads.map((ad) => (
          <Card key={ad.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{ad.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.status)}`}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{ad.description}</p>
                
                {ad.creator && (
                  <div className="text-sm text-gray-500 mb-3">
                    <span className="font-medium">Advertiser:</span> {ad.creator.name} ({ad.creator.email})
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Budget</div>
                    <div className="font-medium">${ad.budget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Spent</div>
                    <div className="font-medium">${ad.spent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Impressions</div>
                    <div className="font-medium">{ad.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Clicks</div>
                    <div className="font-medium">{ad.clicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">CTR</div>
                    <div className="font-medium">{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                View Details
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Edit Campaign
              </button>
              {ad.status === 'active' && (
                <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  Pause
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const AdRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Creator Ad Requests</h3>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>In Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option>All Types</option>
            <option>Banner</option>
            <option>Sponsored Post</option>
            <option>Video</option>
            <option>Audio Spot</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-4">
        {adRequests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Creator</div>
                    <div className="font-medium">{request.creatorName}</div>
                    <div className="text-sm text-gray-500">{request.creatorEmail}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Ad Type</div>
                    <div className="font-medium capitalize">{request.adType.replace('-', ' ')}</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{request.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Requested Budget</div>
                    <div className="font-medium">${request.budget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Preferred Start Date</div>
                    <div className="font-medium">{new Date(request.preferredStartDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Submitted</div>
                    <div className="font-medium">{new Date(request.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Target Audience</div>
                  <div className="text-sm">{request.targetAudience}</div>
                </div>
                
                {request.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-500">Admin Notes</div>
                    <div className="text-sm">{request.notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            {request.status === 'pending' && (
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={() => handleRequestAction(request.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Request
                </button>
                <button 
                  onClick={() => handleRequestAction(request.id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Request
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Request Changes
                </button>
              </div>
            )}
            
            {request.status !== 'pending' && (
              <div className="flex space-x-3 mt-4">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  View Full Details
                </button>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Message Creator
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', component: AdOverview },
    { id: 'active-ads', name: 'Active Campaigns', component: ActiveAds },
    { id: 'requests', name: 'Creator Requests', component: AdRequests },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdOverview

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Management</h2>
          <p className="text-gray-600">Manage advertising campaigns and creator requests</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total Revenue: <span className="font-bold text-green-600">$12,450</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700">
            📊 Analytics Report
          </button>
        </div>
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
