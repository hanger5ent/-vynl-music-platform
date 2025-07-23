'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

export function CreateProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [''],
    category: 'MERCHANDISE',
    tags: [''],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/shop/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: formData.images.filter(img => img.trim() !== ''),
          tags: formData.tags.filter(tag => tag.trim() !== ''),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Product created successfully!')
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to create product')
      }
    } catch (error) {
      toast.error('An error occurred while creating the product')
    } finally {
      setIsLoading(false)
    }
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const addTagField = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }))
  }

  const removeTagField = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stock"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="MERCHANDISE">Merchandise</option>
          <option value="VINYL">Vinyl</option>
          <option value="CD">CD</option>
          <option value="DIGITAL">Digital</option>
          <option value="APPAREL">Apparel</option>
          <option value="ACCESSORIES">Accessories</option>
          <option value="TICKETS">Tickets</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images
        </label>
        {formData.images.map((image, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={image}
              onChange={(e) => {
                const newImages = [...formData.images]
                newImages[index] = e.target.value
                setFormData({ ...formData, images: newImages })
              }}
              placeholder="Image URL"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {formData.images.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addImageField}
          className="flex items-center gap-2 text-green-600 hover:text-green-800"
        >
          <PlusIcon className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        {formData.tags.map((tag, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => {
                const newTags = [...formData.tags]
                newTags[index] = e.target.value
                setFormData({ ...formData, tags: newTags })
              }}
              placeholder="Tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {formData.tags.length > 1 && (
              <button
                type="button"
                onClick={() => removeTagField(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTagField}
          className="flex items-center gap-2 text-green-600 hover:text-green-800"
        >
          <PlusIcon className="w-4 h-4" />
          Add Tag
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}
