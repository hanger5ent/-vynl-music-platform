'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface FeedbackWidgetProps {
  isTestingMode?: boolean
}

export default function FeedbackWidget({ isTestingMode = true }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Only show during testing mode
  if (!isTestingMode) return null

  const submitFeedback = async () => {
    if (!feedback.trim()) return

    setLoading(true)
    
    try {
      // Create feedback object
      const feedbackData = {
        feedback: feedback.trim(),
        email: email.trim(),
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`
      }

      // For now, log to console - you can replace with API call
      console.log('🐛 TESTING FEEDBACK:', feedbackData)
      
      // You can also save to localStorage for collection
      const existingFeedback = JSON.parse(localStorage.getItem('testingFeedback') || '[]')
      existingFeedback.push(feedbackData)
      localStorage.setItem('testingFeedback', JSON.stringify(existingFeedback))

      // TODO: Replace with actual API call
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // })

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setFeedback('')
        setEmail('')
        setSubmitted(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          title="Send Testing Feedback"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">Feedback</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-purple-900">Testing Feedback</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {submitted ? (
          <div className="text-center py-4">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              ✅ Thank you for your feedback!
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Found a bug or have suggestions?
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what you found, what you expected, or your suggestions..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="text-xs text-gray-500">
              📍 Current page: {typeof window !== 'undefined' ? window.location.pathname : ''}
            </div>

            <button
              onClick={submitFeedback}
              disabled={!feedback.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-600 text-center">
          Help us improve by reporting bugs and sharing ideas! 🎵
        </p>
      </div>
    </div>
  )
}
