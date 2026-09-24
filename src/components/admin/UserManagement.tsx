'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Shield, Crown, Ban, CheckCircle2 } from 'lucide-react'

interface AdminUser {
  id: string
  name: string | null
  username: string
  email: string
  avatar: string | null
  isCreator: boolean
  isAdmin: boolean
  isVerified: boolean
  isSuspended: boolean
  suspendedReason: string | null
  createdAt: string
  _count: { tracks: number; followers: number }
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(query), 300)
    return () => clearTimeout(timeout)
  }, [query, fetchUsers])

  const runAction = async (id: string, action: string, reason?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      if (res.ok) {
        const data = await res.json()
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)))
        setSuspendingId(null)
        setSuspendReason('')
      } else {
        const data = await res.json()
        alert(data.error || 'Action failed')
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username, or email..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{u.name || u.username}</div>
                    <div className="text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {u.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                      {u.isCreator && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Crown className="h-3 w-3" /> Creator
                        </span>
                      )}
                      {!u.isAdmin && !u.isCreator && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Fan</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <Ban className="h-3 w-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {u.isCreator ? (
                        <button
                          onClick={() => runAction(u.id, 'demote_creator')}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Remove Creator
                        </button>
                      ) : (
                        <button
                          onClick={() => runAction(u.id, 'promote_creator')}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Make Creator
                        </button>
                      )}
                      {u.isAdmin ? (
                        <button
                          onClick={() => runAction(u.id, 'demote_admin')}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => runAction(u.id, 'promote_admin')}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                      )}
                      {u.isSuspended ? (
                        <button
                          onClick={() => runAction(u.id, 'reactivate')}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendingId(suspendingId === u.id ? null : u.id)}
                          disabled={processingId === u.id}
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                    {suspendingId === u.id && (
                      <div className="mt-2 flex items-center gap-2 justify-end">
                        <input
                          type="text"
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="text-xs px-2 py-1 border border-gray-300 rounded flex-1 max-w-[200px]"
                        />
                        <button
                          onClick={() => runAction(u.id, 'suspend', suspendReason || undefined)}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
