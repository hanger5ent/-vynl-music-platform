// Base types
export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  isArtist?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Track {
  id: string
  title: string
  description?: string | null
  audioUrl: string
  coverUrl?: string | null
  price?: number | null
  isFree: boolean
  genre?: string | null
  duration?: number | null
  ownerId: string
  albumId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Album {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Playlist {
  id: string
  name: string
  description?: string | null
  isPublic: boolean
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface ArtistProfile {
  id: string
  userId: string
  bio?: string | null
  genre?: string | null
  website?: string | null
  socialLinks?: Record<string, string>
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Extended types with relations
export interface UserWithProfile extends User {
  artistProfile?: ArtistProfile
  _count?: {
    followers: number
    following: number
    tracks: number
    albums: number
  }
}

export interface TrackWithDetails extends Track {
  owner: UserWithProfile
  album?: Album
  likes: { id: string }[]
  comments: { id: string }[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface AlbumWithDetails extends Album {
  owner: UserWithProfile
  tracks: TrackWithDetails[]
  _count?: {
    likes: number
    tracks: number
  }
}

export interface PlaylistWithDetails extends Playlist {
  owner: UserWithProfile
  tracks: {
    track: TrackWithDetails
    position: number
  }[]
  _count?: {
    tracks: number
    likes: number
  }
}

// Audio player types
export interface PlayerState {
  currentTrack: TrackWithDetails | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: TrackWithDetails[]
  currentIndex: number
  isRepeat: boolean
  isShuffle: boolean
}

// Commerce types
export interface Purchase {
  id: string
  userId: string
  trackId?: string | null
  albumId?: string | null
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseWithDetails extends Purchase {
  track?: TrackWithDetails
  album?: AlbumWithDetails
  user: UserWithProfile
}

// Community types
export interface ForumPost {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export interface ForumComment {
  id: string
  content: string
  authorId: string
  postId: string
  createdAt: Date
  updatedAt: Date
}

export interface ForumPostWithDetails extends ForumPost {
  author: UserWithProfile
  comments: ForumCommentWithDetails[]
  _count?: {
    comments: number
  }
}

export interface ForumCommentWithDetails extends ForumComment {
  author: UserWithProfile
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Search types
export interface SearchResults {
  tracks: TrackWithDetails[]
  albums: AlbumWithDetails[]
  artists: UserWithProfile[]
  playlists: PlaylistWithDetails[]
}

// Upload types
export interface UploadProgress {
  percentage: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  message?: string
}

// Notification types
export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'purchase' | 'release'
  message: string
  read: boolean
  createdAt: Date
  userId: string
  relatedId?: string
}

// Analytics types
export interface ArtistAnalytics {
  totalStreams: number
  totalRevenue: number
  monthlyStreams: { month: string; streams: number }[]
  topTracks: { track: TrackWithDetails; streams: number }[]
  fanDemographics: { country: string; percentage: number }[]
}

// Form types
export interface TrackUploadForm {
  title: string
  description?: string
  genre?: string
  tags: string[]
  price?: number
  isFree: boolean
  audioFile: File
  coverImage?: File
  lyrics?: string
}

// Product/Store types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'music' | 'merchandise' | 'tickets' | 'digital'
  artistId: string
  artistName: string
  inStock: boolean
  createdAt: Date
}
