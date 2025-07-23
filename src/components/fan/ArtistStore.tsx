'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Filter, 
  Search, 
  Grid3X3, 
  List,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  X
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: 'music' | 'apparel' | 'accessories' | 'vinyl' | 'digital'
  artistId: string
  artistName: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  isLiked: boolean
  tags: string[]
}

interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface ArtistStoreProps {
  artistId?: string
  showAllArtists?: boolean
}

export default function ArtistStore({ artistId, showAllArtists = false }: ArtistStoreProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Synthwave Dreams - Vinyl LP',
        description: 'Limited edition purple vinyl with exclusive artwork and liner notes.',
        price: 29.99,
        originalPrice: 34.99,
        images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
        category: 'vinyl',
        artistId: '1',
        artistName: 'Neon Nights',
        inStock: true,
        stockQuantity: 50,
        rating: 4.8,
        reviewCount: 124,
        isLiked: false,
        tags: ['limited-edition', 'vinyl', 'collectible']
      },
      {
        id: '2',
        name: 'Neon Nights T-Shirt',
        description: 'Premium cotton t-shirt with glow-in-the-dark logo design.',
        price: 24.99,
        images: ['/api/placeholder/300/300'],
        category: 'apparel',
        artistId: '1',
        artistName: 'Neon Nights',
        inStock: true,
        stockQuantity: 100,
        rating: 4.6,
        reviewCount: 89,
        isLiked: true,
        tags: ['apparel', 'glow-in-dark', 'cotton']
      },
      {
        id: '3',
        name: 'Digital Album - Night Drive',
        description: 'High-quality FLAC download with bonus tracks and digital booklet.',
        price: 9.99,
        images: ['/api/placeholder/300/300'],
        category: 'digital',
        artistId: '2',
        artistName: 'Synthwave Stars',
        inStock: true,
        stockQuantity: 999,
        rating: 4.9,
        reviewCount: 256,
        isLiked: false,
        tags: ['digital', 'flac', 'bonus-tracks']
      },
      {
        id: '4',
        name: 'Synthwave Keychain',
        description: 'Metal keychain with LED light effects and artist logo.',
        price: 12.99,
        images: ['/api/placeholder/300/300'],
        category: 'accessories',
        artistId: '1',
        artistName: 'Neon Nights',
        inStock: true,
        stockQuantity: 75,
        rating: 4.4,
        reviewCount: 42,
        isLiked: false,
        tags: ['led', 'metal', 'keychain']
      }
    ]

    // Filter by artist if specified
    if (artistId && !showAllArtists) {
      setProducts(mockProducts.filter(p => p.artistId === artistId))
    } else {
      setProducts(mockProducts)
    }
  }, [artistId, showAllArtists])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return parseInt(b.id) - parseInt(a.id)
      default:
        return 0
    }
  })

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const toggleLike = (productId: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, isLiked: !product.isLiked }
          : product
      )
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {artistId ? 'Artist Store' : 'Music Store'}
          </h2>
          <p className="text-gray-600">
            {artistId ? 'Exclusive merchandise and music' : 'Shop from all your favorite artists'}
          </p>
        </div>
        
        {/* Cart Button */}
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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="music">Music</option>
            <option value="vinyl">Vinyl</option>
            <option value="digital">Digital</option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex gap-6 p-6' : 'p-6'
            }`}
          >
            {/* Product Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'} bg-gray-200 rounded-lg mb-4 flex items-center justify-center cursor-pointer`}
                 onClick={() => {
                   setSelectedProduct(product)
                   setShowProductModal(true)
                 }}>
              <Package className="h-8 w-8 text-gray-400" />
              
              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLike(product.id)
                }}
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                  product.isLiked 
                    ? 'bg-red-100 text-red-500' 
                    : 'bg-white/80 text-gray-400 hover:bg-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${product.isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Sale Badge */}
              {product.originalPrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Sale
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={`flex-1 ${viewMode === 'list' ? '' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {showAllArtists && (
                    <p className="text-sm text-purple-600 mb-1">{product.artistName}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>

              {/* Category Tag */}
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.category === 'vinyl' ? 'bg-purple-100 text-purple-700' :
                  product.category === 'digital' ? 'bg-blue-100 text-blue-700' :
                  product.category === 'apparel' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    product.inStock
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Stock Info */}
              {product.inStock && product.stockQuantity < 10 && (
                <p className="text-xs text-orange-600 mt-2">
                  Only {product.stockQuantity} left in stock!
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Shopping Cart</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.artistName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
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

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total: ${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    Checkout
                  </button>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Free Shipping
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
