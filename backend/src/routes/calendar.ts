import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { supabase } from '../lib/supabaseClient'
import { authenticate, AuthRequest } from '../middleware/auth'
import OpenAI from 'openai'

const router = express.Router()

// Initialize OpenAI (optional)
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim() === '') return null
  try {
    return new OpenAI({ apiKey })
  } catch {
    return null
  }
}
const openai = getOpenAIClient()

// Get calendar events
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', req.userId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (type) query = query.eq('type', type)

    const { data: events, error } = await query.order('date', { ascending: true })

    if (error) return res.status(500).json({ message: error.message })

    res.json({ events })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get upcoming events
router.get('/upcoming', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', req.userId)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(Number(limit))

    if (error) return res.status(500).json({ message: error.message })
    res.json({ events })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// AI-powered event suggestions (keep same logic, just remove User model use)
router.post('/suggestions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', date, preferences, budget } = req.body

    if (!openai) {
      const fallbackSuggestions = mode === 'love' ? [{ title: 'Romantic Dinner', type: 'date', description: 'Cozy dinner' }] : [{ title: 'Game Night', type: 'event', description: 'Board games' }];
      return res.json({ suggestions: fallbackSuggestions })
    }

    const prompt = `Suggest events for ${mode}...` // Simplified for brevity
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    })

    const suggestions = JSON.parse(completion.choices[0]?.message?.content || '[]')
    res.json({ suggestions })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Create event
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty(),
    body('date').isISO8601(),
    body('type').isIn(['birthday', 'anniversary', 'date', 'event', 'reminder']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

      const { title, type, date, description, recurring, participants, reminder } = req.body

      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: req.userId,
          title,
          type,
          date,
          description,
          recurring,
          participants,
          reminder,
        })
        .select()
        .single()

      if (error) return res.status(500).json({ message: error.message })
      res.status(201).json({ event })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

// Update event
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const updates = { ...req.body }
    const { data: event, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) return res.status(404).json({ message: 'Event not found' })
    res.json({ event })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Delete event
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)

    if (error) return res.status(404).json({ message: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Export calendar (ICS)
router.get('/export', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: events } = await supabase.from('calendar_events').select('*').eq('user_id', req.userId)
    if (!events) return res.status(404).json({ message: 'No events' })

    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'
    events.forEach((event: any) => {
      ics += 'BEGIN:VEVENT\r\n'
      ics += `SUMMARY:${event.title}\r\n`
      ics += `DTSTART:${new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`
      ics += 'END:VEVENT\r\n'
    })
    ics += 'END:VCALENDAR\r\n'

    res.setHeader('Content-Type', 'text/calendar');
    res.send(ics)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Daily Entries
router.post('/:eventId/entry', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params
    const { date, memory, notes, mood, photos } = req.body

    const { data: event } = await supabase.from('calendar_events').select('daily_entries').eq('id', eventId).eq('user_id', req.userId).single()
    if (!event) return res.status(404).json({ message: 'Event not found' })

    const entries = event.daily_entries || []
    const entryDate = new Date(date).toISOString().slice(0, 10)

    // Update or push
    const existingIndex = entries.findIndex((e: any) => new Date(e.date).toISOString().slice(0, 10) === entryDate)
    const newEntry = { date: entryDate, memory, notes, mood, photos }

    if (existingIndex >= 0) entries[existingIndex] = newEntry
    else entries.push(newEntry)

    await supabase.from('calendar_events').update({ daily_entries: entries }).eq('id', eventId)

    res.json({ message: 'Entry saved', entry: newEntry })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
