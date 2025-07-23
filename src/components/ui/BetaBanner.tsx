'use client'

import { useState, useEffect } from 'react'

interface BetaBannerProps {
  onDismiss?: () => void
}

export function BetaBanner({ onDismiss }: BetaBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if beta mode is enabled
    const betaMode = process.env.NEXT_PUBLIC_BETA_MODE === 'true'
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('beta-banner-dismissed') === 'true'
    
    if (betaMode && !dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('beta-banner-dismissed', 'true')
    onDismiss?.()
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                BETA
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                🚀 You're experiencing VYNL Beta! Help us improve by{' '}
                <a 
                  href="mailto:feedback@vynl.com" 
                  className="underline hover:text-purple-200 transition-colors"
                >
                  sharing your feedback
                </a>
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss beta banner"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-60 animate-pulse"></div>
    </div>
  )
}
