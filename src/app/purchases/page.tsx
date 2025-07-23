'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Download, RefreshCw, Search, Filter, Calendar, CreditCard } from 'lucide-react'

export default function PurchasesPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Mock purchases data
  const purchases = [
    {
      id: 1,
      type: 'album',
      title: "Midnight Dreams",
      artist: "Luna Waves",
      price: 9.99,
      purchaseDate: "2024-01-15",
      status: 'completed',
      downloadUrl: '#',
      coverUrl: "/api/placeholder/80/80",
      trackCount: 12,
      duration: "45:30"
    },
    {
      id: 2,
      type: 'single',
      title: "Urban Symphony",
      artist: "Beat Collective",
      price: 1.99,
      purchaseDate: "2024-01-10",
      status: 'completed',
      downloadUrl: '#',
      coverUrl: "/api/placeholder/80/80",
      duration: "4:12"
    },
    {
      id: 3,
      type: 'merchandise',
      title: "Luna Waves Tour T-Shirt",
      artist: "Luna Waves",
      price: 25.00,
      purchaseDate: "2024-01-05",
      status: 'shipped',
      trackingNumber: 'LW2024001',
      coverUrl: "/api/placeholder/80/80"
    },
    {
      id: 4,
      type: 'album',
      title: "Acoustic Sessions",
      artist: "Various Artists",
      price: 12.99,
      purchaseDate: "2023-12-20",
      status: 'completed',
      downloadUrl: '#',
      coverUrl: "/api/placeholder/80/80",
      trackCount: 15,
      duration: "58:45"
    }
  ]

  const tabs = [
    { id: 'all', label: 'All Purchases', count: purchases.length },
    { id: 'music', label: 'Music', count: purchases.filter(p => ['album', 'single'].includes(p.type)).length },
    { id: 'merchandise', label: 'Merchandise', count: purchases.filter(p => p.type === 'merchandise').length }
  ]

  const filteredPurchases = purchases.filter(purchase => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'music' && ['album', 'single'].includes(purchase.type)) ||
      (activeTab === 'merchandise' && purchase.type === 'merchandise')
    
    const matchesSearch = searchQuery === '' ||
      purchase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.artist.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.price, 0)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Shipped' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
          <p className="text-gray-600">Your music and merchandise orders</p>
        </div>

        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-gray-900">{purchases.filter(p => ['album', 'single'].includes(p.type)).length}</p>
                <p className="text-gray-600">Music Downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4" />
            Date Range
          </button>
        </div>

        {/* Tabs */}
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

        {/* Purchases List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-4">Start supporting your favorite artists by purchasing their music</p>
              <Link
                href="/discover"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Discover Music
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <div key={purchase.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={purchase.coverUrl}
                        alt={purchase.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
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
                          {purchase.duration && <span>{purchase.duration}</span>}
                        </div>
                        {purchase.trackingNumber && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">
                              Tracking: <span className="font-mono font-medium">{purchase.trackingNumber}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {purchase.downloadUrl && purchase.status === 'completed' && (
                        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      )}
                      {purchase.status === 'shipped' && (
                        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          <RefreshCw className="h-4 w-4" />
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase History Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{purchases.filter(p => p.type === 'album').length}</p>
              <p className="text-gray-600">Albums</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{purchases.filter(p => p.type === 'single').length}</p>
              <p className="text-gray-600">Singles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{purchases.filter(p => p.type === 'merchandise').length}</p>
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
