'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Trash2, Reply } from 'lucide-react'

interface CommentUser {
  id: string
  name: string | null
  username: string
  avatar: string | null
}

interface CommentEntry {
  id: string
  text: string
  createdAt: string
  userId: string
  user: CommentUser
  replies: Omit<CommentEntry, 'replies'>[]
}

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function TrackComments({ trackId }: { trackId: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/music/tracks/${trackId}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      setError('Could not load comments.')
    } finally {
      setIsLoading(false)
    }
  }, [trackId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const postComment = async (text: string, parentId?: string) => {
    if (!text.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/music/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, parentId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not post comment')
        return
      }
      setNewComment('')
      setReplyText('')
      setReplyingTo(null)
      await fetchComments()
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/music/tracks/${trackId}/comments/${commentId}`, { method: 'DELETE' })
    await fetchComments()
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
      {isLoading ? (
        <div className="flex justify-center py-4 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="text-gray-500 mb-3">No comments yet.</p>
          ) : (
            <ul className="space-y-3 mb-3">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-900">{comment.user.name || comment.user.username}</span>
                      <span className="text-gray-400 text-xs ml-2">{timeAgo(comment.createdAt)}</span>
                      <p className="text-gray-700">{comment.text}</p>
                      {session?.user && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1 mt-0.5"
                        >
                          <Reply className="w-3 h-3" /> Reply
                        </button>
                      )}
                    </div>
                    {session?.user?.id === comment.userId && (
                      <button onClick={() => deleteComment(comment.id)} className="text-gray-300 hover:text-red-600 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {comment.replies.length > 0 && (
                    <ul className="mt-2 ml-4 pl-3 border-l-2 border-gray-100 space-y-2">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium text-gray-900">{reply.user.name || reply.user.username}</span>
                            <span className="text-gray-400 text-xs ml-2">{timeAgo(reply.createdAt)}</span>
                            <p className="text-gray-700">{reply.text}</p>
                          </div>
                          {session?.user?.id === reply.userId && (
                            <button onClick={() => deleteComment(reply.id)} className="text-gray-300 hover:text-red-600 shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {replyingTo === comment.id && (
                    <form
                      onSubmit={(e) => { e.preventDefault(); postComment(replyText, comment.id) }}
                      className="mt-2 ml-4 flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        maxLength={500}
                        autoFocus
                      />
                      <button type="submit" disabled={isSubmitting} className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50">
                        Post
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && <div className="text-red-600 mb-2">{error}</div>}

          {session?.user ? (
            <form onSubmit={(e) => { e.preventDefault(); postComment(newComment) }} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                Post
              </button>
            </form>
          ) : (
            <p className="text-gray-400 text-xs">Sign in to leave a comment.</p>
          )}
        </>
      )}
    </div>
  )
}
