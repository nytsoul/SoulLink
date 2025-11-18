'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth' // Assuming this hook exists for auth state
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Image, Video, Upload, Trash2, Download, Eye } from 'lucide-react'
import toast from 'react-hot-toast' // Assuming react-hot-toast is used for notifications

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
      
      // FIX: Used the local variable 'url' instead of the undefined 'API_URL'
      const response = await axios.get(`${url}/api/memories`) 
      
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        url:
          item.url ||
          `${url}/api/memories/file/${
            item.filename || item.cidOrUrl?.split('/').pop() || item.cidOrUrl
          }`,
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
      const url = getApiUrl()
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await axios.post(`${url}/api/memories/batch`, formData, {
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
      const url = getApiUrl()
      await axios.delete(`${url}/api/memories/${id}`)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Memory Gallery</h1>
          <p className="text-gray-400 mt-2">Store your precious moments (Max 500 items)</p>
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
        <div className="text-center py-16 bg-gray-800 rounded-lg shadow">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 mb-4">No memories yet</p>
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
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div
                className="relative aspect-square bg-gray-700 cursor-pointer"
                onClick={() => openPreview(memory)}
              >
                {memory.mediaType === 'video' || memory.url?.includes('.mp4') || memory.url?.includes('.webm') || memory.url?.includes('.mov') ? (
                  <video
                    src={memory.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                    onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img
                    src={memory.url || '/placeholder-image.svg'}
                    alt={memory.title || 'Memory'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                    }}
                  />
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        openPreview(memory)
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        downloadFile(memory.url!, memory.filename || memory.title || 'memory')
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        handleDelete(memory._id)
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {memory.encrypted && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    Encrypted
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm truncate text-white">
                  {memory.title || memory.filename || 'Untitled'}
                </h3>
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {memory.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-pink-900 text-pink-200 rounded text-xs"
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
    </div>
  )
}