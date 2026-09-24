'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

interface Application {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  artistName: string
  createdAt: string
  reviewNote: string | null
}

export default function CreatorApplicationPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [latestApplication, setLatestApplication] = useState<Application | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    artistName: '',
    genre: '',
    bio: '',
    socialLinks: {
      spotify: '',
      youtube: '',
      instagram: '',
      website: '',
    },
    musicSamples: '',
    experienceLevel: 'emerging',
    goals: '',
    hasOriginalMusic: false,
    hasProfessionalRecordings: false,
    agreesToTerms: false,
  })

  const fetchStatus = useCallback(async () => {
    setCheckingStatus(true)
    try {
      const res = await fetch('/api/creator/applications')
      if (res.ok) {
        const data = await res.json()
        setLatestApplication(data.applications?.[0] || null)
      }
    } finally {
      setCheckingStatus(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchStatus()
    else setCheckingStatus(false)
  }, [session?.user, fetchStatus])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as Record<string, any>)[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.hasOriginalMusic || !formData.hasProfessionalRecordings || !formData.agreesToTerms) {
      toast.error('Please complete all required fields and agreements')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/creator/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: formData.artistName,
          genre: formData.genre,
          bio: formData.bio,
          socialLinks: formData.socialLinks,
          musicSamples: formData.musicSamples,
          experienceLevel: formData.experienceLevel,
          goals: formData.goals || undefined,
          hasOriginalMusic: formData.hasOriginalMusic,
          hasProfessionalRecordings: formData.hasProfessionalRecordings,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit application')
        return
      }

      setJustSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionStatus === 'loading' || checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">You need to sign in to apply for creator access.</p>
            <a
              href="/auth/signin"
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Sign In
            </a>
          </div>
        </Card>
      </div>
    )
  }

  if (session.user.isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="p-8 text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;re already a creator!</h2>
            <a
              href="/creator"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
            >
              Go to Creator Dashboard
            </a>
          </div>
        </Card>
      </div>
    )
  }

  if (justSubmitted || latestApplication?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <div className="p-8 text-center">
              <Clock className="w-16 h-16 text-purple-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in becoming a Vynl creator. We&apos;ve received your application
                and our team will review it soon. You&apos;ll receive an email with our decision.
              </p>
              <div className="space-y-3">
                <a
                  href="/dashboard"
                  className="block w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/discover"
                  className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Explore Music
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Creator Application</h1>
          <p className="text-gray-600">
            Join Vynl&apos;s exclusive community of artists and creators. Fill out this application
            to be considered for creator access.
          </p>
        </div>

        {latestApplication?.status === 'REJECTED' && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">Your previous application wasn&apos;t approved</p>
              {latestApplication.reviewNote && (
                <p className="text-sm text-orange-800 mt-1">{latestApplication.reviewNote}</p>
              )}
              <p className="text-sm text-orange-700 mt-1">You&apos;re welcome to apply again below.</p>
            </div>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist/Stage Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.artistName}
                    onChange={(e) => handleInputChange('artistName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your artist or stage name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Genre *
                  </label>
                  <select
                    required
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a genre</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="electronic">Electronic</option>
                    <option value="indie">Indie</option>
                    <option value="folk">Folk</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Bio *
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us about your music, background, and artistic vision..."
                />
              </div>
            </section>

            {/* Social Media & Online Presence */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Online Presence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spotify Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.spotify}
                    onChange={(e) => handleInputChange('socialLinks.spotify', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </section>

            {/* Music & Experience */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music & Experience</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Music Samples/Portfolio *
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    value={formData.musicSamples}
                    onChange={(e) => handleInputChange('musicSamples', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Share links to your best tracks (SoundCloud, YouTube, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="emerging">Emerging Artist</option>
                    <option value="developing">Developing Artist</option>
                    <option value="established">Established Artist</option>
                    <option value="professional">Professional Artist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goals on Vynl
                  </label>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What do you hope to achieve on Vynl? How do you plan to engage with fans?"
                  />
                </div>
              </div>
            </section>

            {/* Requirements & Agreements */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.hasOriginalMusic}
                    onChange={(e) => handleInputChange('hasOriginalMusic', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I create and own original music content *
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.hasProfessionalRecordings}
                    onChange={(e) => handleInputChange('hasProfessionalRecordings', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I have professional quality recordings ready to upload *
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreesToTerms}
                    onChange={(e) => handleInputChange('agreesToTerms', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I agree to Vynl&apos;s Terms of Service and Community Guidelines *
                  </span>
                </label>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Submitting Application...' : 'Submit Creator Application'}
              </button>
              <p className="mt-3 text-sm text-gray-500 text-center">
                You&apos;ll receive an email once our team has reviewed your application.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
