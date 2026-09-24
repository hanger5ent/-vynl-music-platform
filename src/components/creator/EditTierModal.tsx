'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'

interface EditTierModalProps {
  tier: {
    id: string
    name: string
    price: number // dollars
    features: string[]
    isActive: boolean
  }
  onClose: () => void
  onSaved: () => void
}

export default function EditTierModal({ tier, onClose, onSaved }: EditTierModalProps) {
  const [name, setName] = useState(tier.name)
  const [price, setPrice] = useState(tier.price.toFixed(2))
  const [features, setFeatures] = useState<string[]>(tier.features.length > 0 ? tier.features : [''])
  const [isActive, setIsActive] = useState(tier.isActive)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)))
  }
  const addFeature = () => setFeatures((prev) => (prev.length < 10 ? [...prev, ''] : prev))
  const removeFeature = (index: number) => setFeatures((prev) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    setError('')
    const priceNum = parseFloat(price)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (isNaN(priceNum) || priceNum < 0.99 || priceNum > 999.99) {
      setError('Price must be between $0.99 and $999.99')
      return
    }
    const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean)
    if (cleanedFeatures.length === 0) {
      setError('At least one feature is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/creator/tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.id,
          name: name.trim(),
          price: Math.round(priceNum * 100),
          features: cleanedFeatures,
          isActive,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save tier')
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit {tier.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (per month, USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.99"
                max="999.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    maxLength={140}
                    placeholder="What subscribers get at this tier"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => removeFeature(index)}
                    disabled={features.length <= 1}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {features.length < 10 && (
              <button
                onClick={addFeature}
                className="mt-2 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" /> Add feature
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Offer this tier to fans</label>
            <button
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
