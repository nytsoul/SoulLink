'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
  Heart, Users, Sparkles, Calendar, MessageCircle, ImageIcon, Shield, ArrowRight,
  TrendingUp, Star, Gift, Zap, Clock, MapPin, Activity, Settings, Bell, Search
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { motion } from 'framer-motion'

interface QuickActionProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  gradient: string
  delay?: number
}

function QuickActionCard({ icon, title, description, href, gradient, delay = 0 }: QuickActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <Link href={href} className="block">
        <div className={`relative p-6 glass rounded-2xl hover:shadow-glass-lg transition-all duration-300 overflow-hidden group`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
          <div className="relative z-10">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-gray-300 group-hover:text-gray-100 transition-colors text-sm">
              {description}
            </p>
            <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all mt-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function StatCard({ icon, label, value, change, changeType, delay = 0 }: {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 hover:shadow-glass-lg transition-all duration-300 hover:scale-105"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-primary rounded-xl">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${changeType === 'positive' ? 'text-green-400' :
              changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
            }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-black gradient-text mb-1">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </motion.div>
  )
}

function ActivityItem({ icon, title, time, status }: {
  icon: React.ReactNode
  title: string
  time: string
  status?: 'online' | 'offline' | 'away'
}) {
  return (
    <div className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-all">
      <div className="relative">
        <div className="p-2 bg-gradient-primary rounded-lg">
          {icon}
        </div>
        {status && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-400' :
              status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
            }`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const fetchStats = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      setLoading(true)

      // Fetch user stats with error handling for each endpoint
      const [chatsRes, memoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: { chats: [] } })),
        axios.get(`${API_URL}/api/memories`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: { memories: [] } })),
      ])

      setStats({
        matches: Math.floor(Math.random() * 50) + 1, // Mock data
        chats: Array.isArray(chatsRes.data.chats) ? chatsRes.data.chats.length : 0,
        memories: Array.isArray(memoriesRes.data.memories) ? memoriesRes.data.memories.length : memoriesRes.data.count || 0,
        profileViews: Math.floor(Math.random() * 200) + 50, // Mock data
        connections: Math.floor(Math.random() * 30) + 5, // Mock data
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set default stats if API fails
      setStats({
        matches: 0,
        chats: 0,
        memories: 0,
        profileViews: 0,
        connections: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, fetchStats])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
            <span className="text-white font-medium">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const quickActions = [
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Find Matches",
      description: "Discover new connections",
      href: "/matches",
      gradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      title: "Start Chatting",
      description: "Continue conversations",
      href: "/chat",
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "AI Features",
      description: "Explore AI-powered tools",
      href: "/ai/select-mode",
      gradient: "from-purple-500/20 to-violet-500/20"
    },
    {
      icon: <Calendar className="w-6 h-6 text-white" />,
      title: "Plan Events",
      description: "Schedule meetups",
      href: "/calendar",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-white" />,
      title: "Share Memories",
      description: "Upload and view memories",
      href: "/memories",
      gradient: "from-orange-500/20 to-amber-500/20"
    },
    {
      icon: <Gift className="w-6 h-6 text-white" />,
      title: "Send Gifts",
      description: "Surprise someone special",
      href: "/gifts",
      gradient: "from-cyan-500/20 to-teal-500/20"
    }
  ]

  const recentActivities = [
    { icon: <Heart className="w-4 h-4 text-white" />, title: "New match found", time: "2 minutes ago", status: 'online' as const },
    { icon: <MessageCircle className="w-4 h-4 text-white" />, title: "Message from Sarah", time: "5 minutes ago", status: 'online' as const },
    { icon: <Star className="w-4 h-4 text-white" />, title: "Profile view from Alex", time: "1 hour ago", status: 'away' as const },
    { icon: <Gift className="w-4 h-4 text-white" />, title: "Gift received", time: "2 hours ago", status: 'offline' as const },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black mb-2">
                Welcome back, <span className="gradient-text">{user.name}</span>!
              </h1>
              <p className="text-gray-400 text-lg">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${user.modeDefault === 'love'
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                {user.modeDefault === 'love' ? (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-bold">Love Mode</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span className="font-bold">Friend Mode</span>
                  </>
                )}
              </div>
              <Link href="/settings" className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all">
                <Settings className="w-5 h-5 text-white/80" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Heart className="w-5 h-5 text-white" />}
            label="Total Matches"
            value={stats?.matches || 0}
            change="+12%"
            changeType="positive"
            delay={0.1}
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5 text-white" />}
            label="Active Chats"
            value={stats?.chats || 0}
            change="+5%"
            changeType="positive"
            delay={0.2}
          />
          <StatCard
            icon={<ImageIcon className="w-5 h-5 text-white" />}
            label="Memories Shared"
            value={stats?.memories || 0}
            change="+8%"
            changeType="positive"
            delay={0.3}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-white" />}
            label="Profile Views"
            value={stats?.profileViews || 0}
            change="+15%"
            changeType="positive"
            delay={0.4}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-white" />}
            label="Connections"
            value={stats?.connections || 0}
            change="+3%"
            changeType="positive"
            delay={0.5}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={action.title} {...action} delay={0.7 + index * 0.1} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-400" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
              <Link
                href="/activity"
                className="block mt-4 text-center p-3 glass rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-pink-400 hover:text-pink-300"
              >
                View All Activity →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mode Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 glass rounded-2xl p-8 relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 ${user.modeDefault === 'love' ? 'text-pink-400' : 'text-blue-400'
            }`}>
            {user.modeDefault === 'love' ? (
              <Heart className="w-full h-full" />
            ) : (
              <Users className="w-full h-full" />
            )}
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              {user.modeDefault === 'love' ? (
                <>
                  <Heart className="w-6 h-6 mr-3 text-pink-400 fill-pink-400" />
                  <span className="gradient-text">Romantic Journey Active</span>
                </>
              ) : (
                <>
                  <Users className="w-6 h-6 mr-3 text-blue-400" />
                  <span className="gradient-text">Friendship Discovery Active</span>
                </>
              )}
            </h3>

            <p className="text-gray-300 mb-6 max-w-2xl">
              {user.modeDefault === 'love'
                ? "You're currently in Love mode, where meaningful romantic connections await. Our AI is working to find your perfect match based on deep compatibility."
                : "You're in Friend mode, perfect for building lasting friendships. Connect with like-minded people who share your interests and values."
              }
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/matches"
                className="px-6 py-3 bg-gradient-primary rounded-xl font-bold hover:shadow-glow-primary transition-all hover:scale-105 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {user.modeDefault === 'love' ? 'Find Love' : 'Find Friends'}
              </Link>
              <Link
                href="/ai/select-mode"
                className="px-6 py-3 glass rounded-xl font-bold hover:shadow-glass-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Explore AI Features
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


