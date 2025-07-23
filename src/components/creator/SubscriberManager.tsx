"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

interface Subscriber {
  id: string;
  subscriber: {
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    createdAt: string;
  };
  tier: string;
  emailConsent: boolean;
  emailPreferences?: {
    updates: boolean;
    releases: boolean;
    promotions: boolean;
  };
  startDate: string;
  nextBilling?: string;
  amount: number;
  currency: string;
}

interface SubscriberStats {
  total: number;
  byTier: {
    basic: number;
    premium: number;
    vip: number;
  };
  emailConsentCount: number;
}

export default function SubscriberManager() {
  const { data: session } = useSession();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showEmails, setShowEmails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTier, setFilterTier] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchSubscribers();
    }
  }, [session, currentPage, filterTier, showEmails]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        includeEmails: showEmails.toString(),
      });

      if (filterTier) {
        params.append('tier', filterTier);
      }

      const response = await fetch(`/api/creator/subscribers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch subscribers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportEmails = async () => {
    try {
      const response = await fetch('/api/creator/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export_emails',
          subscriberIds: selectedSubscribers.length > 0 ? selectedSubscribers : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Create and download CSV
        const csvContent = [
          'Email,Name,Tier,Subscription Date,Email Preferences',
          ...data.emails.map((sub: any) => 
            `${sub.email || sub.user?.email || ''},${sub.name || sub.user?.name || ''},${sub.tier},${sub.subscriptionDate || sub.startDate},${JSON.stringify(sub.emailPreferences || {})}`
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        alert(`Exported ${data.count} subscriber emails!`);
      } else {
        alert('Failed to export emails: ' + data.error);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const toggleSubscriberSelection = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const selectAllSubscribers = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s.id));
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic': return 'bg-green-600';
      case 'premium': return 'bg-purple-600';
      case 'vip': return 'bg-gold-600';
      default: return 'bg-gray-600';
    }
  };

  if (!session?.user) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-300">Please sign in to manage your subscribers.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Subscriber Management</h1>
            <p className="text-purple-200 mt-2">
              Manage your fan base and collect subscriber emails for marketing
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEmails(!showEmails)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showEmails
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {showEmails ? 'Hide Emails' : 'Show Emails'}
            </button>
            <button
              onClick={exportEmails}
              disabled={!showEmails}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              📧 Export Emails ({selectedSubscribers.length > 0 ? selectedSubscribers.length : stats?.emailConsentCount || 0})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-blue-200 text-sm">Total Subscribers</div>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.byTier.basic || 0}</div>
              <div className="text-green-200 text-sm">Basic Tier</div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.byTier.premium || 0}</div>
              <div className="text-purple-200 text-sm">Premium Tier</div>
            </div>
            <div className="bg-yellow-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.byTier.vip || 0}</div>
              <div className="text-yellow-200 text-sm">VIP Tier</div>
            </div>
          </div>
        )}

        {/* Email Consent Stats */}
        {stats && (
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-300 font-semibold">
                  📧 {stats.emailConsentCount} subscribers have opted in to receive emails
                </span>
                <div className="text-green-200 text-sm mt-1">
                  ({Math.round((stats.emailConsentCount / stats.total) * 100)}% of total subscribers)
                </div>
              </div>
              <div className="text-green-300 text-2xl font-bold">
                {stats.emailConsentCount}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Filters and Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterTier}
              onChange={(e) => {
                setFilterTier(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
            
            <button
              onClick={selectAllSubscribers}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              {selectedSubscribers.length === subscribers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="text-gray-300 text-sm">
            {selectedSubscribers.length > 0 && `${selectedSubscribers.length} selected`}
          </div>
        </div>
      </Card>

      {/* Subscribers List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Your Subscribers</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading subscribers...</div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👤</div>
            <div className="text-white text-lg mb-2">No subscribers yet</div>
            <p className="text-gray-300">
              Start promoting your subscription tiers to build your fan base!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSubscribers.includes(subscriber.id)
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onChange={() => toggleSubscriberSelection(subscriber.id)}
                      className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <div className="flex items-center space-x-3">
                      {subscriber.subscriber.avatar ? (
                        <img
                          src={subscriber.subscriber.avatar}
                          alt={subscriber.subscriber.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {(subscriber.subscriber.name || subscriber.subscriber.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <div className="text-white font-semibold">
                          {subscriber.subscriber.name || subscriber.subscriber.username}
                        </div>
                        {showEmails && subscriber.subscriber.email && (
                          <div className="text-gray-300 text-sm">
                            📧 {subscriber.subscriber.email}
                          </div>
                        )}
                        <div className="text-gray-400 text-xs">
                          Subscribed: {new Date(subscriber.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getTierColor(subscriber.tier)}`}>
                      {subscriber.tier.toUpperCase()}
                    </span>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatCurrency(subscriber.amount, subscriber.currency)}
                      </div>
                      {subscriber.nextBilling && (
                        <div className="text-gray-400 text-xs">
                          Next: {new Date(subscriber.nextBilling).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {subscriber.emailConsent ? (
                        <span className="text-green-400 text-xs">✅ Email OK</span>
                      ) : (
                        <span className="text-red-400 text-xs">❌ No Email</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors"
            >
              Previous
            </button>
            
            <span className="text-white px-4">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </Card>

      {/* Email Marketing Tools */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">📧 Email Marketing Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900/30 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">📊 Email Analytics</h3>
            <p className="text-blue-200 text-sm mb-3">
              Track open rates, click rates, and engagement metrics for your email campaigns.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              View Analytics
            </button>
          </div>
          
          <div className="bg-green-900/30 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">📬 Send Newsletter</h3>
            <p className="text-green-200 text-sm mb-3">
              Create and send newsletters to your subscribers with updates and exclusive content.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Create Newsletter
            </button>
          </div>
          
          <div className="bg-purple-900/30 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">🎯 Targeted Campaigns</h3>
            <p className="text-purple-200 text-sm mb-3">
              Send targeted messages to specific subscriber tiers or groups.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Create Campaign
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
