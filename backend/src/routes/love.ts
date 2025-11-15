import express, { Response } from 'express';
import OpenAI from 'openai';
import LoveLetter from '../models/LoveLetter';
import MoodEntry from '../models/MoodTracker';
import SurpriseDrop from '../models/SurpriseDrop';
import SecretGift from '../models/SecretGift';
import { authenticate, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  try {
    return new OpenAI({ apiKey });
  } catch {
    return null;
  }
};

const openai = getOpenAIClient();
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
});

// Love Letter Generator
router.post('/letter', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { keywords, recipientName, mode = 'love', tone = 'romantic' } = req.body;

    if (!openai) {
      const fallback = `Dear ${recipientName || 'Beloved'},\n\n${keywords?.join(', ') || 'Thinking of you'} fills my heart with joy.\n\nWith love,\nYou`;
      return res.json({ letter: fallback, mode });
    }

    const prompt = `Write a ${mode === 'love' ? 'romantic' : 'warm friendship'} letter${recipientName ? ` to ${recipientName}` : ''}${keywords ? ` incorporating these themes: ${keywords.join(', ')}` : ''} with a ${tone} tone. Make it personal and heartfelt.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a romantic letter writer. Create heartfelt, personal letters.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content || '';

    const letter = new LoveLetter({
      userId: req.userId,
      title: `Letter to ${recipientName || 'Special Someone'}`,
      content,
      keywords: keywords || [],
      mode,
    });
    await letter.save();

    res.json({ letter: letter.toObject() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get love letters
router.get('/letters', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const letters = await LoveLetter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ letters });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send love letter
router.post('/letters/:id/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const letter = await LoveLetter.findOne({ _id: req.params.id, userId: req.userId });
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    letter.recipientId = recipientId;
    letter.isSent = true;
    letter.sentAt = new Date();
    await letter.save();

    res.json({ letter });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mood Tracker - Log mood
router.post('/mood', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mood, notes, partnerId } = req.body;
    const entry = new MoodEntry({
      userId: req.userId,
      partnerId,
      mood,
      notes,
    });
    await entry.save();

    // Get AI suggestion if both partners have entries
    let suggestion = null;
    if (partnerId && openai) {
      const partnerEntry = await MoodEntry.findOne({
        userId: partnerId,
        date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).sort({ createdAt: -1 });

      if (partnerEntry) {
        const prompt = `User mood: ${mood}, Partner mood: ${partnerEntry.mood}. Suggest an activity or message to help them connect.`;
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        });
        suggestion = completion.choices[0]?.message?.content;
      }
    }

    res.json({ entry, suggestion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mood history
router.get('/mood', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const query: any = {
      $or: [{ userId: req.userId }, { partnerId: req.userId }],
      date: { $gte: startDate },
    };

    const entries = await MoodEntry.find(query).sort({ date: -1 });
    res.json({ entries });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Surprise Drop - Create
router.post('/surprise', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, content, mediaUrl, scheduledFor, recipientId, countdownMessage } = req.body;

    const surprise = new SurpriseDrop({
      userId: req.userId,
      recipientId,
      type,
      title,
      content,
      mediaUrl,
      scheduledFor: new Date(scheduledFor),
      countdownMessage,
    });
    await surprise.save();

    res.status(201).json({ surprise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get surprise drops
router.get('/surprise', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { upcoming = true } = req.query;
    const query: any = {
      $or: [{ userId: req.userId }, { recipientId: req.userId }],
    };

    if (upcoming === 'true') {
      query.scheduledFor = { $gte: new Date() };
      query.isUnlocked = false;
    }

    const surprises = await SurpriseDrop.find(query).sort({ scheduledFor: 1 });
    res.json({ surprises });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Unlock surprise
router.post('/surprise/:id/unlock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const surprise = await SurpriseDrop.findOne({
      _id: req.params.id,
      $or: [{ userId: req.userId }, { recipientId: req.userId }],
    });

    if (!surprise) return res.status(404).json({ message: 'Surprise not found' });
    if (new Date() < surprise.scheduledFor) {
      return res.status(400).json({ message: 'Surprise not yet available' });
    }

    surprise.isUnlocked = true;
    surprise.unlockedAt = new Date();
    await surprise.save();

    res.json({ surprise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Secret Gift - Create
router.post('/gift', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, title, type, content, mediaUrl, clues, triviaQuestions, maxAttempts = 3 } = req.body;

    const gift = new SecretGift({
      userId: req.userId,
      recipientId,
      title,
      type,
      content,
      mediaUrl,
      clues: clues || [],
      triviaQuestions: triviaQuestions || [],
      maxAttempts,
    });
    await gift.save();

    res.status(201).json({ gift });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Unlock secret gift
router.post('/gift/:id/unlock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { answer, clueAnswer } = req.body;
    const gift = await SecretGift.findOne({
      _id: req.params.id,
      recipientId: req.userId,
      isUnlocked: false,
    });

    if (!gift) return res.status(404).json({ message: 'Gift not found or already unlocked' });
    if (gift.attempts >= gift.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    gift.attempts += 1;

    // Check answer
    let isCorrect = false;
    if (answer && gift.triviaQuestions && gift.triviaQuestions.length > 0) {
      isCorrect = gift.triviaQuestions.some(q => q.answer.toLowerCase() === answer.toLowerCase());
    } else if (clueAnswer && gift.clues.length > 0) {
      // Simple clue matching (can be enhanced)
      isCorrect = true; // For now, accept any answer
    }

    if (isCorrect) {
      gift.isUnlocked = true;
      gift.unlockedAt = new Date();
    }

    await gift.save();

    res.json({ gift, isCorrect, attemptsRemaining: gift.maxAttempts - gift.attempts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get secret gifts
router.get('/gift', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const gifts = await SecretGift.find({
      recipientId: req.userId,
      isUnlocked: false,
    }).sort({ createdAt: -1 });

    res.json({ gifts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


