'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Users, Menu, X, MessageCircle, ImageIcon, Sparkles, LayoutDashboard, Bell, Settings, LogOut, User, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { href: '/memories', label: 'Memories', icon: <ImageIcon className="w-4 h-4" /> },
    { href: '/calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { href: '/games', label: 'Games', icon: <Sparkles className="w-4 h-4" /> },
  ]

  const userMenuItems = [
    { href: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative flex items-center justify-between h-16 px-6 transition-all duration-500 rounded-2xl ${scrolled ? 'glass shadow-glass-lg' : 'glass'}`}>
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="group flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-gradient-primary rounded-xl shadow-glow-primary"
                >
                  <Heart className="w-6 h-6 text-white fill-white" />
                </motion.div>
                <span className="text-2xl font-black gradient-text">SoulLink</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
              {user && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group ${pathname === link.href
                      ? 'text-white shadow-glow-primary'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 glass-dark rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all relative"
                  >
                    <Bell className="w-5 h-5 text-white/80" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </motion.button>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 p-3 glass rounded-xl hover:shadow-glow-primary transition-all"
                    >
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-white hidden xl:block">{user.name}</span>
                    </motion.button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl p-2 shadow-glass-lg"
                        >
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${user.modeDefault === 'love'
                                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                {user.modeDefault === 'love' ? (
                                  <>
                                    <Heart className="w-3 h-3 mr-1 fill-current" />
                                    Love Mode
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-3 h-3 mr-1" />
                                    Friend Mode
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button
                              onClick={() => {
                                logout()
                                setUserMenuOpen(false)
                              }}
                              className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 text-white/80 font-bold hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-primary rounded-xl font-bold text-white hover:shadow-glow-primary transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 glass rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[95] w-80 glass-dark backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-primary rounded-xl">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-black gradient-text">SoulLink</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 glass rounded-xl"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="px-6 py-4 border-b border-white/10 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-2 px-6">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${pathname === link.href
                                ? 'glass text-white shadow-glow-primary'
                                : 'text-white/80 hover:text-white hover:bg-white/5'
                              }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {link.icon}
                            <span className="font-medium">{link.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* User Menu Items */}
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-2 px-6">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 p-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-6 space-y-4">
                      <Link
                        href="/login"
                        className="block w-full p-4 glass rounded-xl text-center font-bold text-white hover:shadow-glow-primary transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full p-4 bg-gradient-primary rounded-xl text-center font-bold text-white hover:shadow-glow-primary transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {user && (
                  <div className="p-6 border-t border-white/10">
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 w-full p-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
