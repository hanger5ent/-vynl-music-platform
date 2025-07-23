import { Music, Users, TrendingUp, Play, Heart, Share2, Search, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 -mt-16">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            The Future of
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music Streaming
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Discover, stream, and support artists directly. A platform that puts creators first 
            with direct-to-consumer sales and powerful community features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/discover"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-center font-medium"
            >
              Start Discovering
            </Link>
            <Link 
              href="/for-artists"
              className="px-8 py-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-center font-medium"
            >
              For Artists
            </Link>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/discover"
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <Search className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Discover Music</h3>
              <p className="text-white/70 text-sm">Find your next favorite track or artist</p>
            </Link>
            <Link 
              href="/community"
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Join Community</h3>
              <p className="text-white/70 text-sm">Connect with artists and fellow fans</p>
            </Link>
            <Link 
              href="/artists"
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <Music className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Browse Artists</h3>
              <p className="text-white/70 text-sm">Explore talented creators and their work</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose VYNL?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Direct-to-Consumer</h3>
              <p className="text-white/80">
                Artists sell directly to fans with transparent pricing and instant payouts. No middlemen, just music.
              </p>
              <Link href="/for-artists" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-3">
                Learn more <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Vibrant Community</h3>
              <p className="text-white/80">
                Connect with fellow music lovers, follow your favorite artists, and discover new sounds together.
              </p>
              <Link href="/community" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3">
                Join community <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Powerful Discovery</h3>
              <p className="text-white/80">
                Advanced algorithms and curated playlists help you find exactly what you&apos;re looking for and more.
              </p>
              <Link href="/discover" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mt-3">
                Start discovering <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Featured Tracks
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all group">
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">Sample Track {i}</h3>
                <p className="text-white/60 text-sm mb-3">Artist Name</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-medium">$2.99</span>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-white/20 rounded">
                      <Heart className="w-4 h-4 text-white/60" />
                    </button>
                    <button className="p-1 hover:bg-white/20 rounded">
                      <Share2 className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Music Experience?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of artists and fans who are already building the future of music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/discover"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-center font-medium"
            >
              Start Your Journey
            </Link>
            <Link 
              href="/community"
              className="px-8 py-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-center font-medium"
            >
              Join Community
            </Link>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center gap-6 text-white/60">
            <Link href="/artists" className="hover:text-white transition-colors">
              Browse Artists
            </Link>
            <Link href="/for-artists" className="hover:text-white transition-colors">
              For Artists
            </Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
