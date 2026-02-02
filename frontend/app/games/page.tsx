'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Heart, Gamepad2, Play, Sparkles, Trophy, Users, TrendingUp, Zap, ArrowRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function GamesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // For invite link copy
  const [copied, setCopied] = useState(false)
  const handleInvite = () => {
    const url = typeof window !== 'undefined' ? window.location.origin + '/register?invite=partner' : ''
    if (url) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Invite link copied! Share it with your partner.')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const fetchGames = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/games`, {
        params: { mode: user?.modeDefault || 'love' },
      })
      setGames(response.data.games || [])
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.modeDefault])

  useEffect(() => {
    if (user) {
      fetchGames()
    }
  }, [user, fetchGames])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Gamepad2 className="w-16 h-16 text-pink-500" />
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Connect Through Play
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-pink-200 to-purple-400 bg-clip-text text-transparent"
          >
            Ultimate Social <br /> Gaming Arena
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Experience the most interactive and fun way to build connections. From compatibility tests to daring challenges, the game is on!
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" /> 50k+ Active Players
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Trophy className="w-4 h-4" /> 1M+ Matches Made
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-8">
          <button
            className="px-10 py-4 bg-white text-pink-600 rounded-full font-black text-lg hover:shadow-2xl transition-all relative z-10 hover:scale-105 active:scale-95"
            onClick={handleInvite}
          >
            {copied ? 'LINK COPIED!' : 'INVITE A PARTNER'}
          </button>
          <div className="mt-4 text-sm text-white/70">Share the link with your partner to join the fun!</div>
        </div>
      </section>
      {/* Stats/Trending Bar */}
      <div className="max-w-7xl mx-auto px-4 -translate-y-12 relative z-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
            <div>
              <div className="text-xs text-gray-500 font-medium">TRENDING</div>
              <div className="text-sm font-bold">Truth or Dare</div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="p-2 bg-pink-500/20 rounded-lg"><Zap className="w-5 h-5 text-pink-400" /></div>
            <div>
              <div className="text-xs text-gray-500 font-medium">HOT PLAY</div>
              <div className="text-sm font-bold">Comp. Quiz</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="p-2 bg-green-500/20 rounded-lg"><Gamepad2 className="w-5 h-5 text-green-400" /></div>
            <div>
              <div className="text-xs text-gray-500 font-medium">TOTAL GAMES</div>
              <div className="text-sm font-bold">12 Active</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg"><Trophy className="w-5 h-5 text-yellow-400" /></div>
            <div>
              <div className="text-xs text-gray-500 font-medium">MY SCORE</div>
              <div className="text-sm font-bold">2,450 XP</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-2 h-8 bg-pink-500 rounded-full" />
            Featured Games
          </h2>
          <div className="flex gap-2">
            {['All', 'Romantic', 'Fun', 'Social'].map((cat) => (
              <button key={cat} className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full flex flex-col overflow-hidden">
                {/* Trendy Badge */}
                {index === 0 && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-pink-500 text-[10px] font-bold uppercase rounded-bl-xl">
                    Featured
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-yellow-500 text-[10px] font-bold uppercase rounded-bl-xl text-black">
                    Trending
                  </div>
                )}

                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{game.name}</h3>
                <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                  {game.description}
                </p>

                <Link
                  href={
                    game.id === 'compatibility-quiz'
                      ? '/ai/quiz/compatibility'
                      : game.id === 'personality-match'
                        ? '/personality'
                        : `/games/${game.id}`
                  }
                  className="w-full h-12 bg-white/10 hover:bg-pink-500 text-white rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 font-bold group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    PLAY NOW
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-gradient-to-br from-pink-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Users className="w-96 h-96 -translate-x-20 -translate-y-20 rotate-12" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Don't Wait, Start Your Story Today!</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10">Invite your partner or find new friends. The best connections are made through laughter and shared moments.</p>
          <button className="px-10 py-4 bg-white text-pink-600 rounded-full font-black text-lg hover:shadow-2xl transition-all relative z-10 hover:scale-105 active:scale-95">
            INVITE A PARTNER
          </button>
        </div>
      </section>
    </div>
  )
}
