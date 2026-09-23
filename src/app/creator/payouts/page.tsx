'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/ui/Sidebar'
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { PLATFORM_FEE_PERCENT } from '@/lib/stripe'

interface ConnectStatus {
  connected: boolean
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
  requirementsDue?: string[]
}

export default function CreatorPayoutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <CreatorPayoutsPageContent />
    </Suspense>
  )
}

function CreatorPayoutsPageContent() {
  const { data: session, status: sessionStatus } = useSession()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/creator/connect/status')
      if (!res.ok) throw new Error('Failed to load payout status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setError('Could not load your payout status.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.isCreator) fetchStatus()
  }, [session?.user?.isCreator, fetchStatus])

  const startOnboarding = async () => {
    setIsStartingOnboarding(true)
    setError(null)
    try {
      const res = await fetch('/api/creator/connect/onboard', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start onboarding')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Could not start onboarding')
    } finally {
      setIsStartingOnboarding(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!session.user.isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator access required</h1>
          <p className="text-gray-600 mb-4">Payout settings are only available to creators.</p>
          <Link href="/for-artists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Apply for Creator Access
          </Link>
        </div>
      </div>
    )
  }

  const onboardingJustCompleted = searchParams.get('onboarding') === 'complete'
  const fullyActive = status?.connected && status.chargesEnabled && status.payoutsEnabled

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar userType="creator" />

      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Payouts</h1>
          <p className="text-gray-500 mb-6">
            Connect a Stripe account so fans&apos; subscription and purchase payments can actually reach you.
            Vynl keeps {PLATFORM_FEE_PERCENT}% as a platform fee; the rest is transferred to your account automatically by Stripe.
          </p>

          {onboardingJustCompleted && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 mb-4">
              Thanks — we're checking your account status below.
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

          {isLoading ? (
            <div className="flex justify-center py-10 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {!status?.connected ? (
                <>
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Payouts aren&apos;t set up yet</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Fans can&apos;t subscribe to you or buy your tracks until you connect a Stripe account to receive payouts.
                  </p>
                  <button
                    onClick={startOnboarding}
                    disabled={isStartingOnboarding}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isStartingOnboarding && <Loader2 className="w-4 h-4 animate-spin" />}
                    Set up payouts with Stripe
                  </button>
                </>
              ) : fullyActive ? (
                <>
                  <div className="flex items-center gap-2 text-green-700 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Payouts are active</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Subscription and purchase payments are transferred to your connected Stripe account automatically.
                  </p>
                  <button
                    onClick={startOnboarding}
                    className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Manage on Stripe <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-700 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Onboarding incomplete</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Stripe still needs some information from you before you can accept payments and receive payouts.
                  </p>
                  {status.requirementsDue && status.requirementsDue.length > 0 && (
                    <ul className="text-xs text-gray-500 list-disc list-inside mb-4">
                      {status.requirementsDue.map((req) => <li key={req}>{req.replace(/_/g, ' ')}</li>)}
                    </ul>
                  )}
                  <button
                    onClick={startOnboarding}
                    disabled={isStartingOnboarding}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isStartingOnboarding && <Loader2 className="w-4 h-4 animate-spin" />}
                    Continue onboarding
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
