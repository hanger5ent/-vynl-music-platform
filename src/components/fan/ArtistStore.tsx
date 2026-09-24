'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  Search,
  Grid3X3,
  List,
  Package,
  Plus,
  Minus,
  X,
  Loader2
} from 'lucide-react'

const CATEGORIES = ['MERCHANDISE', 'VINYL', 'CD', 'DIGITAL', 'APPAREL', 'ACCESSORIES', 'TICKETS', 'OTHER'] as const

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  images: string[]
  category: string
  tags: string[]
  seller: { id: string; name: string | null; username: string; avatar: string | null }
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  artistId: string
  artistName: string
}

interface ArtistStoreProps {
  artistId?: string
  showAllArtists?: boolean
}

export default function ArtistStore({ artistId, showAllArtists = false }: ArtistStoreProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (artistId && !showAllArtists) params.set('sellerId', artistId)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/shop/products?${params.toString()}`)
      const data = await res.json()
      setProducts(res.ok ? data.products || [] : [])
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [artistId, showAllArtists, searchQuery, filterCategory])

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timeout)
  }, [fetchProducts])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      default: return 0
    }
  })

  const addToCart = (product: Product) => {
    setCheckoutError(null)
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, artistId: product.seller.id, artistName: product.seller.name || product.seller.username }]
    })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId))
      return
    }
    setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity } : item))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const distinctArtists = new Set(cart.map((item) => item.artistId))

  const checkout = async () => {
    if (distinctArtists.size > 1) {
      setCheckoutError('Your cart has items from more than one artist — check out one artist\'s items at a time.')
      return
    }
    setIsCheckingOut(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            kind: 'product',
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            artistId: item.artistId,
          })),
        }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setCheckoutError(data.error || 'Could not start checkout')
      }
    } catch {
      setCheckoutError('Could not start checkout')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {artistId && !showAllArtists ? 'Artist Store' : 'Music Store'}
          </h2>
          <p className="text-gray-600">
            {artistId && !showAllArtists ? 'Exclusive merchandise and music' : 'Shop from all your favorite artists'}
          </p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {sortedProducts.map((product) => (
            <div key={product.id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex gap-6 p-6' : 'p-6'}`}>
              <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'} bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden shrink-0`}>
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                {showAllArtists && (
                  <p className="text-sm text-purple-600 mb-1">{product.seller.name || product.seller.username}</p>
                )}
                {product.description && <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>}

                <div className="mb-3 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {product.category.charAt(0) + product.category.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.stock > 0 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>

                {product.stock > 0 && product.stock < 10 && (
                  <p className="text-xs text-orange-600 mt-2">Only {product.stock} left in stock!</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && sortedProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Shopping Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.artistName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  {checkoutError && <p className="text-sm text-red-600">{checkoutError}</p>}
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total: ${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={checkout}
                    disabled={isCheckingOut}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isCheckingOut ? 'Redirecting to checkout...' : 'Checkout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
