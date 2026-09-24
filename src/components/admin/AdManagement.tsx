'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

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
  reviewedAt: string | null
  createdAt: string
  creator: { id: string; name: string | null; username: string; email: string }
  reviewer: { id: string; name: string | null; username: string } | null
}

const AD_TYPE_LABELS: Record<AdRequest['adType'], string> = {
  BANNER: 'Banner Ad',
  SPONSORED_POST: 'Sponsored Post',
  VIDEO: 'Video Ad',
  AUDIO_SPOT: 'Audio Spot',
}

const STATUS_TABS = ['PENDING', 'APPROVED', 'REJECTED'] as const

export function AdManagement() {
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_TABS[number]>('PENDING')
  const [requests, setRequests] = useState<AdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ad-requests?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const review = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/ad-requests/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      })
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id))
        setRejectingId(null)
        setRejectNote('')
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Ad Requests</h2>
        <p className="text-sm text-gray-500">
          Creators request paid promotion here for review. There&apos;s no ad-serving in the app yet, so approving
          a request is a manual commitment to run it, not an automated campaign launch.
        </p>
      </div>

      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No {statusFilter.toLowerCase()} ad requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-500">
                    {request.creator.name || request.creator.username} &middot; {request.creator.email} &middot; requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {AD_TYPE_LABELS[request.adType]}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{request.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <div className="text-gray-500">Budget</div>
                  <div className="font-medium">${Number(request.budget).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Preferred Start</div>
                  <div className="font-medium">{new Date(request.preferredStartDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Target Audience</div>
                  <div className="font-medium">{request.targetAudience}</div>
                </div>
              </div>

              {request.status !== 'PENDING' && (
                <div className="text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
                  Reviewed {request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString()} by {request.reviewer?.name || request.reviewer?.username || 'an admin'}
                  {request.reviewNote && <p className="mt-1">{request.reviewNote}</p>}
                </div>
              )}

              {request.status === 'PENDING' && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-3">
                  <button
                    onClick={() => review(request.id, 'approve')}
                    disabled={processingId === request.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === request.id ? null : request.id)}
                    disabled={processingId === request.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm font-medium"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}

              {rejectingId === request.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Optional feedback for the creator..."
                    rows={2}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => review(request.id, 'reject', rejectNote || undefined)}
                    disabled={processingId === request.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
