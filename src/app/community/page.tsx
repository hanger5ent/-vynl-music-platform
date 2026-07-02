'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageCircle, Plus, X, Loader2 } from 'lucide-react'

interface CommunityPost {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string
    avatar: string | null
    isCreator: boolean
  }
  _count: {
    comments: number
  }
}

const CATEGORIES = ['all', 'general', 'rock', 'electronic', 'hip-hop', 'pop', 'indie', 'production', 'gear']

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [category, setCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })

  const fetchPosts = useCallback(async (activeCategory: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.set('category', activeCategory)
      const res = await fetch(`/api/community/posts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError('Could not load community posts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(category)
  }, [category, fetchPosts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create post')

      setForm({ title: '', content: '', category: 'general' })
      setShowComposer(false)
      await fetchPosts(category)
    } catch (err) {
      setError('Could not create your post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-500 mt-1">Talk music, gear, and everything in between.</p>
          </div>
          {session ? (
            <button
              onClick={() => setShowComposer((v) => !v)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showComposer ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showComposer ? 'Cancel' : 'New Post'}
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign in to post
            </Link>
          )}
        </div>

        {showComposer && session && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={200}
              required
            />
            <textarea
              placeholder="What's on your mind?"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <div className="flex items-center justify-between">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Post
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No posts yet in this category.</p>
            {session && <p className="text-sm mt-1">Be the first to start a conversation.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{post.category}</span>
                  <span>&middot;</span>
                  <span>{post.author.name || post.author.username}</span>
                  {post.author.isCreator && (
                    <span className="text-purple-600 font-medium">Creator</span>
                  )}
                  <span>&middot;</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                <p className="text-gray-600 mt-1 line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-3">
                  <MessageCircle className="w-4 h-4" />
                  {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
