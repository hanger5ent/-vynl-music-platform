// API client utilities for frontend integration
export class VynlApiClient {
  private baseUrl: string
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  // Helper method for making API requests
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Music API methods
  music = {
    // Get tracks with filtering
    getTracks: async (params: {
      genre?: string
      search?: string
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}) => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString())
      })
      
      return this.request(`/music/tracks?${searchParams}`)
    },

    // Get specific track
    getTrack: async (id: string) => {
      return this.request(`/music/tracks/${id}`)
    },

    // Record a play
    recordPlay: async (trackId: string, timestamp?: number, duration?: number) => {
      return this.request(`/music/tracks/${trackId}/play`, {
        method: 'POST',
        body: JSON.stringify({ timestamp, duration }),
      })
    },

    // Toggle like on track
    toggleLike: async (trackId: string) => {
      return this.request(`/music/tracks/${trackId}/like`, {
        method: 'POST',
      })
    },

    // Get like status
    getLikeStatus: async (trackId: string) => {
      return this.request(`/music/tracks/${trackId}/like`)
    },

    // Get track comments
    getComments: async (trackId: string, page = 1, limit = 10) => {
      return this.request(`/music/tracks/${trackId}/comments?page=${page}&limit=${limit}`)
    },

    // Add comment
    addComment: async (trackId: string, text: string, parentId?: string) => {
      return this.request(`/music/tracks/${trackId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text, parentId }),
      })
    },

    // Upload track
    uploadTrack: async (formData: FormData) => {
      return fetch(`${this.baseUrl}/music/upload`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    },

    // Create track record
    createTrack: async (trackData: {
      title: string
      description?: string
      genre?: string
      tags?: string[]
      price?: number
      audioUrl: string
      duration?: number
    }) => {
      return this.request('/music/tracks', {
        method: 'POST',
        body: JSON.stringify(trackData),
      })
    }
  }

  // Playlist API methods
  playlists = {
    // Get user's playlists
    getPlaylists: async () => {
      return this.request('/playlists')
    },

    // Get playlist details
    getPlaylist: async (id: string) => {
      return this.request(`/playlists/${id}`)
    },

    // Create playlist
    create: async (playlistData: {
      title: string
      description?: string
      isPublic?: boolean
      coverImage?: string
    }) => {
      return this.request('/playlists', {
        method: 'POST',
        body: JSON.stringify(playlistData),
      })
    },

    // Update playlist
    update: async (id: string, updates: any) => {
      return this.request(`/playlists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },

    // Delete playlist
    delete: async (id: string) => {
      return this.request(`/playlists/${id}`, {
        method: 'DELETE',
      })
    },

    // Add track to playlist
    addTrack: async (playlistId: string, trackId: string, position?: number) => {
      return this.request(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({ trackId, position }),
      })
    },

    // Remove track from playlist
    removeTrack: async (playlistId: string, trackId: string) => {
      return this.request(`/playlists/${playlistId}/tracks?trackId=${trackId}`, {
        method: 'DELETE',
      })
    },

    // Reorder tracks
    reorderTracks: async (playlistId: string, trackOrders: Array<{ trackId: string, position: number }>) => {
      return this.request(`/playlists/${playlistId}/tracks`, {
        method: 'PUT',
        body: JSON.stringify({ trackOrders }),
      })
    }
  }

  // Artist API methods
  artists = {
    // Get artist profile
    getArtist: async (id: string) => {
      return this.request(`/artists/${id}`)
    },

    // Update artist profile
    updateProfile: async (id: string, updates: any) => {
      return this.request(`/artists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },

    // Follow/unfollow artist
    toggleFollow: async (artistId: string, action: 'follow' | 'unfollow') => {
      return this.request(`/artists/${artistId}/follow`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
    },

    // Get follow status
    getFollowStatus: async (artistId: string) => {
      return this.request(`/artists/${artistId}/follow`)
    }
  }

  // Search API methods
  search = {
    // Universal search
    search: async (query: string, type: 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' = 'all', page = 1, limit = 20) => {
      const params = new URLSearchParams({
        q: query,
        type,
        page: page.toString(),
        limit: limit.toString()
      })
      
      return this.request(`/search?${params}`)
    }
  }

  // Analytics API methods
  analytics = {
    // Get analytics data
    getAnalytics: async (timeframe = '30d', userId?: string) => {
      const params = new URLSearchParams({ timeframe })
      if (userId) params.append('userId', userId)
      
      return this.request(`/analytics?${params}`)
    },

    // Track event
    trackEvent: async (event: string, properties: Record<string, any> = {}) => {
      return this.request('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({
          event,
          properties,
          timestamp: Date.now()
        }),
      })
    }
  }

  // File upload methods
  uploads = {
    // Upload file
    uploadFile: async (file: File, type: 'audio' | 'image' | 'avatar', entityId?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (entityId) formData.append('entityId', entityId)

      return fetch(`${this.baseUrl}/uploads`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    },

    // Get upload status
    getUploadStatus: async (uploadId: string) => {
      return this.request(`/uploads?uploadId=${uploadId}`)
    }
  }
}

// Create default instance
export const vynlApi = new VynlApiClient()

// React hooks for common operations
export const useVynlApi = () => {
  return vynlApi
}

// Utility functions
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatPlayCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return 'Free'
  return `$${price.toFixed(2)}`
}

// Type definitions for better TypeScript support
export interface Track {
  id: string
  title: string
  slug: string
  description?: string
  audioUrl: string
  duration: number
  genre?: string
  tags: string[]
  price: number | null
  isFree: boolean
  playCount: number
  likeCount: number
  createdAt: string
  owner: {
    id: string
    name: string
    username: string
    avatar?: string
  }
}

export interface Artist {
  id: string
  name: string
  username: string
  bio?: string
  avatar?: string
  isVerified: boolean
  followerCount: number
  trackCount: number
  genre?: string[]
}

export interface Playlist {
  id: string
  title: string
  description?: string
  coverImage?: string
  isPublic: boolean
  trackCount: number
  totalDuration: number
  likeCount: number
  createdAt: string
  owner: {
    id: string
    name: string
    username: string
  }
  tracks?: Track[]
}

export interface SearchResults {
  tracks?: Track[]
  artists?: Artist[]
  albums?: any[]
  playlists?: Playlist[]
}

export interface Analytics {
  overview: {
    totalPlays: number
    totalLikes: number
    totalFollowers: number
    totalRevenue: number
    growthMetrics: {
      playsGrowth: number
      likesGrowth: number
      followersGrowth: number
      revenueGrowth: number
    }
  }
  chartData: {
    plays: Array<{ date: string; value: number }>
    revenue: Array<{ date: string; value: number }>
  }
  topTracks: Array<{
    id: string
    title: string
    plays: number
    likes: number
    revenue: number
    growth: number
  }>
  demographics: {
    countries: Array<{ country: string; plays: number; percentage: number }>
    ageGroups: Array<{ range: string; plays: number; percentage: number }>
  }
}
