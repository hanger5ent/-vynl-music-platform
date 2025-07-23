'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Play, 
  Music, 
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Plus,
  Bell,
  Settings,
  Search,
  Filter,
  Clock,
  Eye
} from 'lucide-react'

interface Post {
  id: string
  type: 'track' | 'text' | 'event' | 'milestone'
  author: {
    name: string
    avatar: string
    isVerified: boolean
    type: 'artist' | 'fan'
  }
  content: string
  track?: {
    title: string
    duration: string
    price: number
  }
  event?: {
    title: string
    date: string
    location: string
    type: 'concert' | 'livestream' | 'meetup'
  }
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
}

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  posts: number
  category: string
  image: string
  isJoined: boolean
}

interface Event {
  id: string
  title: string
  artist: string
  date: string
  time: string
  type: 'concert' | 'livestream' | 'meetup'
  location?: string
  price?: number
  attendees: number
  isAttending: boolean
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'feed' | 'communities' | 'events'>('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockPosts: Post[] = [
      {
        id: '1',
        type: 'track',
        author: {
          name: 'Neon Nights',
          avatar: '/api/placeholder/40/40',
          isVerified: true,
          type: 'artist'
        },
        content: 'Just dropped my latest synthwave masterpiece! What do you think? 🎵✨',
        track: {
          title: 'Midnight Drive',
          duration: '4:32',
          price: 2.99
        },
        timestamp: '2 hours ago',
        likes: 124,
        comments: 18,
        shares: 7,
        isLiked: false
      },
      {
        id: '2',
        type: 'text',
        author: {
          name: 'Sarah M.',
          avatar: '/api/placeholder/40/40',
          isVerified: false,
          type: 'fan'
        },
        content: 'The energy at last night\'s virtual concert was absolutely incredible! Thank you @ElectroWaves for an amazing show 🔥',
        timestamp: '4 hours ago',
        likes: 89,
        comments: 12,
        shares: 3,
        isLiked: true
      },
      {
        id: '3',
        type: 'event',
        author: {
          name: 'Synthwave Collective',
          avatar: '/api/placeholder/40/40',
          isVerified: true,
          type: 'artist'
        },
        content: 'Join us for an exclusive livestream session this Friday!',
        event: {
          title: 'Exclusive Livestream',
          date: 'Dec 29, 2024',
          location: 'Virtual',
          type: 'livestream'
        },
        timestamp: '6 hours ago',
        likes: 256,
        comments: 45,
        shares: 23,
        isLiked: false
      },
      {
        id: '4',
        type: 'milestone',
        author: {
          name: 'Cyber Artist',
          avatar: '/api/placeholder/40/40',
          isVerified: true,
          type: 'artist'
        },
        content: '🎉 Just hit 10K followers! Thank you all for the incredible support. Special surprise coming soon...',
        timestamp: '1 day ago',
        likes: 342,
        comments: 67,
        shares: 18,
        isLiked: true
      }
    ]

    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'Synthwave Enthusiasts',
        description: 'Everything synthwave - from classics to new discoveries',
        memberCount: 15420,
        posts: 1240,
        category: 'Genre',
        image: '/api/placeholder/100/100',
        isJoined: true
      },
      {
        id: '2',
        name: 'Electronic Music Producers',
        description: 'Tips, tricks, and collaboration for electronic music makers',
        memberCount: 8930,
        posts: 890,
        category: 'Production',
        image: '/api/placeholder/100/100',
        isJoined: false
      },
      {
        id: '3',
        name: 'Concert Meetups',
        description: 'Find people to attend concerts and events with',
        memberCount: 12600,
        posts: 450,
        category: 'Events',
        image: '/api/placeholder/100/100',
        isJoined: true
      },
      {
        id: '4',
        name: 'New Artist Spotlight',
        description: 'Discover and support emerging artists',
        memberCount: 6780,
        posts: 320,
        category: 'Discovery',
        image: '/api/placeholder/100/100',
        isJoined: false
      }
    ]

    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Synthwave Live Stream',
        artist: 'Neon Nights',
        date: 'Dec 29',
        time: '8:00 PM EST',
        type: 'livestream',
        attendees: 234,
        isAttending: false
      },
      {
        id: '2',
        title: 'Electronic Music Festival',
        artist: 'Various Artists',
        date: 'Jan 15',
        time: '6:00 PM EST',
        type: 'concert',
        location: 'Virtual Arena',
        price: 15.99,
        attendees: 1240,
        isAttending: true
      },
      {
        id: '3',
        title: 'Producer Meetup',
        artist: 'Community Event',
        date: 'Jan 8',
        time: '3:00 PM EST',
        type: 'meetup',
        location: 'Discord',
        attendees: 67,
        isAttending: false
      }
    ]

    setPosts(mockPosts)
    setCommunities(mockCommunities)
    setEvents(mockEvents)
  }, [])

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const joinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(community =>
      community.id === communityId
        ? { ...community, isJoined: !community.isJoined, memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1 }
        : community
    ))
  }

  const toggleEventAttendance = (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, isAttending: !event.isAttending, attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1 }
        : event
    ))
  }

  const handlePostSubmit = () => {
    if (!newPost.trim()) return

    const post: Post = {
      id: Date.now().toString(),
      type: 'text',
      author: {
        name: session?.user?.name || 'You',
        avatar: '/api/placeholder/40/40',
        isVerified: false,
        type: 'fan'
      },
      content: newPost,
      timestamp: 'just now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false
    }

    setPosts(prev => [post, ...prev])
    setNewPost('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Connect with artists and fans, discover events, and join the conversation</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'feed', label: 'Feed', icon: TrendingUp },
              { id: 'communities', label: 'Communities', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'feed' | 'communities' | 'events')}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Post */}
            {session && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share something with the community..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Music className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={handlePostSubmit}
                        disabled={!newPost.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      {post.author.isVerified && (
                        <div className="bg-blue-500 rounded-full p-1">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.author.type === 'artist' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.author.type}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{post.timestamp}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 mb-3">{post.content}</p>

                  {/* Track Attachment */}
                  {post.track && (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{post.track.title}</h4>
                        <p className="text-gray-600 text-sm">{post.track.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${post.track.price}</p>
                        <button className="text-purple-600 hover:text-purple-700 text-sm">Buy</button>
                      </div>
                    </div>
                  )}

                  {/* Event Attachment */}
                  {post.event && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-600 font-medium text-sm">{post.event.type.toUpperCase()}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{post.event.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{post.event.date}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {post.event.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 text-sm ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-500">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500">
                      <Share2 className="h-4 w-4" />
                      {post.shares}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Communities Tab */}
        {activeTab === 'communities' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Create Community
                </button>
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <div key={community.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {community.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{community.description}</p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>{community.memberCount.toLocaleString()} members</span>
                    <span>{community.posts} posts</span>
                  </div>

                  <button
                    onClick={() => joinCommunity(community.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      community.isJoined
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {community.isJoined ? 'Joined' : 'Join Community'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-gray-400" />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>All Events</option>
                  <option>Concerts</option>
                  <option>Livestreams</option>
                  <option>Meetups</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>All Time</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Next Month</option>
                </select>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.type === 'concert' ? 'bg-red-100 text-red-700' :
                          event.type === 'livestream' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {event.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-gray-600 mb-2">by {event.artist}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.date} at {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {event.price && (
                        <p className="text-lg font-bold text-gray-900 mb-2">${event.price}</p>
                      )}
                      <button
                        onClick={() => toggleEventAttendance(event.id)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          event.isAttending
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {event.isAttending ? 'Attending' : 'Attend'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
