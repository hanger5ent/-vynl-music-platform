'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, Headphones, Download, Loader2, Play, Clock, AlertCircle, ShoppingCart } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  duration: number
  audioUrl: string | null
  processingStatus: 'PROCESSING' | 'READY' | 'ERRORED'
}

interface BookDetail {
  id: string
  title: string
  description: string
  author: string
  narrator: string | null
  coverImage: string | null
  format: 'EBOOK' | 'AUDIOBOOK'
  genre: string | null
  price: string
  isFree: boolean
  fileUrl: string | null
  fileFormat: string | null
  owner: { id: string; name: string | null; username: string; avatar: string | null }
  chapters: Chapter[]
  isOwner: boolean
  purchased: boolean
}

function formatDuration(seconds: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuying, setIsBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBook = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/books/${params.id}`)
      const data = await res.json()
      if (res.ok) setBook(data.book)
      else setError(data.error || 'Book not found')
    } catch {
      setError('Could not load this book.')
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  const buyBook = async () => {
    if (!book) return
    setIsBuying(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: book.id, kind: 'book', name: book.title, price: Number(book.price), artistId: book.owner.id }],
        }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Could not start checkout')
      }
    } catch {
      setError('Could not start checkout')
    } finally {
      setIsBuying(false)
    }
  }

  const downloadBook = async () => {
    setError(null)
    try {
      const res = await fetch(`/api/books/${params.id}/download`)
      const data = await res.json()
      if (res.ok && data.fileUrl) {
        window.open(data.fileUrl, '_blank')
      } else {
        setError(data.error || 'Could not get download link')
      }
    } catch {
      setError('Could not get download link')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/books" className="text-teal-600 hover:text-teal-700 font-medium">Back to Books</Link>
        </div>
      </div>
    )
  }

  const canAccess = book.isOwner || book.purchased || book.isFree

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:w-64 aspect-square bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shrink-0">
              {book.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : book.format === 'AUDIOBOOK' ? (
                <Headphones className="w-16 h-16 text-white" />
              ) : (
                <BookOpen className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-2">
                {book.format === 'AUDIOBOOK' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                {book.format === 'AUDIOBOOK' ? 'Audiobook' : 'Ebook'}
                {book.genre && <> &middot; {book.genre}</>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{book.title}</h1>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              {book.narrator && <p className="text-sm text-gray-500 mb-3">Narrated by {book.narrator}</p>}
              <p className="text-sm text-gray-500 mb-4">
                Published by{' '}
                <Link href={`/artist/${book.owner.id}`} className="text-teal-600 hover:text-teal-700">
                  {book.owner.name || book.owner.username}
                </Link>
              </p>

              <p className="text-gray-700 whitespace-pre-wrap mb-6">{book.description}</p>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {book.isOwner ? (
                <div className="text-sm text-gray-500">This is your own book.</div>
              ) : canAccess ? (
                book.format === 'EBOOK' ? (
                  <button
                    onClick={downloadBook}
                    className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" /> Download {book.fileFormat?.toUpperCase()}
                  </button>
                ) : (
                  <div className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2 inline-block">
                    You own this audiobook — chapters are below.
                  </div>
                )
              ) : !session?.user ? (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Sign in to purchase
                </Link>
              ) : (
                <button
                  onClick={buyBook}
                  disabled={isBuying}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  Buy for ${Number(book.price).toFixed(2)}
                </button>
              )}
            </div>
          </div>
        </div>

        {book.format === 'AUDIOBOOK' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Chapters</h2>
            {book.chapters.length === 0 ? (
              <p className="text-gray-500 text-sm">No chapters uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {book.chapters.map((chapter) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span className="text-gray-400 text-sm">#{chapter.chapterNumber}</span>
                        {chapter.title}
                      </div>
                      {chapter.processingStatus === 'READY' && (
                        <span className="text-xs text-gray-500">{formatDuration(chapter.duration)}</span>
                      )}
                    </div>
                    {!canAccess ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Play className="w-4 h-4" /> Purchase this audiobook to listen
                      </div>
                    ) : chapter.processingStatus === 'READY' && chapter.audioUrl ? (
                      <audio controls src={chapter.audioUrl} className="w-full h-10" />
                    ) : chapter.processingStatus === 'ERRORED' ? (
                      <div className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> Processing failed for this chapter.
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                        <Clock className="w-4 h-4 shrink-0 animate-pulse" /> Processing audio...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
