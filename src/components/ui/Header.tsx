'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, Music } from 'lucide-react'
import { UserDropdown } from '@/components/auth/UserDropdown'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

export function Header() {
  const { data: session, status } = useSession()
  const { getTotalItems, setIsOpen } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                VYNL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/discover" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Discover
            </Link>
            <Link href="/artists" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Artists
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Community
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button - show for authenticated users */}
            {session?.user && (
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session?.user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {session?.user && (
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/discover" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link 
                href="/artists" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artists
              </Link>
              <Link 
                href="/community" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Community
              </Link>
              
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-2"></div>
              ) : session?.user ? (
                <div className="px-2">
                  <UserDropdown />
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-2">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
