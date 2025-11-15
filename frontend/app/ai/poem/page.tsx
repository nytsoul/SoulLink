'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Sparkles, Heart, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PoemGeneratorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [poem, setPoem] = useState('')
  const [formData, setFormData] = useState({
    prompt: '',
    recipientName: '',
    mode: user?.modeDefault || 'love',
  })

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const generatePoem = async () => {
    if (!formData.prompt && !formData.recipientName) {
      toast.error('Please provide a prompt or recipient name')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/poem`, {
        ...formData,
        mode: user.modeDefault,
      })
      setPoem(response.data.poem)
      toast.success('Poem generated!')
    } catch (error: any) {
      if (error.response?.status === 503) {
        setPoem(error.response.data.poem || 'AI features are not available. Please configure OpenAI API key.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate poem')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-pink-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.modeDefault === 'love' ? 'Love' : 'Friendship'} Poem Generator
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="Enter name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt / Theme (Optional)
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="e.g., first date, sunset, nervous, happy memories..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={generatePoem}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Poem
              </>
            )}
          </button>
        </div>

        {poem && (
          <div className="mt-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900 rounded-lg border-2 border-pink-200 dark:border-pink-800">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Poem</h2>
            </div>
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {poem}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(poem)
                toast.success('Copied to clipboard!')
              }}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Copy Poem
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

