'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Heart, Users, Sparkles, Calendar, MessageCircle, Image, Shield } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function DashboardPage() {
  const { user, loading: authLoading, setMode } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      // Fetch user stats
      const [matchesRes, chatsRes, memoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/matches/suggestions`).catch(() => ({ data: { suggestions: [] } })),
        axios.get(`${API_URL}/api/chat`).catch(() => ({ data: { chats: [] } })),
        axios.get(`${API_URL}/api/memories`).catch(() => ({ data: { count: 0 } })),
      ])

      setStats({
        matches: matchesRes.data.suggestions?.length || 0,
        chats: chatsRes.data.chats?.length || 0,
        memories: memoriesRes.data.count || 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You're in <span className="font-semibold">{user.modeDefault}</span> mode
        </p>
      </div>

      {/* Mode Display (Locked) */}
      <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900 rounded-lg shadow-lg p-6 border-2 border-pink-200 dark:border-pink-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              {user.modeDefault === 'love' ? (
                <>
                  <Heart className="w-6 h-6 text-pink-600" />
                  <span className="text-pink-700 dark:text-pink-300">Love Mode</span>
                </>
              ) : (
                <>
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700 dark:text-blue-300">Friends Mode</span>
                </>
              )}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mode is locked. To change mode, please logout and create a new account.
            </p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">Locked</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">🔒</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Matches"
            value={stats.matches}
            link="/matches"
          />
          <StatCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Chats"
            value={stats.chats}
            link="/chat"
          />
          <StatCard
            icon={<Image className="w-8 h-8" />}
            title="Memories"
            value={stats.memories}
            link="/memories"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          icon={<Sparkles className="w-6 h-6" />}
          title="AI Poem Generator"
          description="Generate a personalized poem"
          link="/ai/poem"
        />
        <QuickActionCard
          icon={<Sparkles className="w-6 h-6" />}
          title="AI Quiz"
          description="Take a compatibility quiz"
          link="/ai/quiz"
        />
        <QuickActionCard
          icon={<Calendar className="w-6 h-6" />}
          title="Calendar"
          description="View your events"
          link="/calendar"
        />
        <QuickActionCard
          icon={<Shield className="w-6 h-6" />}
          title="Verification"
          description="Verify your profile"
          link="/verification"
        />
        <QuickActionCard
          icon={<MessageCircle className="w-6 h-6" />}
          title="Chat Assistant"
          description="Get conversation tips"
          link="/chat/assistant"
        />
        <QuickActionCard
          icon={<Users className="w-6 h-6" />}
          title="Games"
          description="Play interactive games"
          link="/games"
        />
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, link }: { icon: React.ReactNode; title: string; value: number; link: string }) {
  return (
    <Link href={link} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="text-primary-600">{icon}</div>
      </div>
    </Link>
  )
}

function QuickActionCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}) {
  return (
    <Link
      href={link}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
    >
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </Link>
  )
}

