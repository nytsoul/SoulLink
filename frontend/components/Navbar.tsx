'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Users, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-primary-600">Loves</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/dashboard' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/matches"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/matches' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Matches
                </Link>
                <Link
                  href="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/chat' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  href="/memories"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/memories' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Memories
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </Link>
                <Link href="/matches" className="block px-3 py-2 rounded-md text-base font-medium">
                  Matches
                </Link>
                <Link href="/chat" className="block px-3 py-2 rounded-md text-base font-medium">
                  Chat
                </Link>
                <Link href="/memories" className="block px-3 py-2 rounded-md text-base font-medium">
                  Memories
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

