'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Send, UserPlus, Check } from 'lucide-react'

interface CreatorInviteFormProps {
  onSuccess?: () => void
  onClose?: () => void
}

export default function CreatorInviteForm({ onSuccess, onClose }: CreatorInviteFormProps) {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      setError('You must be logged in to send invites')
      return
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/invites/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(true)
      setEmail('')
      setMessage('')
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (err) {
      console.error('Creator invite error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="text-center p-6">
        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
        <p className="text-gray-600 mb-4">You need to be signed in to invite creators</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Invitation sent!
        </h3>
        <p className="text-gray-600 mb-4">
          We've sent an invitation to {email}. They'll receive an email with instructions to join as a creator.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setSuccess(false)
              setEmail('')
              setMessage('')
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Send Another
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Invite a Creator
        </h3>
        <p className="text-gray-600">
          Know an artist who would love to connect with fans? Send them an invitation to join our platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
            Creator's Email Address
          </label>
          <input
            type="email"
            id="invite-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="artist@example.com"
          />
        </div>

        <div>
          <label htmlFor="invite-message" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Message (optional)
          </label>
          <textarea
            id="invite-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Hey! I think you'd love this music platform. It's a great way to connect directly with your fans and monetize your music..."
          />
          <p className="text-xs text-gray-500 mt-1">
            This message will be included in the invitation email
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">What they'll get:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Direct connection with fans through subscriptions</li>
            <li>• Ability to sell merchandise and digital products</li>
            <li>• Analytics and insights about their audience</li>
            <li>• Marketing tools to promote their music</li>
            <li>• No upfront costs - they keep most of the earnings</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invitation
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Invitations are sent from your account ({session.user.email})
        </p>
      </form>
    </div>
  )
}
