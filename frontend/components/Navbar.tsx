'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Users, Menu, X, MessageCircle, Image, Sparkles, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { href: '/memories', label: 'Memories', icon: <Image className="w-4 h-4" /> },
    { href: '/games', label: 'Games', icon: <Sparkles className="w-4 h-4" /> },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className={`relative flex items-center justify-between h-16 px-8 transition-all duration-500 rounded-full border border-white/10 ${scrolled ? 'bg-black/60 backdrop-blur-xl shadow-2xl' : 'bg-white/5 backdrop-blur-md'}`}>
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">SoulLink</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3 flex-1 justify-end">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white/80'
                      }`}
                  >
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.icon}</span>
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
                <div className="w-px h-6 bg-white/10 mx-3" />
                <button
                  onClick={logout}
                  className="px-6 py-2 bg-white text-black rounded-full font-black text-sm hover:bg-pink-500 hover:text-white transition-all shadow-lg active:scale-95 ml-2"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-white/60 font-bold hover:text-white transition-colors mr-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-2 bg-white text-black rounded-full font-black text-sm hover:shadow-2xl transition-all active:scale-95 ml-2"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center ml-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 mt-2 px-4"
          >
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-2">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${pathname === link.href ? 'bg-white/10 text-white' : 'text-white/40'
                        }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full mt-4 px-6 py-4 bg-pink-500 text-white rounded-2xl font-black text-center"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 text-white/60 font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 bg-white text-black rounded-2xl font-black text-center"
                  >
                    SIGN UP
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
