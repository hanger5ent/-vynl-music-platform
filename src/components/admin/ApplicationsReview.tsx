'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface Application {
  id: string
  artistName: string
  genre: string
  bio: string
  socialLinks: Record<string, string> | null
  musicSamples: string
  experienceLevel: string
  goals: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
  user: { id: string; name: string | null; username: string; email: string; avatar: string | null }
  reviewer: { id: string; name: string | null; username: string } | null
}

const STATUS_TABS = ['PENDING', 'APPROVED', 'REJECTED'] as const

export function ApplicationsReview() {
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_TABS[number]>('PENDING')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/applications?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const review = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      })
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id))
        setRejectingId(null)
        setRejectNote('')
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No {statusFilter.toLowerCase()} applications.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.artistName}</h3>
                  <p className="text-sm text-gray-500">
                    {app.user.name || app.user.username} &middot; {app.user.email} &middot; applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                  {app.genre} &middot; {app.experienceLevel}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{app.bio}</p>

              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium text-gray-800">Portfolio: </span>{app.musicSamples}
              </div>

              {app.goals && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium text-gray-800">Goals: </span>{app.goals}
                </div>
              )}

              {app.socialLinks && Object.values(app.socialLinks).some(Boolean) && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {Object.entries(app.socialLinks).filter(([, v]) => v).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                    >
                      {key} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}

              {app.status !== 'PENDING' && (
                <div className="text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
                  Reviewed {app.reviewedAt && new Date(app.reviewedAt).toLocaleDateString()} by {app.reviewer?.name || app.reviewer?.username || 'an admin'}
                  {app.reviewNote && <p className="mt-1">{app.reviewNote}</p>}
                </div>
              )}

              {app.status === 'PENDING' && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-3">
                  <button
                    onClick={() => review(app.id, 'approve')}
                    disabled={processingId === app.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === app.id ? null : app.id)}
                    disabled={processingId === app.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm font-medium"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}

              {rejectingId === app.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Optional feedback for the applicant..."
                    rows={2}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => review(app.id, 'reject', rejectNote || undefined)}
                    disabled={processingId === app.id}
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
