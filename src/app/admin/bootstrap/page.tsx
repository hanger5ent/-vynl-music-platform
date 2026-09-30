'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShieldCheck, Loader2, CheckCircle } from 'lucide-react'

export default function AdminBootstrapPage() {
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClick = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/bootstrap', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to grant admin access')
        return
      }
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Sign in with the account you want to become admin, then come back to this page.</p>
          <Link href="/auth/signin?callbackUrl=/admin/bootstrap" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re now an admin</h1>
          <p className="text-gray-600 mb-6">{session.user.email} has admin access.</p>
          <Link href="/admin" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <ShieldCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Become the First Admin</h1>
        <p className="text-gray-600 mb-2">
          Signed in as <span className="font-medium">{session.user.email}</span>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This only works once, before any admin account exists. If an admin already exists, this will do nothing.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-left">{error}</div>
        )}

        <button
          onClick={handleClick}
          disabled={submitting}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors"
        >
          {submitting ? 'Granting access...' : 'Make Me Admin'}
        </button>
      </div>
    </div>
  )
}
