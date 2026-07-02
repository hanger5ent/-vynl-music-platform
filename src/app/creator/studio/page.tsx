'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Music, UploadCloud, Loader2, Play, ChevronDown, ChevronUp, Download, ShieldCheck } from 'lucide-react'
import { RoyaltySplitsManager } from '@/components/creator/RoyaltySplitsManager'

interface StudioTrack {
  id: string
  title: string
  genre: string | null
  duration: number
  price: string | null
  isFree: boolean
  playCount: number
  likeCount: number
  audioUrl: string
  isrc: string | null
  rightsAttested: boolean
  createdAt: string
}

function formatDuration(seconds: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CreatorStudioPage() {
  const { data: session, status } = useSession()
  const [tracks, setTracks] = useState<StudioTrack[]>([])
  const [isLoadingTracks, setIsLoadingTracks] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', genre: '', price: '', isrc: '' })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [rightsAttestation, setRightsAttestation] = useState(false)
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null)

  const fetchTracks = useCallback(async (ownerId: string) => {
    setIsLoadingTracks(true)
    try {
      const res = await fetch(`/api/music/tracks?ownerId=${ownerId}&sortBy=createdAt&sortOrder=desc`)
      if (!res.ok) throw new Error('Failed to load tracks')
      const data = await res.json()
      setTracks(data.tracks || [])
    } catch {
      setError('Could not load your tracks.')
    } finally {
      setIsLoadingTracks(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) fetchTracks(session.user.id)
  }, [session?.user?.id, fetchTracks])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !form.title.trim() || !rightsAttestation) return

    setIsUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('audio', audioFile)
      body.append('title', form.title)
      body.append('description', form.description)
      body.append('genre', form.genre)
      body.append('tags', JSON.stringify([]))
      if (form.price) body.append('price', form.price)
      if (form.isrc) body.append('isrc', form.isrc)
      body.append('rightsAttestation', 'true')

      const res = await fetch('/api/music/upload', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setForm({ title: '', description: '', genre: '', price: '', isrc: '' })
      setAudioFile(null)
      setRightsAttestation(false)
      if (session?.user?.id) await fetchTracks(session.user.id)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const recordPlay = (trackId: string) => {
    fetch(`/api/music/tracks/${trackId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
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
          <p className="text-gray-600 mb-4">You need creator access to upload tracks.</p>
          <Link href="/for-artists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Apply for Creator Access
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Creator Studio</h1>
        <p className="text-gray-500 mb-6">Upload tracks and manage what you've released.</p>

        <form onSubmit={handleUpload} className="bg-white rounded-lg border border-gray-200 p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-purple-600" /> Upload a track
          </h2>

          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-flac"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            required
          />

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Genre (optional)"
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price (blank = free)"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <input
            type="text"
            placeholder="ISRC (optional — needed for PRO royalty reporting)"
            value={form.isrc}
            onChange={(e) => setForm((f) => ({ ...f, isrc: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-md p-3">
            <input
              type="checkbox"
              checked={rightsAttestation}
              onChange={(e) => setRightsAttestation(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>
              I confirm I own this recording or have the rights/license to distribute it. Uploads aren&apos;t
              scanned automatically — this is a binding attestation, and misuse can result in takedown and
              account suspension.
            </span>
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isUploading || !rightsAttestation}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </form>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Your tracks</h2>
          <a
            href="/api/creator/royalty-report?format=csv"
            className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700"
          >
            <Download className="w-3.5 h-3.5" /> Royalty report (CSV)
          </a>
        </div>
        {isLoadingTracks ? (
          <div className="flex justify-center py-10 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Music className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No tracks yet. Upload your first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-1.5">
                      {track.title}
                      {track.rightsAttested && (
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" aria-label="Rights attested" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {track.genre || 'No genre'} &middot; {formatDuration(track.duration)} &middot; {track.playCount} plays &middot; {track.isFree ? 'Free' : `$${track.price}`}
                      {track.isrc && <> &middot; ISRC {track.isrc}</>}
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-gray-300" />
                </div>
                <audio
                  controls
                  src={track.audioUrl}
                  onPlay={() => recordPlay(track.id)}
                  className="w-full h-10"
                />
                <button
                  onClick={() => setExpandedTrackId(expandedTrackId === track.id ? null : track.id)}
                  className="mt-2 text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1"
                >
                  {expandedTrackId === track.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  Rights & royalty splits
                </button>
                {expandedTrackId === track.id && <RoyaltySplitsManager trackId={track.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
