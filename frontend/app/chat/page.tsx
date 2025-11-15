'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user])

  const fetchChats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_URL}/api/chat`)
      setChats(response.data.chats || [])
    } catch (error) {
      console.error('Failed to fetch chats:', error)
      toast.error('Failed to load chats')
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Chats</h1>

      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No chats yet. Start a conversation with a match!</p>
          <Link
            href="/matches"
            className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Find Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat: any) => {
            const otherParticipant = chat.participants?.find(
              (p: any) => p._id !== user.id
            )
            return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {otherParticipant?.profilePhotos?.[0] && (
                      <img
                        src={otherParticipant.profilePhotos[0]}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{otherParticipant?.name || 'Unknown'}</h3>
                      {chat.lastMessage && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-md">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  {chat.lastMessageAt && (
                    <span className="text-sm text-gray-500">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

