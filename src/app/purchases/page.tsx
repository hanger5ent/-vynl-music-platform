'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Download, Search, CreditCard, Loader2 } from 'lucide-react'

interface PurchaseEntry {
  id: string
  type: 'track' | 'album' | 'merchandise'
  title: string
  artist: string
  price: number
  purchaseDate: string
  status: string
  trackCount?: number
  audioUrl?: string | null
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
    PROCESSING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
    SHIPPED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Shipped' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    REFUNDED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refunded' },
  }
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
}

export default function PurchasesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data.purchases || [])
      setTotalSpent(data.totalSpent || 0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchPurchases()
  }, [session?.user, fetchPurchases])

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

  const tabs = [
    { id: 'all', label: 'All Purchases', count: purchases.length },
    { id: 'music', label: 'Music', count: purchases.filter((p) => ['track', 'album'].includes(p.type)).length },
    { id: 'merchandise', label: 'Merchandise', count: purchases.filter((p) => p.type === 'merchandise').length },
  ]

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'music' && ['track', 'album'].includes(purchase.type)) ||
      (activeTab === 'merchandise' && purchase.type === 'merchandise')

    const matchesSearch = searchQuery === '' ||
      purchase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.artist.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
          <p className="text-gray-600">Your music and merchandise orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                <p className="text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{purchases.filter((p) => ['track', 'album'].includes(p.type)).length}</p>
                <p className="text-gray-600">Music Downloads</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-4">Start supporting your favorite artists by purchasing their music</p>
              <Link href="/discover" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Discover Music
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <div key={purchase.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{purchase.title}</h3>
                          {getStatusBadge(purchase.status)}
                        </div>
                        <p className="text-gray-600 truncate">{purchase.artist}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Purchased {new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                          <span>${purchase.price.toFixed(2)}</span>
                          {purchase.trackCount && <span>{purchase.trackCount} tracks</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {purchase.type === 'track' && purchase.audioUrl && purchase.status === 'COMPLETED' && (
                        <a
                          href={purchase.audioUrl}
                          download
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{purchases.filter((p) => p.type === 'album').length}</p>
              <p className="text-gray-600">Albums</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{purchases.filter((p) => p.type === 'track').length}</p>
              <p className="text-gray-600">Tracks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{purchases.filter((p) => p.type === 'merchandise').length}</p>
              <p className="text-gray-600">Merchandise</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${totalSpent.toFixed(2)}</p>
              <p className="text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
