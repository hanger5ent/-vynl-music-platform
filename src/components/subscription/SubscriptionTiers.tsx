'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'
import { formatStripeAmount, getSubscriptionDisplayInfo } from '@/lib/stripe-client'
import { Check, Crown, Music, Users, Star } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

interface SubscriptionCardProps {
  artistId: string
  artistName: string
  tier: keyof typeof SUBSCRIPTION_TIERS
  onSubscribe?: (tier: string, checkoutUrl: string) => void
}

export function SubscriptionCard({ artistId, artistName, tier, onSubscribe }: SubscriptionCardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tierConfig = SUBSCRIPTION_TIERS[tier]

  const handleSubscribe = async () => {
    if (!session?.user) {
      // Redirect to login or show login modal
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
          tier,
          returnUrl: window.location.origin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
        
        // Optional: notify parent component
        if (onSubscribe) {
          onSubscribe(tier, data.checkoutUrl)
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
    switch (tier) {
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
    switch (tier) {
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
    <div className={`bg-white rounded-xl border-2 ${colors.border} p-6 relative ${tier === 'vip' ? 'shadow-lg' : 'shadow-sm'}`}>
      {tier === 'vip' && (
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
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{tierConfig.name}</h3>
        
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatStripeAmount(tierConfig.price)}
        </div>
        <p className="text-gray-600 text-sm">per {tierConfig.interval}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {tierConfig.features.map((feature, index) => (
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
  const allTiers = ['basic', 'premium', 'vip'] as const
  const selectedTiers = showAllTiers ? allTiers : ['premium']

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
        {selectedTiers.map((tier) => (
          <SubscriptionCard
            key={tier}
            artistId={artistId}
            artistName={artistName}
            tier={tier as keyof typeof SUBSCRIPTION_TIERS}
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
