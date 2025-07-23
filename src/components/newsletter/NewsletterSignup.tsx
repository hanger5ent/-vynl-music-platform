'use client'

import { useState } from 'react'
import { Mail, Check, X } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'footer'
  onSuccess?: () => void
  onClose?: () => void
}

export default function NewsletterSignup({ variant = 'inline', onSuccess, onClose }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [preferences, setPreferences] = useState({
    artistUpdates: true,
    platformNews: true,
    promotions: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          preferences,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSuccess(true)
      setEmail('')
      setName('')
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`
        ${variant === 'modal' ? 'bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto' : ''}
        ${variant === 'footer' ? 'text-center' : ''}
      `}>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to our newsletter!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for subscribing. You'll receive updates about new artists, platform features, and exclusive content.
          </p>
          {variant === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  const formContent = (
    <>
      {variant === 'modal' && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Subscribe to Our Newsletter</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            id="newsletter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            id="newsletter-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to receive?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.artistUpdates}
                onChange={(e) => setPreferences(prev => ({ ...prev, artistUpdates: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Artist updates and new releases</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.platformNews}
                onChange={(e) => setPreferences(prev => ({ ...prev, platformNews: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Platform news and features</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.promotions}
                onChange={(e) => setPreferences(prev => ({ ...prev, promotions: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Special offers and promotions</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Subscribe to Newsletter
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You can unsubscribe at any time. We respect your privacy.
        </p>
      </form>
    </>
  )

  if (variant === 'modal') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        {formContent}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-4">
          <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Stay in the loop
          </h3>
          <p className="text-gray-600 text-sm">
            Get updates about new artists and platform features
          </p>
        </div>
        {formContent}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Mail className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Stay updated with the latest music
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Get notified about new artists, releases, and exclusive content
          </p>
          {formContent}
        </div>
      </div>
    </div>
  )
}
