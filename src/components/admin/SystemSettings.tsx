'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

export function SystemSettings() {
  const [platformFeePercent, setPlatformFeePercent] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setPlatformFeePercent(data.settings.platformFeePercent)
        setInputValue(String(data.settings.platformFeePercent))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setMessage(null)
    const value = parseInt(inputValue, 10)
    if (Number.isNaN(value)) {
      setMessage({ type: 'error', text: 'Enter a whole number' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePercent: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save' })
        return
      }
      setPlatformFeePercent(data.settings.platformFeePercent)
      setMessage({ type: 'success', text: 'Saved' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">System Settings</h2>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Platform Fee</h3>
        <p className="text-sm text-gray-500 mb-4">
          The percentage VYNL keeps from every track sale, album sale, subscription payment, and product order.
          Currently <span className="font-medium text-gray-700">{platformFeePercent}%</span>. Changes apply to new
          earnings going forward - past ledger entries keep the rate that applied when they were recorded.
        </p>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min={0}
              max={50}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || inputValue === String(platformFeePercent)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {message && (
          <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
