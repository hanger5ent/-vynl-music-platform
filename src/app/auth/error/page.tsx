'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid. It may have been used already or expired.',
  Default: 'An error occurred during authentication.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from the OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'The account is already associated with another user.',
  SessionRequired: 'You must be signed in to access this page.',
  Signin: 'Error in the sign in process.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {errorMessages[error] || errorMessages.Default}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                What you can try:
              </h3>
              <div className="text-left space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Try signing in again with a different method</span>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Clear your browser cache and cookies</span>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Check if you have an existing account with this email</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                If you continue having problems, please{' '}
                <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
