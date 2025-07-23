/**
 * Beta Features Utility
 * Helper functions for managing beta features across the application
 */

export const BETA_FEATURES = {
  ADVANCED_SEARCH: 'advancedSearch',
  REAL_TIME_COLLABORATION: 'realTimeCollaboration',
  AI_RECOMMENDATIONS: 'aiRecommendations',
  SOCIAL_FEATURES: 'socialFeatures',
  EXPERIMENTAL_PLAYER: 'experimentalPlayer',
} as const

export type BetaFeature = typeof BETA_FEATURES[keyof typeof BETA_FEATURES]

/**
 * Check if beta mode is enabled
 */
export const isBetaModeEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_BETA_MODE === 'true'
}

/**
 * Get beta feature status from localStorage (client-side only)
 */
export const getBetaFeatureStatus = (feature: BetaFeature): boolean => {
  if (typeof window === 'undefined' || !isBetaModeEnabled()) {
    return false
  }

  try {
    const savedFeatures = localStorage.getItem('beta-features')
    if (savedFeatures) {
      const features = JSON.parse(savedFeatures)
      return features[feature] === true
    }
  } catch (error) {
    console.warn('Failed to get beta feature status:', error)
  }

  return false
}

/**
 * Beta feature wrapper component
 */
interface BetaFeatureProps {
  feature: BetaFeature
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function BetaFeature({ feature, fallback = null, children }: BetaFeatureProps) {
  const isEnabled = getBetaFeatureStatus(feature)
  
  return isEnabled ? <>{children}</> : <>{fallback}</>
}

/**
 * Beta badge component for marking beta features
 */
interface BetaBadgeProps {
  className?: string
  variant?: 'default' | 'small' | 'pill'
}

export function BetaBadge({ className = '', variant = 'default' }: BetaBadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium'
  const variants = {
    default: 'px-2.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800',
    small: 'px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800',
    pill: 'px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white',
  }

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      BETA
    </span>
  )
}
