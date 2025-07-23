'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  HeartIcon, 
  UsersIcon, 
  ChatBubbleLeftEllipsisIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  CogIcon,
  StarIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  userType: 'fan' | 'creator' | 'admin'
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const fanNavigation = [
    { name: 'Dashboard', href: '/fan', icon: HomeIcon },
    { name: 'Liked Songs', href: '/fan/liked', icon: HeartIcon },
    { name: 'Community', href: '/fan/community', icon: UsersIcon },
    { name: 'Social Feed', href: '/fan/feed', icon: ChatBubbleLeftEllipsisIcon },
    { name: 'Events', href: '/fan/events', icon: CalendarDaysIcon },
    { name: 'Store', href: '/fan/store', icon: ShoppingBagIcon },
    { name: 'Artist Support', href: '/fan/support', icon: CurrencyDollarIcon },
    { name: 'Subscription', href: '/fan/subscription', icon: StarIcon },
  ]

  const creatorNavigation = [
    { name: 'Dashboard', href: '/creator', icon: HomeIcon },
    { name: 'Liked Songs', href: '/creator/liked', icon: HeartIcon },
    { name: 'Community', href: '/creator/community', icon: UsersIcon },
    { name: 'Social Feed', href: '/creator/feed', icon: ChatBubbleLeftEllipsisIcon },
    { name: 'Events', href: '/creator/events', icon: CalendarDaysIcon },
    { name: 'Store', href: '/creator/store', icon: ShoppingBagIcon },
    { name: 'Artist Support', href: '/creator/support', icon: CurrencyDollarIcon },
    { name: 'Creator Studio', href: '/creator/studio', icon: PlusCircleIcon },
    { name: 'Royalties', href: '/creator/royalties', icon: MusicalNoteIcon },
  ]

  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: CogIcon },
    ...creatorNavigation,
  ]

  const navigation = userType === 'admin' ? adminNavigation : 
                   userType === 'creator' ? creatorNavigation : fanNavigation

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-green-400">VYNL</h1>
      </div>
      
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Made for You section */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3">MADE FOR YOU</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/discover/weekly"
              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
            >
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                <MusicalNoteIcon className="w-4 h-4" />
              </div>
              Discover Weekly
            </Link>
          </li>
          <li>
            <Link
              href="/discover/daily"
              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
            >
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center mr-3">
                <HeartIcon className="w-4 h-4" />
              </div>
              Daily Mix
            </Link>
          </li>
        </ul>
      </div>

      {/* User info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {session?.user?.name?.[0] || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{userType}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
