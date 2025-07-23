'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export function UserDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          {session.user.avatar ? (
            <img
              src={session.user.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </span>
          )}
        </div>
        <span>{session.user.name || session.user.email}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>

          {session.user.isArtist && (
            <Link
              href="/artist"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Artist Dashboard
            </Link>
          )}

          {/* Admin Link - Check if user is admin */}
          {(() => {
            const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
            return adminEmails.includes(session?.user?.email || '')
          })() && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              onClick={() => setIsOpen(false)}
            >
              🛡️ Admin Dashboard
            </Link>
          )}

          <hr className="my-1" />
          
          <button
            onClick={() => {
              setIsOpen(false)
              signOut({ callbackUrl: '/' })
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
