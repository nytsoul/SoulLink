'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Bell, Shield, Palette, Moon, Globe, Heart, Users } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
            <span className="text-white font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Your Profile</span>
          </h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-2xl p-8 mb-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full border ${
                    user.modeDefault === 'love' 
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {user.modeDefault === 'love' ? (
                      <>
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Love Mode
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Friend Mode
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-4 py-3 glass rounded-xl text-white bg-white/5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 glass rounded-xl text-white bg-white/5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <button className="px-6 py-3 bg-gradient-primary rounded-xl font-bold text-white hover:shadow-glow-primary transition-all hover:scale-105">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Account Actions */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-all"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Account Settings</span>
                </Link>
                
                <Link
                  href="/verification"
                  className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-all"
                >
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Verification</span>
                </Link>
                
                <button className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-all w-full text-left">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Notifications</span>
                </button>
                
                <button className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-all w-full text-left">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Customize Theme</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Profile Views</span>
                  <span className="font-bold text-white">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Connections</span>
                  <span className="font-bold text-white">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Messages Sent</span>
                  <span className="font-bold text-white">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="font-bold text-green-400">85%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}