'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatStripeAmount } from '@/lib/stripe-client'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

export default function StripeTestPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testSubscription = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    if (!session?.user) {
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href)
      return
    }

    setLoading(tier)
    setResult(null)

    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: 'test-artist-123',
          tier,
          returnUrl: window.location.origin + '/stripe-test?success=true',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (data.checkoutUrl) {
        // In a real app, you would redirect to Stripe Checkout
        // For testing, we'll just show success
        setResult({ 
          success: true, 
          message: `✅ Stripe checkout session created successfully! Checkout URL: ${data.checkoutUrl.substring(0, 50)}...` 
        })
      } else {
        throw new Error('No checkout URL returned')
      }

    } catch (err) {
      console.error('Subscription test error:', err)
      setResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to create subscription' 
      })
    } finally {
      setLoading(null)
    }
  }

  const testPayment = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href)
      return
    }

    setLoading('payment')
    setResult(null)

    try {
      const response = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              productId: 'test-product-1',
              name: 'Test T-Shirt',
              price: 25.99,
              quantity: 1,
              description: 'A test product for Stripe integration',
              artistId: 'test-artist-123'
            }
          ],
          returnUrl: window.location.origin + '/stripe-test?purchase_success=true',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      if (data.checkoutUrl) {
        setResult({ 
          success: true, 
          message: `✅ Stripe payment session created successfully! Checkout URL: ${data.checkoutUrl.substring(0, 50)}...` 
        })
      } else {
        throw new Error('No checkout URL returned')
      }

    } catch (err) {
      console.error('Payment test error:', err)
      setResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to create payment' 
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-8">
          <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Integration Test</h1>
          <p className="text-gray-600">Test your Stripe payment and subscription integration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subscription Tests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Tests</h2>
            <p className="text-gray-600 mb-6">Test subscription checkout session creation</p>
            
            <div className="space-y-4">
              {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => (
                <button
                  key={tier}
                  onClick={() => testSubscription(tier as keyof typeof SUBSCRIPTION_TIERS)}
                  disabled={loading === tier}
                  className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors disabled:opacity-50"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{config.name}</div>
                    <div className="text-sm text-gray-600">{formatStripeAmount(config.price)}/month</div>
                  </div>
                  {loading === tier ? (
                    <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Tests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">One-time Payment Tests</h2>
            <p className="text-gray-600 mb-6">Test product purchase checkout session creation</p>
            
            <button
              onClick={testPayment}
              disabled={loading === 'payment'}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors disabled:opacity-50"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">Test Product</div>
                <div className="text-sm text-gray-600">$25.99 - T-Shirt</div>
              </div>
              {loading === 'payment' ? (
                <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              ) : (
                <CreditCard className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`p-6 rounded-xl flex items-start gap-4 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-medium mb-1 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Success!' : 'Error'}
              </h3>
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
            </div>
          </div>
        )}

        {/* Configuration Info */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="font-medium text-blue-900 mb-2">Configuration Status</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Stripe publishable key configured</li>
            <li>✅ API routes created</li>
            <li>✅ Webhook handlers ready</li>
            <li>⚠️ Secret key needs to be added to .env.local</li>
            <li>⚠️ Webhook secret needs to be configured for production</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Add your Stripe secret key to .env.local</li>
            <li>Test the API endpoints (buttons above)</li>
            <li>Set up webhooks in your Stripe dashboard</li>
            <li>Test with real Stripe checkout in development</li>
            <li>Switch to live keys for production</li>
          </ol>
        </div>

        {session ? (
          <p className="text-center text-sm text-gray-500 mt-6">
            Logged in as: {session.user?.email}
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 mt-6">
            <a href="/auth/signin" className="text-purple-600 hover:underline">
              Sign in to test payments
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
