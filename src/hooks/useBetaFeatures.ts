'use client'

import { useState, useEffect } from 'react'

interface BetaFeatures {
  advancedSearch: boolean
  realTimeCollaboration: boolean
  aiRecommendations: boolean
  socialFeatures: boolean
  experimentalPlayer: boolean
}

const DEFAULT_BETA_FEATURES: BetaFeatures = {
  advancedSearch: true,
  realTimeCollaboration: false,
  aiRecommendations: true,
  socialFeatures: true,
  experimentalPlayer: false,
}

export function useBetaFeatures() {
  const [isBetaMode, setIsBetaMode] = useState(false)
  const [betaFeatures, setBetaFeatures] = useState<BetaFeatures>(DEFAULT_BETA_FEATURES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if beta mode is enabled
    const betaModeEnabled = process.env.NEXT_PUBLIC_BETA_MODE === 'true'
    setIsBetaMode(betaModeEnabled)

    // Load user's beta feature preferences from localStorage
    const savedFeatures = localStorage.getItem('beta-features')
    if (savedFeatures && betaModeEnabled) {
      try {
        const parsed = JSON.parse(savedFeatures)
        setBetaFeatures({ ...DEFAULT_BETA_FEATURES, ...parsed })
      } catch (error) {
        console.warn('Failed to parse saved beta features:', error)
        setBetaFeatures(DEFAULT_BETA_FEATURES)
      }
    }

    setLoading(false)
  }, [])

  const toggleFeature = (feature: keyof BetaFeatures) => {
    if (!isBetaMode) return

    const newFeatures = {
      ...betaFeatures,
      [feature]: !betaFeatures[feature],
    }
    
    setBetaFeatures(newFeatures)
    localStorage.setItem('beta-features', JSON.stringify(newFeatures))
  }

  const isFeatureEnabled = (feature: keyof BetaFeatures): boolean => {
    return isBetaMode && betaFeatures[feature]
  }

  const resetFeatures = () => {
    setBetaFeatures(DEFAULT_BETA_FEATURES)
    localStorage.setItem('beta-features', JSON.stringify(DEFAULT_BETA_FEATURES))
  }

  return {
    isBetaMode,
    betaFeatures,
    loading,
    toggleFeature,
    isFeatureEnabled,
    resetFeatures,
  }
}
