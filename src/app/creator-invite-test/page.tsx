"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import CreatorInviteForm from '@/components/invites/CreatorInviteForm';

interface TestResult {
  timestamp: string
  test: string
  success: boolean
  data?: any
  error?: string
}

export default function CreatorInviteTestPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addResult = (test: string, success: boolean, data?: any, error?: string) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      success,
      data,
      error
    }]);
  };

  const testDirectAPI = async () => {
    if (!session?.user) {
      alert('Please sign in first');
      return;
    }

    try {
      const response = await fetch('/api/invites/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          message: 'This is a test creator invitation from the API!'
        }),
      });

      const result = await response.json();
      addResult('Direct API Test', response.ok, result, result.error);
    } catch (error) {
      addResult('Direct API Test', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testResendConfig = async () => {
    try {
      const response = await fetch('/api/test/resend-config');
      const result = await response.json();
      addResult('Resend Configuration', response.ok, result, result.error);
    } catch (error) {
      addResult('Resend Configuration', false, null, 'Failed to check config');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎵 Creator Invite System Test</h1>
          <p className="text-purple-200 text-lg">
            Test and debug the creator invitation functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🧪 System Tests</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Authentication Status</h3>
                {session?.user ? (
                  <div className="text-green-300">
                    ✅ Signed in as: {session.user.name || session.user.email}
                  </div>
                ) : (
                  <div className="text-red-300">
                    ❌ Not signed in - <a href="/auth/signin" className="text-blue-400 underline">Sign in</a>
                  </div>
                )}
              </div>

              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Email Configuration</h3>
                <div className="text-gray-300 text-sm">
                  Resend API: {process.env.NEXT_PUBLIC_RESEND_CONFIGURED ? '✅ Configured' : '❌ Not configured'}
                </div>
                <button
                  onClick={testResendConfig}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Test Email Config
                </button>
              </div>

              <button
                onClick={testDirectAPI}
                disabled={!session?.user}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🧪 Test Direct API Call
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {showForm ? '🔙 Hide Form' : '📝 Test Invite Form'}
              </button>
            </div>

            {showForm && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-white font-semibold mb-4">Creator Invite Form Test</h3>
                <CreatorInviteForm 
                  onSuccess={() => {
                    addResult('Form Submission', true, { message: 'Form submitted successfully' });
                    setShowForm(false);
                  }}
                  onClose={() => setShowForm(false)}
                />
              </div>
            )}
          </Card>

          {/* Test Results */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Test Results</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">🧪</div>
                  <p>No tests run yet. Start testing the creator invite system!</p>
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
                      <div className="text-xs mt-2 opacity-75">
                        {result.data.message && (
                          <div className="mb-1">✨ {result.data.message}</div>
                        )}
                        {result.data.inviteCode && (
                          <div className="mb-1">🎫 Invite Code: {result.data.inviteCode}</div>
                        )}
                        {result.data.emailId && (
                          <div>📧 Email ID: {result.data.emailId}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setTestResults([])}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Clear Results
            </button>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📝 Testing Instructions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">✅ Prerequisites</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Sign in to the platform</li>
                <li>• Resend API key configured</li>
                <li>• Email service working</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">🧪 Test Steps</h3>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Check authentication status</li>
                <li>Test email configuration</li>
                <li>Try direct API call</li>
                <li>Test form submission</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
            <h3 className="text-yellow-300 font-semibold mb-2">💡 Troubleshooting</h3>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• <strong>Email not sending?</strong> Check Resend API key in .env.local</li>
              <li>• <strong>401 Unauthorized?</strong> Make sure you&apos;re signed in</li>
              <li>• <strong>500 Server Error?</strong> Check console logs for details</li>
              <li>• <strong>Form not working?</strong> Try the direct API test first</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
