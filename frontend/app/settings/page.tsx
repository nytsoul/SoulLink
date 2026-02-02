'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Bell, Shield, Palette, Moon, Sun, Globe,
  Lock, Eye, EyeOff, Heart, Users, Smartphone, Mail
} from 'lucide-react'

interface SettingItem {
  title: string
  description: string
  icon?: React.ReactNode
  action: 'toggle' | 'button' | 'select' | 'status'
  value?: boolean | string
  options?: string[]
  onChange?: (val: any) => void
}

interface SettingSection {
  title: string
  icon: React.ReactNode
  settings: SettingItem[]
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    events: false,
    marketing: false
  })

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
            <span className="text-white font-medium">Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const settingSections: SettingSection[] = [
    {
      title: 'Account & Security',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          title: 'Change Password',
          description: 'Update your password to keep your account secure',
          icon: <Lock className="w-5 h-5" />,
          action: 'button'
        },
        {
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          icon: <Smartphone className="w-5 h-5" />,
          action: 'toggle',
          value: false
        },
        {
          title: 'Email Verification',
          description: 'Verify your email address for account security',
          icon: <Mail className="w-5 h-5" />,
          action: 'status',
          value: user.isEmailVerified || false
        }
      ]
    },
    {
      title: 'Privacy & Visibility',
      icon: <Eye className="w-5 h-5" />,
      settings: [
        {
          title: 'Profile Visibility',
          description: 'Control who can see your profile',
          icon: <Eye className="w-5 h-5" />,
          action: 'select',
          options: ['Everyone', 'Matches Only', 'Nobody'],
          value: 'Everyone'
        },
        {
          title: 'Show Online Status',
          description: 'Let others know when you\'re active',
          icon: <Globe className="w-5 h-5" />,
          action: 'toggle',
          value: true
        }
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          title: 'New Matches',
          description: 'Get notified when you have new matches',
          action: 'toggle',
          value: notifications.matches,
          onChange: (val: boolean) => setNotifications(prev => ({ ...prev, matches: val }))
        },
        {
          title: 'New Messages',
          description: 'Get notified about new messages',
          action: 'toggle',
          value: notifications.messages,
          onChange: (val: boolean) => setNotifications(prev => ({ ...prev, messages: val }))
        },
        {
          title: 'Events & Updates',
          description: 'Get notified about events and platform updates',
          action: 'toggle',
          value: notifications.events,
          onChange: (val: boolean) => setNotifications(prev => ({ ...prev, events: val }))
        },
        {
          title: 'Marketing Emails',
          description: 'Receive promotional emails and tips',
          action: 'toggle',
          value: notifications.marketing,
          onChange: (val: boolean) => setNotifications(prev => ({ ...prev, marketing: val }))
        }
      ]
    },
    {
      title: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          title: 'Dark Mode',
          description: 'Use dark theme for better night viewing',
          icon: darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
          action: 'toggle',
          value: darkMode,
          onChange: (val: boolean) => setDarkMode(val)
        }
      ]
    }
  ]

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
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-gray-400">Customize your SoulLink experience</p>
        </motion.div>

        {/* Current Mode Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Current Mode</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${user.modeDefault === 'love'
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-blue-500/20 text-blue-400'
                }`}>
                {user.modeDefault === 'love' ? (
                  <Heart className="w-6 h-6 fill-current" />
                ) : (
                  <Users className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {user.modeDefault === 'love' ? 'Love Mode' : 'Friend Mode'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {user.modeDefault === 'love'
                    ? 'Finding romantic connections'
                    : 'Building meaningful friendships'
                  }
                </p>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
              Active
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Mode is locked after registration. Contact support if you need to change it.
            </p>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                {section.icon}
                <span className="ml-2">{section.title}</span>
              </h2>

              <div className="space-y-4">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex items-start space-x-3 flex-1">
                      {setting.icon && (
                        <div className="p-2 glass rounded-lg mt-1">
                          {setting.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{setting.title}</h3>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                    </div>

                    <div className="ml-4">
                      {setting.action === 'toggle' && (
                        <button
                          onClick={() => setting.onChange?.(!(setting.value as boolean))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value ? 'bg-pink-500' : 'bg-gray-600'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      )}

                      {setting.action === 'button' && (
                        <button className="px-4 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all">
                          Configure
                        </button>
                      )}

                      {setting.action === 'select' && (
                        <select className="px-3 py-2 glass rounded-lg text-white text-sm bg-transparent">
                          {setting.options?.map((option) => (
                            <option key={option} value={option} className="bg-dark-900">
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {setting.action === 'status' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${setting.value
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {setting.value ? 'Verified' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 glass rounded-2xl p-6 border border-red-500/30"
        >
          <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-bold text-white">Delete Account</h3>
                <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}