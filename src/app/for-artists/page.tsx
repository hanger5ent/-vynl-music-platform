import { Metadata } from 'next'
import Link from 'next/link'
import { Music, DollarSign, Users, TrendingUp, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Artists - Vynl',
  description: 'Join the premier invite-only music streaming platform. Connect directly with fans and keep more of your revenue.',
}

export default function ForArtistsPage() {
  const features = [
    {
      icon: DollarSign,
      title: 'Keep More Revenue',
      description: 'Direct-to-consumer sales mean you keep 85-90% of your earnings, not the industry standard 10-15%.',
    },
    {
      icon: Users,
      title: 'Build Real Connections',
      description: 'Connect directly with your fans through our community features, live events, and personal messaging.',
    },
    {
      icon: TrendingUp,
      title: 'Powerful Analytics',
      description: 'Understand your audience with detailed insights about listening patterns, demographics, and engagement.',
    },
    {
      icon: Shield,
      title: 'Invite-Only Quality',
      description: 'Our curated community ensures higher engagement and more dedicated fans for your music.',
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'High-quality streaming, lossless audio options, and premium presentation for your content.',
    },
    {
      icon: Music,
      title: 'Full Creative Control',
      description: 'Upload unlimited tracks, set your own prices, and maintain complete ownership of your content.',
    },
  ]

  const steps = [
    {
      step: 1,
      title: 'Request an Invitation',
      description: 'Apply for creator access through our invite system. Tell us about your music and vision.',
    },
    {
      step: 2,
      title: 'Get Verified',
      description: 'Our team reviews applications to maintain platform quality and ensure artist authenticity.',
    },
    {
      step: 3,
      title: 'Create Your Profile',
      description: 'Set up your artist profile, upload your music, and customize your storefront.',
    },
    {
      step: 4,
      title: 'Start Earning',
      description: 'Begin selling directly to fans and building your community on the platform.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Music,
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Revenue
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Join the exclusive community where artists keep more, earn more, and connect deeper with their fans.
              No middlemen, just pure artist-to-fan relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/creator/apply"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-center"
              >
                Apply for Creator Access
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">85-90%</div>
              <p className="text-gray-600">Revenue kept by artists</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">$2.5M+</div>
              <p className="text-gray-600">Paid directly to artists</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">50K+</div>
              <p className="text-gray-600">Active music fans</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Verified artists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Artists Choose Vynl
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We've built a platform that puts artists first, with features designed to help you succeed
              in the modern music industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Join Vynl
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our invite-only system ensures quality and helps us maintain a premium experience for both artists and fans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mt-4 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Artists Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  LW
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Luna Waves</h4>
                  <p className="text-gray-600 text-sm">Electronic Artist</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Vynl changed everything for me. I'm finally earning what my music is worth and connecting with fans who truly appreciate my art."
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Midnight Collective</h4>
                  <p className="text-gray-600 text-sm">Indie Rock Band</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The quality of fans on Vynl is incredible. They actually buy our music and engage with our content. It's a real community."
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sofia Melodic</h4>
                  <p className="text-gray-600 text-sm">Singer-Songwriter</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The analytics are amazing. I understand my audience better than ever, and the direct relationship with fans is priceless."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="apply" className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Music Career?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join the exclusive community of artists who are already building the future of music.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">Application Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Original music content</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Active social media presence</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Professional music production</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Commitment to community</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-white/80">
              Applications are reviewed by our team. We'll get back to you within 5-7 business days.
            </p>
            <Link
              href="/creator/apply"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Apply for Creator Access
            </Link>
            <p className="text-sm text-white/60">
              Already have an account? <Link href="/creator/apply" className="text-white underline">Apply here</Link> for creator access.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
