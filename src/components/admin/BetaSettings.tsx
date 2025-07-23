'use client'

import { useBetaFeatures } from '@/hooks/useBetaFeatures'

export function BetaSettings() {
  const { isBetaMode, betaFeatures, loading, toggleFeature, resetFeatures } = useBetaFeatures()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isBetaMode) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Beta Features</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Beta mode is not enabled</p>
          <p className="text-gray-400 text-sm mt-2">
            Enable beta mode in your environment variables to access experimental features.
          </p>
        </div>
      </div>
    )
  }

  const featureDescriptions = {
    advancedSearch: 'Enhanced search with AI-powered recommendations and filters',
    realTimeCollaboration: 'Live collaborative playlists and music sessions',
    aiRecommendations: 'Machine learning-powered music discovery and recommendations',
    socialFeatures: 'Social music sharing, comments, and community features',
    experimentalPlayer: 'Next-generation audio player with advanced visualizations',
  }

  return (
    <div className="space-y-6">
      {/* Beta Mode Status */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            BETA MODE ACTIVE
          </span>
          <p className="text-sm text-purple-700">
            🚀 You have access to experimental features and early releases
          </p>
        </div>
      </div>

      {/* Beta Features List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Beta Features</h3>
          <button
            onClick={resetFeatures}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(betaFeatures).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  {enabled && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      ON
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {featureDescriptions[feature as keyof typeof featureDescriptions]}
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleFeature(feature as keyof typeof betaFeatures)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Beta Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Beta Feedback</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Help us improve VYNL by sharing your experience with beta features.
          </p>
          <div className="flex space-x-4">
            <a
              href="mailto:beta@vynl.com?subject=Beta Feedback"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              📧 Send Feedback
            </a>
            <a
              href="https://github.com/vynl/feedback/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              🐛 Report Bug
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
