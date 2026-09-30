'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, Headphones, UploadCloud, Loader2, ChevronDown, ChevronUp, Clock, AlertCircle, Plus } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  duration: number
  audioUrl: string | null
  processingStatus: 'PROCESSING' | 'READY' | 'ERRORED'
}

interface StudioBook {
  id: string
  title: string
  author: string
  narrator: string | null
  format: 'EBOOK' | 'AUDIOBOOK'
  genre: string | null
  price: string
  isFree: boolean
  fileUrl: string | null
  fileFormat: string | null
  chapters: Chapter[]
  createdAt: string
}

const emptyForm = {
  title: '',
  description: '',
  author: '',
  narrator: '',
  genre: '',
  price: '',
  format: 'EBOOK' as 'EBOOK' | 'AUDIOBOOK',
  fileUrl: '',
  fileFormat: 'pdf' as 'pdf' | 'epub',
}

export default function CreatorBooksPage() {
  const { data: session, status } = useSession()
  const [books, setBooks] = useState<StudioBook[]>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null)
  const [chapterUploads, setChapterUploads] = useState<Record<string, { file: File | null; title: string; chapterNumber: string; isUploading: boolean; error: string | null }>>({})

  const fetchBooks = useCallback(async (ownerId: string) => {
    setIsLoadingBooks(true)
    try {
      const res = await fetch(`/api/books?ownerId=${ownerId}`)
      if (!res.ok) throw new Error('Failed to load books')
      const data = await res.json()
      setBooks(data.books || [])
    } catch {
      setError('Could not load your books.')
    } finally {
      setIsLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) fetchBooks(session.user.id)
  }, [session?.user?.id, fetchBooks])

  useEffect(() => {
    if (!session?.user?.id) return
    if (!books.some((b) => b.chapters.some((c) => c.processingStatus === 'PROCESSING'))) return
    const interval = setInterval(() => fetchBooks(session.user.id), 5000)
    return () => clearInterval(interval)
  }, [session?.user?.id, books, fetchBooks])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.author.trim()) return
    if (form.format === 'EBOOK' && !form.fileUrl.trim()) return

    setIsCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          author: form.author,
          narrator: form.format === 'AUDIOBOOK' ? form.narrator : undefined,
          genre: form.genre,
          price: form.price ? Number(form.price) : 0,
          format: form.format,
          fileUrl: form.format === 'EBOOK' ? form.fileUrl : undefined,
          fileFormat: form.format === 'EBOOK' ? form.fileFormat : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not create book')
        return
      }
      setForm(emptyForm)
      if (session?.user?.id) await fetchBooks(session.user.id)
    } catch {
      setError('Could not create book. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const uploadChapter = async (bookId: string) => {
    const upload = chapterUploads[bookId]
    if (!upload?.file || !upload.title.trim() || !upload.chapterNumber) return

    setChapterUploads((prev) => ({ ...prev, [bookId]: { ...prev[bookId], isUploading: true, error: null } }))
    try {
      const body = new FormData()
      body.append('audio', upload.file)
      body.append('title', upload.title)
      body.append('chapterNumber', upload.chapterNumber)

      const res = await fetch(`/api/books/${bookId}/chapters`, { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) {
        setChapterUploads((prev) => ({ ...prev, [bookId]: { ...prev[bookId], isUploading: false, error: data.error || 'Upload failed' } }))
        return
      }
      setChapterUploads((prev) => ({ ...prev, [bookId]: { file: null, title: '', chapterNumber: '', isUploading: false, error: null } }))
      if (session?.user?.id) await fetchBooks(session.user.id)
    } catch {
      setChapterUploads((prev) => ({ ...prev, [bookId]: { ...prev[bookId], isUploading: false, error: 'Upload failed. Please try again.' } }))
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!session.user.isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator access required</h1>
          <p className="text-gray-600 mb-4">You need creator access to sell books.</p>
          <Link href="/for-artists" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Apply for Creator Access
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Books</h1>
        <p className="text-gray-500 mb-6">Sell ebooks and audiobooks alongside your music.</p>

        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-gray-200 p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" /> List a new book
          </h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, format: 'EBOOK' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md border text-sm font-medium ${
                form.format === 'EBOOK' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-gray-300 text-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Ebook
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, format: 'AUDIOBOOK' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md border text-sm font-medium ${
                form.format === 'AUDIOBOOK' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-gray-300 text-gray-600'
              }`}
            >
              <Headphones className="w-4 h-4" /> Audiobook
            </button>
          </div>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Author"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            {form.format === 'AUDIOBOOK' && (
              <input
                type="text"
                placeholder="Narrator (optional)"
                value={form.narrator}
                onChange={(e) => setForm((f) => ({ ...f, narrator: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Genre (optional)"
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price (blank = free)"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {form.format === 'EBOOK' && (
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="Download link (https://...)"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <select
                value={form.fileFormat}
                onChange={(e) => setForm((f) => ({ ...f, fileFormat: e.target.value as 'pdf' | 'epub' }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="pdf">PDF</option>
                <option value="epub">EPUB</option>
              </select>
            </div>
          )}
          {form.format === 'AUDIOBOOK' && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
              Create the audiobook first, then upload chapters below once it appears in your list.
            </p>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Book'}
          </button>
        </form>

        <h2 className="font-semibold text-gray-900 mb-3">Your books</h2>
        {isLoadingBooks ? (
          <div className="flex justify-center py-10 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : books.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No books yet. List your first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => {
              const upload = chapterUploads[book.id] || { file: null, title: '', chapterNumber: '', isUploading: false, error: null }
              return (
                <div key={book.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Link href={`/books/${book.id}`} className="font-medium text-gray-900 hover:text-teal-600 flex items-center gap-1.5">
                        {book.format === 'AUDIOBOOK' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {book.title}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {book.author} &middot; {book.genre || 'No genre'} &middot; {book.isFree ? 'Free' : `$${book.price}`}
                        {book.format === 'AUDIOBOOK' && <> &middot; {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''}</>}
                      </div>
                    </div>
                  </div>

                  {book.format === 'AUDIOBOOK' && (
                    <>
                      <button
                        onClick={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
                        className="mt-1 text-xs text-gray-500 hover:text-teal-600 flex items-center gap-1"
                      >
                        {expandedBookId === book.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        Manage chapters
                      </button>

                      {expandedBookId === book.id && (
                        <div className="mt-3 space-y-3">
                          {book.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map((chapter) => (
                            <div key={chapter.id} className="border border-gray-200 rounded-md p-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900">#{chapter.chapterNumber} {chapter.title}</span>
                              </div>
                              {chapter.processingStatus === 'READY' && chapter.audioUrl ? (
                                <audio controls src={chapter.audioUrl} className="w-full h-9 mt-1" />
                              ) : chapter.processingStatus === 'ERRORED' ? (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> Processing failed
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-1">
                                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Processing...
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="border border-dashed border-gray-300 rounded-md p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                              <UploadCloud className="w-3.5 h-3.5" /> Add a chapter
                            </div>
                            <input
                              type="file"
                              accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-flac"
                              onChange={(e) => setChapterUploads((prev) => ({ ...prev, [book.id]: { ...upload, file: e.target.files?.[0] || null } }))}
                              className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                placeholder="#"
                                value={upload.chapterNumber}
                                onChange={(e) => setChapterUploads((prev) => ({ ...prev, [book.id]: { ...upload, chapterNumber: e.target.value } }))}
                                className="w-16 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Chapter title"
                                value={upload.title}
                                onChange={(e) => setChapterUploads((prev) => ({ ...prev, [book.id]: { ...upload, title: e.target.value } }))}
                                className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                              />
                            </div>
                            {upload.error && <div className="text-xs text-red-600">{upload.error}</div>}
                            <button
                              onClick={() => uploadChapter(book.id)}
                              disabled={upload.isUploading || !upload.file || !upload.title.trim() || !upload.chapterNumber}
                              className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-teal-700 disabled:opacity-50"
                            >
                              {upload.isUploading && <Loader2 className="w-3 h-3 animate-spin" />}
                              {upload.isUploading ? 'Uploading...' : 'Upload Chapter'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
