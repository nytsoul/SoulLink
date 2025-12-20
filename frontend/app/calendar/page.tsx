'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Calendar as CalendarIcon, Plus, Download, X, ChevronLeft, ChevronRight, Heart, Briefcase, Bell, BookOpen, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg px-4 py-2.5 text-sm border ${props.className ?? 'border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
        } focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all`}
    />
  )
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg px-4 py-2.5 text-sm border ${props.className ?? 'border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
        } focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all`}
    />
  )
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg px-4 py-2.5 text-sm border ${props.className ?? 'border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
        } focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all`}
    />
  )
}

type CalendarEvent = {
  _id?: string
  title: string
  date: string
  type: 'PERSONAL' | 'WORK' | 'REMINDER' | 'JOURNAL' | 'EVENT'
  color?: string
  description?: string
  imageUrl?: string
}

const typeIcons = {
  PERSONAL: Heart,
  WORK: Briefcase,
  REMINDER: Bell,
  JOURNAL: BookOpen,
  EVENT: Star,
}

const typeColors = {
  PERSONAL: 'from-rose-500 to-pink-600',
  WORK: 'from-blue-500 to-indigo-600',
  REMINDER: 'from-amber-500 to-orange-600',
  JOURNAL: 'from-purple-500 to-violet-600',
  EVENT: 'from-emerald-500 to-teal-600',
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CalendarEvent>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'PERSONAL',
    color: '#f472b6',
    description: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dailyNote, setDailyNote] = useState('')

  const apiBase = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchEvents()
  }, [user])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/calendar`)
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }

  const ymd = (d: Date | string) => new Date(d).toISOString().slice(0, 10)
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const mapTypeToServer = (t: CalendarEvent['type']) => {
    switch (t) {
      case 'REMINDER':
        return 'reminder'
      case 'JOURNAL':
      case 'PERSONAL':
      case 'WORK':
      case 'EVENT':
      default:
        return 'event'
    }
  }

  const createEvent = async (payload: CalendarEvent, opts?: { silentSuccess?: boolean }) => {
    try {
      const serverPayload = {
        title: payload.title,
        date: payload.date,
        type: mapTypeToServer(payload.type),
        color: payload.color,
        description: payload.description,
      }
      await axios.post(`${apiBase}/api/calendar`, serverPayload)
      if (!opts?.silentSuccess) toast.success('Event added')
      fetchEvents()
      return true
    } catch (e: any) {
      toast.error('Failed to add event')
      return false
    }
  }

  const onSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalDescription = [form.description, dailyNote ? `Daily note: ${dailyNote}` : '']
      .filter(Boolean)
      .join('\n')
    const ok = await createEvent({ ...form, description: finalDescription || undefined })
    if (ok) {
      setOpen(false)
      setForm({
        title: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'PERSONAL',
        color: '#f472b6',
        description: '',
      })
      setImageFile(null)
      setImagePreview(null)
      setDailyNote('')
    }
  }

  const exportCalendar = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/calendar/export`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'loves-calendar.ics')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Calendar exported!')
    } catch (error) {
      toast.error('Failed to export calendar')
    }
  }

  // Calendar grid logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = ymd(date)
    return events.filter(e => ymd(e.date) === dateStr)
  }

  const monthDays = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <CalendarIcon className="w-10 h-10 text-rose-600" />
                My Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Track your special moments and events</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCalendar}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setOpen(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg w-fit shadow-sm">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'month'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              List View
            </button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Month Navigation */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, idx) => {
                  const dayEvents = getEventsForDate(day)
                  const isToday = day && ymd(day) === todayISO

                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] p-2 rounded-lg border transition-all ${day
                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-105 cursor-pointer'
                        : 'bg-transparent border-transparent'
                        } ${isToday ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-900/20' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => {
                              const Icon = typeIcons[event.type]
                              return (
                                <div
                                  key={event._id}
                                  className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${typeColors[event.type]} text-white truncate flex items-center gap-1`}
                                  title={event.title}
                                >
                                  <Icon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              )
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <CalendarIcon className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No events yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Create your first event to get started!</p>
              </div>
            ) : (
              events.map((event) => {
                const Icon = typeIcons[event.type]
                return (
                  <div
                    key={event._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                  >
                    <div className={`h-2 bg-gradient-to-r ${typeColors[event.type]}`} />
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${typeColors[event.type]} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${typeColors[event.type]} text-white text-xs font-medium`}>
                              {event.type}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line mb-3">
                              {event.description}
                            </p>
                          )}
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full max-w-md h-48 object-cover rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(event.imageUrl, '_blank')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Add Event Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Create New Event
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={onSubmitAdd} className="space-y-4 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
                Add a special moment to your calendar
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    required
                    value={form.date.slice(0, 10)}
                    onChange={e => {
                      const d = e.target.value
                      setForm({ ...form, date: new Date(d + 'T00:00:00').toISOString() })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={form.type}
                    onChange={e =>
                      setForm({ ...form, type: e.target.value as CalendarEvent['type'] })
                    }
                  >
                    <option value="PERSONAL">💕 Personal</option>
                    <option value="WORK">💼 Work</option>
                    <option value="REMINDER">🔔 Reminder</option>
                    <option value="JOURNAL">📖 Journal</option>
                    <option value="EVENT">⭐ Event</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Add details about this event..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Daily Note</label>
                <Textarea
                  value={dailyNote}
                  onChange={e => setDailyNote(e.target.value)}
                  placeholder="What happened today?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Save Event
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
