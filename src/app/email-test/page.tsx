"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

interface TestResult {
  timestamp: string
  test: string
  success: boolean
  data?: any
  error?: string
}

export default function EmailTestPage() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const addResult = (test: string, success: boolean, data?: any, error?: string) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      success,
      data,
      error
    }]);
  };

  const testWelcomeEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading('welcome');
    try {
      const response = await fetch('/api/test/email-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          name: 'Test User',
          userType: 'fan'
        })
      });

      const result = await response.json();
      addResult('Welcome Email (Fan)', response.ok, result, result.error);
    } catch (error) {
      addResult('Welcome Email (Fan)', false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const testCreatorWelcome = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading('creator-welcome');
    try {
      const response = await fetch('/api/test/email-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          name: 'Test Creator',
          userType: 'creator'
        })
      });

      const result = await response.json();
      addResult('Welcome Email (Creator)', response.ok, result, result.error);
    } catch (error) {
      addResult('Welcome Email (Creator)', false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const testPaymentConfirmation = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading('payment');
    try {
      const response = await fetch('/api/test/email-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          customerName: 'Test Customer',
          amount: 999,
          subscriptionTier: 'premium'
        })
      });

      const result = await response.json();
      addResult('Payment Confirmation', response.ok, result, result.error);
    } catch (error) {
      addResult('Payment Confirmation', false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const testNewsletterSubscription = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading('newsletter');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          name: 'Newsletter Tester',
          preferences: {
            artistUpdates: true,
            platformNews: true,
            promotions: false
          }
        })
      });

      const result = await response.json();
      addResult('Newsletter Subscription', response.ok, result, result.error);
    } catch (error) {
      addResult('Newsletter Subscription', false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const testCreatorInvite = async () => {
    if (!testEmail || !session?.user?.email) {
      alert('Please enter a test email address and make sure you are signed in');
      return;
    }

    setLoading('invite');
    try {
      const response = await fetch('/api/invites/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          message: 'Join our amazing music platform as a creator!'
        })
      });

      const result = await response.json();
      addResult('Creator Invite', response.ok, result, result.error);
    } catch (error) {
      addResult('Creator Invite', false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📧 Email Service Testing</h1>
          <p className="text-purple-200 text-lg">
            Test all email functionality for your music streaming platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🧪 Email Tests</h2>
            
            <div className="mb-6">
              <label className="block text-white mb-2">Test Email Address:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={testWelcomeEmail}
                disabled={loading === 'welcome'}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading === 'welcome' ? 'Sending...' : '📨 Test Welcome Email (Fan)'}
              </button>

              <button
                onClick={testCreatorWelcome}
                disabled={loading === 'creator-welcome'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading === 'creator-welcome' ? 'Sending...' : '🎤 Test Welcome Email (Creator)'}
              </button>

              <button
                onClick={testPaymentConfirmation}
                disabled={loading === 'payment'}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading === 'payment' ? 'Sending...' : '💰 Test Payment Confirmation'}
              </button>

              <button
                onClick={testNewsletterSubscription}
                disabled={loading === 'newsletter'}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading === 'newsletter' ? 'Subscribing...' : '📬 Test Newsletter Subscription'}
              </button>

              <button
                onClick={testCreatorInvite}
                disabled={loading === 'invite' || !session?.user}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading === 'invite' ? 'Sending...' : '🎵 Test Creator Invite'}
              </button>

              {!session?.user && (
                <p className="text-yellow-400 text-sm">
                  ⚠️ Sign in to test creator invites
                </p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">📊 Configuration Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Resend API:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                  }`}>
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email From:</span>
                  <span className="text-purple-300 text-xs">Check .env.local</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Test Results */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">📋 Test Results</h2>
              {testResults.length > 0 && (
                <button
                  onClick={clearResults}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear Results
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">📧</div>
                  <p>No tests run yet. Start testing your email functionality above!</p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.success
                        ? 'bg-green-900/20 border-green-500 text-green-100'
                        : 'bg-red-900/20 border-red-500 text-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {result.success ? '✅' : '❌'} {result.test}
                      </span>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                    {result.error && (
                      <p className="text-sm mt-2 opacity-90">
                        Error: {result.error}
                      </p>
                    )}
                    {result.data && result.success && (
                      <pre className="text-xs mt-2 opacity-75 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">⚙️ Setup Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <h3 className="font-semibold mb-2 text-purple-300">📧 Resend Configuration</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                <li>Sign up at <a href="https://resend.com" target="_blank" className="text-purple-400 hover:underline">resend.com</a></li>
                <li>Get your API key from the dashboard</li>
                <li>Update your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file:</li>
              </ol>
              <pre className="bg-gray-800 p-3 rounded mt-2 text-xs overflow-x-auto">
                RESEND_API_KEY=re_your_api_key_here
                EMAIL_FROM=noreply@yourdomain.com
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-purple-300">🔧 Quick Setup</h3>
              <p className="text-sm text-gray-300 mb-2">Run the setup script:</p>
              <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                node scripts/setup-resend.js
              </pre>
              <p className="text-sm text-gray-300 mt-2">
                This will guide you through the configuration process step by step.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
