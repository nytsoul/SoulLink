'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Heart, Users, Sparkles, Calendar, MessageCircle, Image, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { motion } from 'framer-motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

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
      // Fetch user stats (matches endpoint removed; avoid calling missing route)
      const [chatsRes, memoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/chat`).catch(() => ({ data: { chats: [] } })),
        axios.get(`${API_URL}/api/memories`).catch(() => ({ data: { count: 0 } })),
      ])

      setStats({
        matches: 0,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-white mb-2"
        >
          Welcome back, <span className="text-pink-500">{user.name}</span>!
        </motion.h1>
        <p className="text-gray-400 font-medium">
          Current session: <span className="text-pink-400/80 capitalize">{user.modeDefault}</span> Mode
        </p>
      </div>

      {/* Mode Display (Locked) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="mb-12 bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Heart className="w-48 h-48 -rotate-12" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
              {user.modeDefault === 'love' ? (
                <>
                  <div className="p-3 bg-pink-500/20 rounded-2xl"><Heart className="w-8 h-8 text-pink-500 fill-pink-500" /></div>
                  <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Romantic Journey</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-500/20 rounded-2xl"><Users className="w-8 h-8 text-blue-500" /></div>
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Friendship Circles</span>
                </>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/20 uppercase tracking-widest ml-2">Active</span>
            </h2>
            <p className="text-gray-400 max-w-xl">
              Mode is permanently locked for this account. To explore other connection types, please logout and create a new identity.
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex flex-col items-center gap-2 p-5 bg-white/5 rounded-3xl border border-white/10 min-w-[120px]">
              <div className="text-3xl">🔒</div>
              <div className="text-xs font-black text-white/40 uppercase tracking-widest">Locked</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { icon: <Image />, title: "Memories", desc: "Your visual timeline", link: "/memories", stats: stats?.memories, color: "rgba(59, 130, 246, 0.2)" },
          { icon: <MessageCircle />, title: "Chat", desc: "Instant interactions", link: "/chat", stats: stats?.chats, color: "rgba(168, 85, 247, 0.2)" },
          { icon: <Calendar />, title: "Calendar", desc: "Scheduled moments", link: "/calendar", color: "rgba(34, 197, 94, 0.2)" },
          { icon: <Shield />, title: "Verify", desc: "Trust building", link: "/verification", color: "rgba(249, 115, 22, 0.2)" },
          { icon: <Users />, title: "Games", desc: "Play & Connect", link: "/games", color: "rgba(236, 72, 153, 0.2)" }
        ].map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link href={action.link} className="block group">
              <SpotlightCard
                className="p-6 h-full flex flex-col bg-[#0f172a]/50 border-white/5"
                spotlightColor={action.color}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors text-white/80 group-hover:text-white">
                    {React.cloneElement(action.icon as React.ReactElement, { className: "w-6 h-6" })}
                  </div>
                  {action.stats !== undefined && (
                    <div className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                      {action.stats}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">{action.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{action.desc}</p>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-white/30 group-hover:text-pink-500 transition-colors">
                  OPEN MODULE <ArrowRight className="w-3 h-3" />
                </div>
              </SpotlightCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


