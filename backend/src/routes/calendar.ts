import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import CalendarEvent from '../models/CalendarEvent';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI (optional)
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    return null;
  }
};

const openai = getOpenAIClient();

// Get calendar events
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query: any = { userId: req.userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    if (type) query.type = type;

    const events = await CalendarEvent.find(query)
      .populate('participants', 'name profilePhotos')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/upcoming', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();

    const events = await CalendarEvent.find({
      userId: req.userId,
      date: { $gte: now },
    })
      .populate('participants', 'name profilePhotos')
      .sort({ date: 1 })
      .limit(parseInt(limit as string));

    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// AI-powered event suggestions
router.post('/suggestions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', date, preferences, budget } = req.body;
    const user = await User.findById(req.userId);

    if (!openai) {
      // Fallback suggestions
      const fallbackSuggestions = mode === 'love'
        ? [
            { title: 'Romantic Dinner', type: 'date', description: 'A cozy dinner at a nice restaurant' },
            { title: 'Sunset Picnic', type: 'date', description: 'Picnic in the park during sunset' },
            { title: 'Museum Visit', type: 'date', description: 'Explore art and culture together' },
            { title: 'Cooking Class', type: 'date', description: 'Learn to cook a new cuisine together' },
            { title: 'Stargazing Night', type: 'date', description: 'Watch the stars together' },
          ]
        : [
            { title: 'Game Night', type: 'event', description: 'Board games and fun with friends' },
            { title: 'Hiking Adventure', type: 'event', description: 'Explore nature together' },
            { title: 'Concert', type: 'event', description: 'Enjoy live music' },
            { title: 'Food Tour', type: 'event', description: 'Try different restaurants' },
            { title: 'Movie Marathon', type: 'event', description: 'Watch favorite movies together' },
          ];

      return res.json({ suggestions: fallbackSuggestions });
    }

    const prompt = `Suggest 5 ${mode === 'love' ? 'romantic date' : 'friendship activity'} ideas${date ? ` for ${date}` : ''}${preferences ? ` based on: ${preferences}` : ''}${budget ? ` with a budget of ${budget}` : ''}. Return as JSON array with title, type, description, and suggestedDate fields.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an event planning assistant. Return only valid JSON arrays with event suggestions.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    let suggestions;
    try {
      const content = completion.choices[0]?.message?.content || '[]';
      suggestions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    } catch (parseError) {
      // Fallback
      suggestions = [
        { title: 'Special Event', type: 'event', description: 'A memorable experience together' },
      ];
    }

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Event suggestions error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate suggestions' });
  }
});

// Create event
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('type').isIn(['birthday', 'anniversary', 'date', 'event', 'reminder']).withMessage('Invalid event type'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, type, date, description, recurring, participants, reminder } = req.body;

      const event = new CalendarEvent({
        userId: req.userId,
        title,
        type,
        date: new Date(date),
        description,
        recurring,
        participants: participants || [],
        reminder: reminder || { enabled: false, minutesBefore: 60 },
      });

      await event.save();
      await event.populate('participants', 'name profilePhotos');

      res.status(201).json({ event });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create event from AI suggestion
router.post('/from-suggestion', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, date, description, reminder } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const event = new CalendarEvent({
      userId: req.userId,
      title,
      type: type || 'event',
      date: new Date(date),
      description,
      reminder: reminder || { enabled: true, minutesBefore: 60 },
    });

    await event.save();
    await event.populate('participants', 'name profilePhotos');

    res.status(201).json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updates = req.body;
    if (updates.date) updates.date = new Date(updates.date);

    Object.assign(event, updates);
    await event.save();
    await event.populate('participants', 'name profilePhotos');

    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Export calendar (ICS format)
router.get('/export', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const events = await CalendarEvent.find({ userId: req.userId });

    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Loves Platform//EN\n';
    events.forEach((event) => {
      ics += `BEGIN:VEVENT\n`;
      ics += `DTSTART:${event.date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ics += `SUMMARY:${event.title}\n`;
      if (event.description) ics += `DESCRIPTION:${event.description}\n`;
      ics += `END:VEVENT\n`;
    });
    ics += 'END:VCALENDAR\n';

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="loves-calendar.ics"');
    res.send(ics);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get events statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const total = await CalendarEvent.countDocuments({ userId: req.userId });
    const upcoming = await CalendarEvent.countDocuments({
      userId: req.userId,
      date: { $gte: new Date() },
    });
    const past = await CalendarEvent.countDocuments({
      userId: req.userId,
      date: { $lt: new Date() },
    });

    const byType = await CalendarEvent.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      upcoming,
      past,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
