'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user])

  const fetchMatches = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_URL}/api/matches/suggestions`)
      setMatches(response.data.suggestions || [])
      
      // If no matches, try search endpoint
      if (!response.data.suggestions || response.data.suggestions.length === 0) {
        const searchResponse = await axios.get(`${API_URL}/api/matches/search`)
        setMatches(searchResponse.data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const startChat = async (userId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${API_URL}/api/chat/create`, {
        participantId: userId,
        mode: user?.modeDefault || 'love',
      })
      router.push(`/chat/${response.data.chat._id}`)
      toast.success('Chat created!')
    } catch (error: any) {
      console.error('Failed to start chat:', error)
      toast.error(error.response?.data?.message || 'Failed to start chat')
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No matches found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match: any) => (
            <div
              key={match._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {match.profilePhotos && match.profilePhotos.length > 0 && (
                <img
                  src={match.profilePhotos[0]}
                  alt={match.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{match.name}</h3>
                {match.bio && <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{match.bio}</p>}
                {match.location && (
                  <p className="text-sm text-gray-500 mb-4">📍 {match.location}</p>
                )}
                {match.interests && match.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.interests.slice(0, 3).map((interest: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                {match.matchScore && (
                  <p className="text-sm font-semibold text-primary-600 mb-4">
                    Match Score: {match.matchScore}%
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => startChat(match._id)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  <Link
                    href={`/users/${match._id}`}
                    className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

