'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Gamepad2, Play } from 'lucide-react'
import Link from 'next/link'

export default function GamesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchGames()
    }
  }, [user])

  const fetchGames = async () => {
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
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <Gamepad2 className="w-8 h-8" />
        Games
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <Gamepad2 className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{game.description}</p>
            <button className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

