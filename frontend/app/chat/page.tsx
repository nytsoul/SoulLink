'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Send, Plus, Search, Sparkles, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [targetEmail, setTargetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const fetchChats = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  const requestOtp = async () => {
    if (!targetEmail.trim()) return toast.error('Enter an email')
    setRequesting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const res = await axios.post(`${API_URL}/api/chat/request-otp`, { email: targetEmail })
      setTargetId(res.data.targetId)
      // If backend returned OTP for dev, pre-fill it so testing is easier
      if (res.data.otp) {
        setOtp(res.data.otp)
        toast.success(`OTP (dev): ${res.data.otp}`)
      } else {
        toast.success('OTP requested. The target user will receive the OTP via email (or it will be logged during dev).')
      }
    } catch (err: any) {
      console.error('request otp error', err)
      toast.error(err.response?.data?.message || 'Failed to request OTP')
    } finally {
      setRequesting(false)
    }
  }

  const verifyOtpAndOpen = async () => {
    if (!targetId) return toast.error('No target selected')
    if (!otp.trim()) return toast.error('Enter OTP')
    setVerifying(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const res = await axios.post(`${API_URL}/api/chat/verify-otp`, { targetId, otp })
      const chat = res.data.chat
      if (chat && chat._id) {
        router.push(`/chat/${chat._id}`)
      } else {
        toast.error('Failed to open chat')
      }
    } catch (err: any) {
      console.error('verify otp error', err)
      toast.error(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white flex items-center gap-3"
          >
            <div className="w-2 h-10 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full" />
            Messages
          </motion.h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Connect with your matches in real-time
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="group relative px-8 py-4 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-pink-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            NEW CHAT
          </span>
        </button>
      </div>

      {chats.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <MessageCircle className="w-96 h-96 -translate-x-20 -translate-y-20 rotate-12" />
          </div>
          <MessageCircle className="w-20 h-20 mx-auto text-pink-500/50 mb-6" />
          <p className="text-xl text-gray-400 mb-8 font-medium">Silence is only gold in banks...</p>
          <Link
            href="/matches"
            className="inline-flex items-center px-8 py-4 bg-white text-pink-600 rounded-full font-black text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            FIND SOMEONE TO TALK TO
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {chats.map((chat: any, index) => {
              const otherParticipant = chat.participants?.find(
                (p: any) => p._id !== user.id
              )
              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/chat/${chat._id}`} className="block group">
                    <SpotlightCard className="p-6 bg-[#0f172a]/50 border-white/5 group-hover:bg-[#1e293b]/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            {otherParticipant?.profilePhotos?.[0] ? (
                              <Image
                                src={otherParticipant.profilePhotos[0]}
                                alt={otherParticipant.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-pink-500/50 transition-colors"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-white/10">
                                <span className="text-2xl font-bold text-white/20 capitalize">
                                  {otherParticipant?.name?.[0] || '?'}
                                </span>
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#020617] rounded-full" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white group-hover:text-pink-400 transition-colors">
                              {otherParticipant?.name || 'Inconnu'}
                            </h3>
                            {chat.lastMessage && (
                              <p className="text-gray-500 group-hover:text-gray-400 text-sm truncate max-w-md mt-1 transition-colors">
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 text-right">
                          {chat.lastMessageAt && (
                            <span className="text-xs font-bold text-white/30 tracking-tight uppercase">
                              {new Date(chat.lastMessageAt).toLocaleDateString()}
                            </span>
                          )}
                          <div className="p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="w-4 h-4 text-pink-500" />
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New conversation modal (simple) */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNew(false)} />
          <div className="relative z-10 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Conversation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter the other user's email. An OTP will be sent to them; once they provide it, verify here to open the chat.</p>

            <label className="block text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 mb-3" placeholder="their@example.com" />
            <div className="flex gap-2 mb-3">
              <button onClick={requestOtp} disabled={requesting} className="px-4 py-2 bg-pink-600 text-white rounded disabled:opacity-50">{requesting ? 'Requesting...' : 'Request OTP'}</button>
              <button onClick={() => { setTargetEmail(''); setTargetId(null); setOtp('') }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Reset</button>
            </div>

            {targetId && (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300">Enter OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 mb-3" placeholder="123456" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Cancel</button>
                  <button onClick={verifyOtpAndOpen} disabled={verifying} className="px-4 py-2 bg-pink-600 text-white rounded disabled:opacity-50">{verifying ? 'Verifying...' : 'Verify & Open Chat'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

