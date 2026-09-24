'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatStripeAmount } from '@/lib/stripe-client'
import { Check, Crown, Music, Users, Star, Loader2 } from 'lucide-react'

export interface FanFacingTier {
  id: 'basic' | 'premium' | 'vip'
  name: string
  price: number
  interval: string
  features: string[]
  isActive: boolean
}

interface SubscriptionCardProps {
  artistId: string
  artistName: string
  tierData: FanFacingTier
  featured?: boolean
  onSubscribe?: (tier: string, checkoutUrl: string) => void
}

export function SubscriptionCard({ artistId, artistName, tierData, featured, onSubscribe }: SubscriptionCardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          tier: tierData.id,
          returnUrl: window.location.origin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        if (onSubscribe) {
          onSubscribe(tierData.id, data.checkoutUrl)
        }
      } else {
        throw new Error('No checkout URL returned')
      }

    } catch (err) {
      console.error('Subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = () => {
    switch (tierData.id) {
      case 'basic':
        return <Music className="h-6 w-6" />
      case 'premium':
        return <Star className="h-6 w-6" />
      case 'vip':
        return <Crown className="h-6 w-6" />
      default:
        return <Users className="h-6 w-6" />
    }
  }

  const getColorClasses = () => {
    switch (tierData.id) {
      case 'basic':
        return {
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        }
      case 'premium':
        return {
          border: 'border-purple-200',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          icon: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-800'
        }
      case 'vip':
        return {
          border: 'border-yellow-200 ring-2 ring-yellow-300',
          button: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      default:
        return {
          border: 'border-gray-200',
          button: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div className={`bg-white rounded-xl border-2 ${colors.border} p-6 relative ${featured ? 'shadow-lg' : 'shadow-sm'}`}>
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${colors.icon}`}>
          {getIcon()}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{tierData.name}</h3>

        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatStripeAmount(tierData.price)}
        </div>
        <p className="text-gray-600 text-sm">per {tierData.interval}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {tierData.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Creating...
          </>
        ) : (
          `Support ${artistName}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Cancel anytime • Secure payment by Stripe
      </p>
    </div>
  )
}

interface SubscriptionTiersProps {
  artistId: string
  artistName: string
  showAllTiers?: boolean
  onSubscribe?: (tier: string, checkoutUrl: string) => void
}

export default function SubscriptionTiers({
  artistId,
  artistName,
  showAllTiers = true,
  onSubscribe
}: SubscriptionTiersProps) {
  const [tiers, setTiers] = useState<FanFacingTier[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/artists/${artistId}/tiers`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTiers(data.tiers || [])
      })
      .catch(() => {
        if (!cancelled) setTiers([])
      })
    return () => { cancelled = true }
  }, [artistId])

  if (tiers === null) {
    return (
      <div className="flex justify-center py-12 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (tiers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{artistName} hasn&apos;t set up any subscription tiers yet.</p>
      </div>
    )
  }

  const selectedTiers = showAllTiers
    ? tiers
    : tiers.filter((t) => t.id === 'premium').length > 0
      ? tiers.filter((t) => t.id === 'premium')
      : tiers.slice(0, 1)

  const getGridClasses = () => {
    const count = selectedTiers.length
    if (count === 3) return 'md:grid-cols-3'
    if (count === 2) return 'md:grid-cols-2 max-w-2xl mx-auto'
    return 'max-w-md mx-auto'
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Support {artistName}
        </h2>
        <p className="text-gray-600">
          Choose a subscription tier to get exclusive content and support your favorite artist
        </p>
      </div>

      <div className={`grid gap-6 ${getGridClasses()}`}>
        {selectedTiers.map((tierData) => (
          <SubscriptionCard
            key={tierData.id}
            artistId={artistId}
            artistName={artistName}
            tierData={tierData}
            featured={tierData.id === 'vip' && selectedTiers.length > 1}
            onSubscribe={onSubscribe}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Secure payments powered by Stripe
        </p>
        <p className="text-xs text-gray-400">
          All subscriptions include a 30-day satisfaction guarantee
        </p>
      </div>
    </div>
  )
}
