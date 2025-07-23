"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SubscriberManager from '@/components/creator/SubscriberManager';
import { Card } from '@/components/ui/Card';

export default function CreatorSubscribersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/creator/subscribers');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              Please sign in to access your subscriber management dashboard.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <SubscriberManager />
      </div>
    </div>
  );
}
