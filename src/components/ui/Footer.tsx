'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Vynl</h3>
            <p className="text-gray-300 text-sm">
              The premier invite-only music streaming platform for artists and music lovers.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-md font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover" className="text-gray-300 hover:text-white">
                  Discover Music
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-gray-300 hover:text-white">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-white">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/for-artists" className="text-gray-300 hover:text-white">
                  For Creators
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-300 hover:text-white">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-md font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/dmca" className="text-gray-300 hover:text-white">
                  DMCA Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Vynl. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/legal/terms" className="text-gray-400 hover:text-white text-sm">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy
              </Link>
              <Link href="/legal/dmca" className="text-gray-400 hover:text-white text-sm">
                DMCA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
