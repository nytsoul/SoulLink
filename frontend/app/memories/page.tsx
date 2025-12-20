'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth' // Assuming this hook exists for auth state
import { useRouter } from 'next/navigation'
import axios from 'axios'
import api from '@/lib/api'
import { Image as ImageIcon, Video, Upload, Trash2, Download, Eye, Sparkles, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

type MemoryItem = {
  _id: string
  title?: string
  filename?: string
  cidOrUrl?: string
  url?: string
  mediaType?: 'image' | 'video' | 'photo'
  tags?: string[]
  encrypted?: boolean
}

export default function MemoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<MemoryItem | null>(null)

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch memories once user is authenticated
  useEffect(() => {
    if (user) {
      fetchMemories()
    }
  }, [user])

  // Helper function to safely get the API URL
  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchMemories = async () => {
    try {
      const url = getApiUrl()

      // Use api instance with auth token
      const response = await api.get('/api/memories')

      const items = (response.data.items || []).map((item: any) => {
        // Construct proper URL for the image
        let imageUrl = item.url
        
        if (!imageUrl && (item.filename || item.cidOrUrl)) {
          const fileName = item.filename || item.cidOrUrl
          imageUrl = `${url}/api/memories/file/${fileName}`
        }
        
        return {
          ...item,
          url: imageUrl,
        }
      })
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

      const response = await api.post('/api/memories/batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(`Uploaded ${response.data.items.length} file(s)`)
      fetchMemories()
    } catch (error: any) {
      console.error('Upload error:', error)
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
      await api.delete(`/api/memories/${id}`)
      toast.success('Memory deleted')
      fetchMemories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const openPreview = (item: MemoryItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewItem(null)
  }

  const downloadFile = async (fileUrl: string, filename?: string) => {
    try {
      const res = await axios.get(fileUrl, { responseType: 'blob' })
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || fileUrl.split('/').pop() || 'memory'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (e: any) {
      console.error('Download error:', e)
      toast.error('Download failed')
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white flex items-center gap-3"
          >
            <div className="w-2 h-10 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full" />
            Memory Gallery
          </motion.h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Chronicle your journey together (Max 500 items)
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <ImageIcon className="w-96 h-96 -translate-x-20 -translate-y-20 rotate-12" />
          </div>
          <ImageIcon className="w-20 h-20 mx-auto text-pink-500/50 mb-6" />
          <p className="text-xl text-gray-400 mb-8 font-medium">Your story hasn't started yet...</p>
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-8 py-4 bg-white text-pink-600 rounded-full font-black text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Upload className="w-5 h-5 mr-3" />
            UPLOAD THE FIRST MEMORY
          </label>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {memories.map((memory, index) => (
              <motion.div
                key={memory._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <SpotlightCard className="bg-[#0f172a]/50 border-white/5 overflow-hidden h-full flex flex-col">
                  <div
                    className="relative aspect-[4/5] bg-gray-900 cursor-pointer overflow-hidden"
                    onClick={() => openPreview(memory)}
                  >
                    {memory.mediaType === 'video' || memory.url?.includes('.mp4') || memory.url?.includes('.webm') || memory.url?.includes('.mov') ? (
                      <video
                        src={memory.url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        muted
                        playsInline
                        onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => { })}
                        onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                      />
                    ) : (
                      <img
                        src={memory.url}
                        alt={memory.title || 'Memory'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null // Prevent infinite loop
                          target.style.display = 'none'
                          // Show placeholder
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-800">
                                <svg class="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            `
                          }
                        }}
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                      <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation()
                            openPreview(memory)
                          }}
                          className="flex-1 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 flex items-center justify-center gap-2 text-xs font-bold transition-all border border-white/10"
                        >
                          <Eye className="w-4 h-4" />
                          VIEW
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation()
                            downloadFile(memory.url!, memory.filename || memory.title || 'memory')
                          }}
                          className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 border border-white/10"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation()
                            handleDelete(memory._id)
                          }}
                          className="p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500/30 border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {memory.encrypted && (
                      <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-white/5">
                    <h3 className="font-bold text-sm truncate text-white mb-3">
                      {memory.title || memory.filename || 'Untitled Moment'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(memory.tags || []).slice(0, 2).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!memory.tags || memory.tags.length === 0) && (
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                          No Labels
                        </span>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closePreview} />
          <div className="relative z-10 max-w-5xl w-[95vw] bg-gray-900 rounded-lg shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                {previewItem.title || previewItem.filename || 'Preview'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadFile(
                      previewItem.url!,
                      previewItem.filename || previewItem.title || 'memory'
                    )
                  }
                  className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={closePreview}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto">
              {previewItem.mediaType === 'video' || previewItem.url?.includes('.mp4') || previewItem.url?.includes('.webm') || previewItem.url?.includes('.mov') ? (
                <video
                  controls
                  src={previewItem.url}
                  className="w-full rounded-lg bg-black"
                />
              ) : (
                <img
                  src={previewItem.url || '/placeholder-image.svg'}
                  alt={previewItem.title}
                  className="w-full h-auto rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                  }}
                />
              )}
            </div>

            {previewItem.tags && previewItem.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(previewItem.tags || []).map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-pink-900 text-pink-200 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}