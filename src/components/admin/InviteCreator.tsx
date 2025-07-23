'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Invite {
  id: string
  email: string
  type: 'ARTIST' | 'CREATOR' | 'ADMIN'
  expiresAt: string
  used: boolean
}

interface InviteCreatorProps {
  onInviteCreated?: (invite: Invite) => void
}

export function InviteCreator({ onInviteCreated }: InviteCreatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    type: 'ARTIST' as 'ARTIST' | 'CREATOR' | 'ADMIN',
    expiresAt: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/invites/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || undefined,
          type: formData.type,
          expiresAt: formData.expiresAt || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invite created successfully!')
        setFormData({ email: '', type: 'ARTIST', expiresAt: '' })
        onInviteCreated?.(data.invite)
      } else {
        toast.error(data.error || 'Failed to create invite')
      }
    } catch (error) {
      toast.error('An error occurred while creating the invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Invite</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Leave empty for open invite"
          />
          <p className="text-sm text-gray-500 mt-1">
            If specified, only this email can use the invite
          </p>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Invite Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="ARTIST">Artist</option>
            <option value="CREATOR">Creator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
            Expires At (Optional)
          </label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty for 7-day expiration
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Invite'}
        </button>
      </form>
    </div>
  )
}
