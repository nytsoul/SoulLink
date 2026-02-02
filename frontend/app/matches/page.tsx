'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Users, MapPin, Clock, Star, MessageCircle, 
  X, Check, Filter, Search, Sparkles 
} from 'lucide-react'
import Link from 'next/link'

interface Match {
  id: string
  name: string
  age: number
  location: string
  compatibility: number
  interests: string[]
  lastActive: string
  verified: boolean
  bio: string
  mode: 'love' | 'friends'
}

// Mock data - in real app this would come from API
const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 25,
    location: 'New York, NY',
    compatibility: 95,
    interests: ['Photography', 'Travel', 'Yoga'],
    lastActive: '2 hours ago',
    verified: true,
    bio: 'Adventure seeker and coffee lover. Looking for someone to explore the world with!',
    mode: 'love'
  },
  {
    id: '2',
    name: 'Alex Chen',
    age: 28,
    location: 'San Francisco, CA',
    compatibility: 88,
    interests: ['Gaming', 'Tech', 'Movies'],
    lastActive: '1 day ago',
    verified: true,
    bio: 'Software engineer by day, gamer by night. Always up for good conversations!',
    mode: 'friends'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 24,
    location: 'Los Angeles, CA',
    compatibility: 91,
    interests: ['Art', 'Music', 'Dancing'],
    lastActive: '3 hours ago',
    verified: false,
    bio: 'Artist and music lover. Let\'s create beautiful memories together.',
    mode: 'love'
  }
]

export default function MatchesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setMatches(mockMatches.filter(match => 
          user.modeDefault === 'love' ? match.mode === 'love' : match.mode === 'friends'
        ))
        setIsLoading(false)
      }, 1000)
    }
  }, [user])

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.interests.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    if (filter === 'verified') return matchesSearch && match.verified
    if (filter === 'recent') return matchesSearch && match.lastActive.includes('hour')
    return matchesSearch
  })

  const handleLike = (matchId: string) => {
    // Handle like action
    console.log('Liked:', matchId)
  }

  const handlePass = (matchId: string) => {
    // Handle pass action
    setMatches(prev => prev.filter(match => match.id !== matchId))
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
            <span className="text-white font-medium">Finding your matches...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">
              {user.modeDefault === 'love' ? 'Find Love' : 'Find Friends'}
            </span>
          </h1>
          <p className="text-gray-400">
            {user.modeDefault === 'love' 
              ? 'Discover meaningful romantic connections'
              : 'Build lasting friendships'
            }
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 glass rounded-xl text-white text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              >
                <option value="all" className="bg-dark-900">All Matches</option>
                <option value="verified" className="bg-dark-900">Verified Only</option>
                <option value="recent" className="bg-dark-900">Recently Active</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Matches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass rounded-2xl overflow-hidden hover:shadow-glass-lg transition-all duration-300 group"
            >
              {/* Profile Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {match.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {match.verified && (
                      <div className="p-1 bg-green-500/20 rounded-full">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-white">{match.compatibility}%</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{match.name}, {match.age}</h3>
                <div className="flex items-center text-gray-400 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {match.location}
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{match.bio}</p>

                {/* Interests */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Last Active */}
                <div className="flex items-center text-gray-400 text-xs mb-6">
                  <Clock className="w-3 h-3 mr-1" />
                  Active {match.lastActive}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePass(match.id)}
                    className="flex-1 p-3 glass rounded-xl hover:bg-red-500/20 transition-all group-hover:scale-105 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                  </button>
                  
                  <Link
                    href={`/chat/new?user=${match.id}`}
                    className="flex-1 p-3 glass rounded-xl hover:bg-blue-500/20 transition-all group-hover:scale-105 flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                  </Link>
                  
                  <button
                    onClick={() => handleLike(match.id)}
                    className="flex-1 p-3 bg-gradient-primary rounded-xl hover:shadow-glow-primary transition-all group-hover:scale-105 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new matches, or try expanding your preferences'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/profile"
                  className="inline-block px-6 py-3 bg-gradient-primary rounded-xl font-bold text-white hover:shadow-glow-primary transition-all"
                >
                  Complete Your Profile
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Match Stats */}
        {filteredMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="glass rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white mb-2">Match Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-black gradient-text">{filteredMatches.length}</div>
                  <div className="text-gray-400">Total Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-black gradient-text">
                    {Math.round(filteredMatches.reduce((acc, match) => acc + match.compatibility, 0) / filteredMatches.length)}%
                  </div>
                  <div className="text-gray-400">Avg Compatibility</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}