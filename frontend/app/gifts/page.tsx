'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, Heart, Star, Coffee, Music, BookOpen, Gamepad2, 
  Camera, Plane, Palette, Send, Users, ShoppingBag 
} from 'lucide-react'
import toast from 'react-hot-toast'

interface GiftItem {
  id: string
  name: string
  description: string
  price: number
  category: 'virtual' | 'digital' | 'experience'
  icon: React.ReactNode
  color: string
}

const giftItems: GiftItem[] = [
  {
    id: '1',
    name: 'Virtual Rose',
    description: 'Send a beautiful virtual rose to show you care',
    price: 5,
    category: 'virtual',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: '2',
    name: 'Coffee Date Voucher',
    description: 'Invite them for a virtual or real coffee date',
    price: 15,
    category: 'experience',
    icon: <Coffee className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: '3',
    name: 'Playlist Surprise',
    description: 'Create a personalized music playlist for them',
    price: 10,
    category: 'digital',
    icon: <Music className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: '4',
    name: 'E-Book Collection',
    description: 'Gift a curated collection of romantic e-books',
    price: 25,
    category: 'digital',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '5',
    name: 'Gaming Session',
    description: 'Play online games together for 2 hours',
    price: 20,
    category: 'experience',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '6',
    name: 'Photo Memory Book',
    description: 'Create a digital photo album of your memories',
    price: 30,
    category: 'digital',
    icon: <Camera className="w-6 h-6" />,
    color: 'from-teal-500 to-blue-500'
  },
  {
    id: '7',
    name: 'Virtual Trip',
    description: 'Take a virtual tour of a romantic destination',
    price: 35,
    category: 'experience',
    icon: <Plane className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: '8',
    name: 'Art Creation Kit',
    description: 'Digital art tools and templates for couples',
    price: 18,
    category: 'digital',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-pink-500 to-purple-500'
  }
]

export default function GiftsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'virtual' | 'digital' | 'experience'>('all')
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
            <span className="text-white font-medium">Loading gifts...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const filteredGifts = selectedCategory === 'all' 
    ? giftItems 
    : giftItems.filter(gift => gift.category === selectedCategory)

  const handleSendGift = () => {
    if (!selectedGift || !recipient) {
      toast.error('Please select a gift and recipient')
      return
    }

    // Simulate sending gift
    toast.success(`${selectedGift.name} sent successfully! 🎁`)
    setSelectedGift(null)
    setRecipient('')
    setMessage('')
  }

  const categories = [
    { id: 'all', label: 'All Gifts', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'virtual', label: 'Virtual', icon: <Heart className="w-4 h-4" /> },
    { id: 'digital', label: 'Digital', icon: <Star className="w-4 h-4" /> },
    { id: 'experience', label: 'Experience', icon: <Users className="w-4 h-4" /> }
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="gradient-text">Gift Store</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Surprise someone special with thoughtful digital gifts and experiences
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-primary text-white shadow-glow-primary'
                  : 'glass text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Gifts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredGifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setSelectedGift(gift)}
              className={`glass rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-glass-lg ${
                selectedGift?.id === gift.id ? 'ring-2 ring-pink-400 shadow-glow-primary' : ''
              }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${gift.color} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                <div className="text-white">
                  {gift.icon}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 text-center">{gift.name}</h3>
              <p className="text-gray-400 text-sm mb-4 text-center leading-relaxed">{gift.description}</p>
              
              <div className="text-center">
                <span className="text-2xl font-black gradient-text">${gift.price}</span>
              </div>
              
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  gift.category === 'virtual' ? 'bg-pink-500/20 text-pink-400' :
                  gift.category === 'digital' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {gift.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Send Gift Section */}
        {selectedGift && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <Gift className="w-6 h-6 mr-2" />
              Send {selectedGift.name}
            </h3>
            
            <div className="space-y-6">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Send to</label>
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                />
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Personal Message (Optional)</label>
                <textarea
                  placeholder="Write a heartfelt message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none"
                />
              </div>
              
              {/* Gift Summary */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${selectedGift.color} rounded-lg flex items-center justify-center`}>
                      <div className="text-white text-sm">
                        {selectedGift.icon}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-white">{selectedGift.name}</div>
                      <div className="text-sm text-gray-400">{selectedGift.category}</div>
                    </div>
                  </div>
                  <div className="text-xl font-black gradient-text">${selectedGift.price}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedGift(null)}
                  className="flex-1 px-6 py-3 glass rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendGift}
                  className="flex-1 px-6 py-3 bg-gradient-primary rounded-xl font-bold text-white hover:shadow-glow-primary transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Gift</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gift History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Recent Gifts</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="glass rounded-xl p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Virtual Rose</div>
                <div className="text-sm text-gray-400">Sent to Sarah • 2 days ago</div>
              </div>
              <div className="text-sm font-bold text-green-400">$5</div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Playlist Surprise</div>
                <div className="text-sm text-gray-400">Received from Alex • 1 week ago</div>
              </div>
              <div className="text-sm font-bold text-blue-400">Received</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}