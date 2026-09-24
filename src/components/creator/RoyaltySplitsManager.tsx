'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

type RoyaltyRole = 'SONGWRITER' | 'PERFORMER' | 'PRODUCER' | 'PUBLISHER' | 'OTHER'

interface RoyaltySplit {
  id: string
  role: RoyaltyRole
  percentage: string
  holderName: string
  holderEmail: string | null
  holderUser: { id: string; name: string | null; username: string } | null
}

const ROLES: RoyaltyRole[] = ['SONGWRITER', 'PERFORMER', 'PRODUCER', 'PUBLISHER', 'OTHER']

export function RoyaltySplitsManager({ trackId }: { trackId: string }) {
  const [splits, setSplits] = useState<RoyaltySplit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ role: 'SONGWRITER' as RoyaltyRole, holderName: '', holderEmail: '', holderUsername: '', percentage: '' })

  const fetchSplits = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/music/tracks/${trackId}/royalty-splits`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setSplits(data.splits || [])
    } catch {
      setError('Could not load royalty splits.')
    } finally {
      setIsLoading(false)
    }
  }, [trackId])

  useEffect(() => { fetchSplits() }, [fetchSplits])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.holderName.trim() || !form.percentage) return

    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/music/tracks/${trackId}/royalty-splits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role,
          holderName: form.holderName,
          holderEmail: form.holderEmail || undefined,
          holderUsername: form.holderUsername || undefined,
          percentage: parseFloat(form.percentage),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not add split')
        return
      }
      setForm({ role: 'SONGWRITER', holderName: '', holderEmail: '', holderUsername: '', percentage: '' })
      await fetchSplits()
    } catch {
      setError('Could not add split')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (splitId: string) => {
    try {
      await fetch(`/api/music/tracks/${trackId}/royalty-splits/${splitId}`, { method: 'DELETE' })
      await fetchSplits()
    } catch {
      setError('Could not remove split')
    }
  }

  const totalByRole = ROLES.reduce<Record<string, number>>((acc, role) => {
    acc[role] = splits.filter((s) => s.role === role).reduce((sum, s) => sum + Number(s.percentage), 0)
    return acc
  }, {})

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
      {isLoading ? (
        <div className="flex justify-center py-4 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : (
        <>
          {splits.length === 0 ? (
            <p className="text-gray-500 mb-3">No royalty splits registered for this track yet.</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {splits.map((split) => (
                <li key={split.id} className="flex items-center justify-between text-gray-700">
                  <span>
                    <span className="font-medium">{split.role}</span> &middot; {split.holderName}
                    {split.holderEmail && <span className="text-gray-400"> ({split.holderEmail})</span>}
                    {' '}&middot; {Number(split.percentage).toFixed(2)}%
                  </span>
                  <button onClick={() => handleDelete(split.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <div className="text-red-600 mb-2">{error}</div>}

          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-center">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoyaltyRole }))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r} ({(totalByRole[r] || 0).toFixed(0)}% registered)</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Holder name"
              value={form.holderName}
              onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))}
              className="border border-gray-300 rounded px-2 py-1 w-32"
              required
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.holderEmail}
              onChange={(e) => setForm((f) => ({ ...f, holderEmail: e.target.value }))}
              className="border border-gray-300 rounded px-2 py-1 w-40"
            />
            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              placeholder="%"
              value={form.percentage}
              onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))}
              className="border border-gray-300 rounded px-2 py-1 w-20"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'Add'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
