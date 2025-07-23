import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface UseInviteFormProps {
  onSuccess?: () => void
}

export function UseInviteForm({ onSuccess }: UseInviteFormProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invite accepted!')
        if (onSuccess) onSuccess()
      } else {
        toast.error(data.error || 'Invalid invite code')
      }
    } catch (error) {
      toast.error('An error occurred while validating the invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Use Invite Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your invite code"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Validating...' : 'Validate Invite'}
        </button>
      </form>
    </div>
  )
}

