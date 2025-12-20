'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Send, Sparkles, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const chatId = params.chatId as string
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantResponse, setAssistantResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && chatId) {
      fetchMessages()
      connectSocket()
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user, chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const connectSocket = () => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    })

    socket.on('connect', () => {
      socket.emit('join-room', chatId)
    })

    socket.on('receive-message', (data) => {
      setMessages((prev) => {
        // Prevent duplicates - check if message already exists
        if (prev.some(msg => msg._id === data._id)) {
          return prev
        }
        return [...prev, data]
      })
    })

    socketRef.current = socket
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chatId}/messages`
      )
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chatId}/messages`,
        {
          content: newMessage,
          messageType: 'text',
        }
      )

      setMessages((prev) => [...prev, response.data.message])
      setNewMessage('')

      // Emit via socket
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          roomId: chatId,
          ...response.data.message,
        })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getAssistantHelp = async (type: string = 'tips') => {
    setAssistantLoading(true)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chatId}/assistant`,
        { type, query: newMessage }
      )
      setAssistantResponse(response.data.response)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to get assistant help')
    } finally {
      setAssistantLoading(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chat</h2>
          <button
            onClick={() => getAssistantHelp('tips')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Get Tips
          </button>
        </div>

        {/* Assistant Response */}
        {assistantResponse && (
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-pink-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">AI Assistant</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assistantResponse}
                </p>
              </div>
              <button
                onClick={() => setAssistantResponse('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId._id === user.id
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {message.senderId._id === user.id ? 'You' : message.senderId.name}
                  </p>
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

