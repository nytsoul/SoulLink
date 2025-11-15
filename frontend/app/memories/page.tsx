'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Image, Video, Upload, Trash2, Edit2, Lock, Unlock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MemoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchMemories()
    }
  }, [user])

  const fetchMemories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/memories`)
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        url: item.url || `${API_URL}/api/memories/file/${item.filename || item.cidOrUrl?.split('/').pop() || item.cidOrUrl}`,
      }))
      setMemories(items)
    } catch (error) {
      console.error('Failed to fetch memories:', error)
      toast.error('Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await axios.post(
        `${API_URL}/api/memories/batch`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      toast.success(`Uploaded ${response.data.items.length} file(s)`)
      fetchMemories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return

    try {
      await axios.delete(`${API_URL}/api/memories/${id}`)
      toast.success('Memory deleted')
      fetchMemories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed')
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Memory Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Store your precious moments (Max 500 items)
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 cursor-pointer transition-all shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Photos/Videos'}
          </label>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No memories yet</p>
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 cursor-pointer"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your First Memory
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memories.map((memory) => (
            <div
              key={memory._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                {memory.mediaType === 'video' ? (
                  <Video className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={memory.url || `${process.env.NEXT_PUBLIC_API_URL}/api/memories/file/${memory.filename || path.basename(memory.cidOrUrl)}`}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png'
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(memory._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {memory.encrypted && (
                  <div className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{memory.title}</h3>
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {memory.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

