'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { CreateProductForm } from '@/components/shop/CreateProductForm'
import { ProductsList } from '@/components/shop/ProductsList'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function CreatorShopPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar userType="creator" />
      
      <div className="flex-1">
        <div className="p-8 pt-24">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Shop</h1>
              <p className="text-gray-600 mt-2">Manage your products and merchandise</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Orders</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-bold text-green-600">$3,456</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
              <p className="text-2xl font-bold text-purple-600">$12,890</p>
            </div>
          </div>

          {/* Create Product Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add New Product</h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <CreateProductForm 
                    onSuccess={() => {
                      setShowCreateForm(false)
                      // Refresh products list
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products List */}
          <ProductsList />
        </div>
      </div>
    </div>
  )
}
