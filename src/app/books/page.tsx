'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Headphones, Search, Loader2 } from 'lucide-react'

interface BookListItem {
  id: string
  title: string
  author: string
  narrator: string | null
  coverImage: string | null
  format: 'EBOOK' | 'AUDIOBOOK'
  genre: string | null
  price: string
  isFree: boolean
  owner: { id: string; name: string | null; username: string }
  _count: { chapters: number; purchases: number }
}

export default function BooksDiscoveryPage() {
  const [books, setBooks] = useState<BookListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState<'ALL' | 'EBOOK' | 'AUDIOBOOK'>('ALL')

  const fetchBooks = useCallback(async (query: string, fmt: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('search', query.trim())
      if (fmt !== 'ALL') params.set('format', fmt)
      const res = await fetch(`/api/books?${params.toString()}`)
      const data = await res.json()
      setBooks(data.books || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchBooks(search, format), 300)
    return () => clearTimeout(timeout)
  }, [search, format, fetchBooks])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Books</h1>
          <p className="text-gray-600">Ebooks and audiobooks from creators on VYNL.</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'EBOOK', 'AUDIOBOOK'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  format === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'EBOOK' ? 'Ebooks' : 'Audiobooks'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Check back soon — creators are just getting started here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : book.format === 'AUDIOBOOK' ? (
                    <Headphones className="w-12 h-12 text-white" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white" />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
                    {book.format === 'AUDIOBOOK' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    {book.format === 'AUDIOBOOK' ? 'Audiobook' : 'Ebook'}
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">
                      {book.owner.name || book.owner.username}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {book.isFree ? 'Free' : `$${Number(book.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
