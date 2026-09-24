'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardImage } from '@/components/ui/Card'

interface ShopProduct {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
}

export function ProductsList({ sellerId, refreshKey }: { sellerId?: string; refreshKey?: number } = {}) {
  const [products, setProducts] = useState<ShopProduct[]>([])

  useEffect(() => {
    fetchProducts()
  }, [sellerId, refreshKey])

  const fetchProducts = async () => {
    try {
      const params = sellerId ? `?sellerId=${sellerId}` : ''
      const response = await fetch(`/api/shop/products${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
      } else {
        console.error('Failed to fetch products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <CardImage src={product.images[0] || '/default-product.png'} alt={product.name} />
          <CardContent>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{product.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

