import express, { Response } from 'express';
import OpenAI from 'openai';
import { supabase } from '../lib/supabaseClient';
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
    const { keywords, recipientName, recipientId, mode = 'love', tone = 'romantic' } = req.body;

    let content = `Dear ${recipientName || 'Beloved'},\n\n${keywords?.join(', ') || 'Thinking of you'}.\n\nWith love,\nYou`;

    if (openai) {
      const prompt = `Write a ${mode} letter to ${recipientName || 'someone'} about ${keywords?.join(', ') || 'love'} with ${tone} tone.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      content = completion.choices[0]?.message?.content || content;
    }

    const { data: letter, error } = await supabase
      .from('love_letters')
      .insert({
        user_id: req.userId,
        recipient_id: recipientId,
        title: `Letter to ${recipientName || 'Special Someone'}`,
        content,
        keywords: keywords || [],
        mode,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.json({ letter });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get love letters
router.get('/letters', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: letters, error } = await supabase
      .from('love_letters')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json({ letters });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send love letter
router.post('/letters/:id/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const { data: letter, error } = await supabase
      .from('love_letters')
      .update({ recipient_id: recipientId, is_sent: true, sent_at: new Date() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(404).json({ message: 'Letter not found' });
    res.json({ letter });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mood Tracker
router.post('/mood', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mood, notes, partnerId } = req.body;
    const { data: entry, error } = await supabase
      .from('mood_entries')
      .insert({ user_id: req.userId, partner_id: partnerId, mood, notes })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    let suggestion = null;
    if (partnerId && openai) {
      const { data: partnerEntry } = await supabase
        .from('mood_entries')
        .select('mood')
        .eq('user_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (partnerEntry) {
        const prompt = `User: ${mood}, Partner: ${partnerEntry.mood}. Suggest connection activity.`;
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
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
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const { data: entries, error } = await supabase
      .from('mood_entries')
      .select('*')
      .or(`user_id.eq.${req.userId},partner_id.eq.${req.userId}`)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json({ entries });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Surprise Drop
router.post('/surprise', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: surprise, error } = await supabase
      .from('surprise_drops')
      .insert({ ...req.body, user_id: req.userId })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json({ surprise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get surprises
router.get('/surprise', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: surprises, error } = await supabase
      .from('surprise_drops')
      .select('*')
      .or(`user_id.eq.${req.userId},recipient_id.eq.${req.userId}`)
      .order('scheduled_for', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });
    res.json({ surprises });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Unlock surprise
router.post('/surprise/:id/unlock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: surprise, error } = await supabase
      .from('surprise_drops')
      .update({ is_unlocked: true, unlocked_at: new Date() })
      .eq('id', req.params.id)
      .or(`user_id.eq.${req.userId},recipient_id.eq.${req.userId}`)
      .select()
      .single();

    if (error) return res.status(404).json({ message: 'Surprise not found' });
    res.json({ surprise });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Secret Gift
router.post('/gift', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: gift, error } = await supabase
      .from('secret_gifts')
      .insert({ ...req.body, user_id: req.userId })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json({ gift });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


