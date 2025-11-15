'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Calendar as CalendarIcon, Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar`)
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }

  const exportCalendar = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/export`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'loves-calendar.ics')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Calendar exported!')
    } catch (error) {
      toast.error('Failed to export calendar')
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Calendar
        </h1>
        <div className="flex gap-2">
          <button
            onClick={exportCalendar}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No events yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(event.date).toLocaleDateString()} - {event.type}
              </p>
              {event.description && (
                <p className="text-gray-500 dark:text-gray-500 mt-2">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

