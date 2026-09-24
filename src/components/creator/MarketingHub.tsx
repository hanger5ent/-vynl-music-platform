'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'

interface AdRequest {
  id: string
  title: string
  description: string
  adType: 'BANNER' | 'SPONSORED_POST' | 'VIDEO' | 'AUDIO_SPOT'
  budget: string | number
  targetAudience: string
  preferredStartDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote: string | null
  createdAt: string
}

const AD_TYPE_LABELS: Record<AdRequest['adType'], string> = {
  BANNER: 'Banner Ad',
  SPONSORED_POST: 'Sponsored Post',
  VIDEO: 'Video Ad',
  AUDIO_SPOT: 'Audio Spot',
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function CreatorMarketingHub() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requests, setRequests] = useState<AdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adType: 'SPONSORED_POST' as AdRequest['adType'],
    budget: 500,
    targetAudience: '',
    preferredStartDate: '',
  })

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/creator/ad-requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/creator/ad-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit request')
        return
      }
      setRequests((prev) => [data.request, ...prev])
      setShowRequestForm(false)
      setFormData({
        title: '',
        description: '',
        adType: 'SPONSORED_POST',
        budget: 500,
        targetAudience: '',
        preferredStartDate: '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (showRequestForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">New Ad Request</h3>
          <button onClick={() => setShowRequestForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={120}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., New Single Launch Campaign"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Describe what you want to promote and your goals"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Type *</label>
                <select
                  name="adType"
                  value={formData.adType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="SPONSORED_POST">Sponsored Post</option>
                  <option value="BANNER">Banner Ad</option>
                  <option value="VIDEO">Video Ad</option>
                  <option value="AUDIO_SPOT">Audio Spot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($) *</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="10"
                  max="50000"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Minimum: $10, Maximum: $50,000</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Hip-hop fans, age 18-25, major cities"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Start Date *</label>
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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
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
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Hub</h2>
          <p className="text-gray-600">Request paid promotion for your music</p>
        </div>

        <button
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
        >
          📢 Request Ad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          No ad requests yet. Submit one to get your music in front of more fans.
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{request.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Ad Type</div>
                      <div className="font-medium">{AD_TYPE_LABELS[request.adType]}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Budget</div>
                      <div className="font-medium">${Number(request.budget).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Start Date</div>
                      <div className="font-medium">{new Date(request.preferredStartDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Submitted</div>
                      <div className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Target Audience</div>
                    <div className="text-sm">{request.targetAudience}</div>
                  </div>

                  {request.reviewNote && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Admin Feedback</div>
                      <div className="text-sm text-blue-700">{request.reviewNote}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Export alias for easier importing
export const MarketingHub = CreatorMarketingHub
