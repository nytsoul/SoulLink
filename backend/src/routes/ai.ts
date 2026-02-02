import express, { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = express.Router();

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) { return null; }
};

const model = getGeminiModel();
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// AI Poem
router.post('/poem', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (!model) return res.status(503).json({ message: 'AI not configured', poem: 'Roses are red...' });

    const { prompt, mode = 'love' } = req.body;
    const result = await model.generateContent(`Write a ${mode} poem about: ${prompt || 'love'}`);
    res.json({ poem: result.response.text(), mode });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// AI Quiz
router.post('/quiz', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', count = 5 } = req.body;
    let questions = [];

    if (model) {
      const prompt = `Generate ${count} ${mode} questions in JSON: [{"question": "...", "options": ["...", "..."], "type": "multiple-choice"}]`;
      const result = await model.generateContent(prompt);
      try {
        const text = result.response.text().replace(/```json|```/g, '').trim();
        questions = JSON.parse(text);
      } catch (e) { questions = []; }
    }

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({ creator_id: req.userId, title: `AI ${mode} Quiz`, mode })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    if (questions.length > 0) {
      await supabase.from('quiz_questions').insert(
        questions.map((q: any, i: number) => ({
          quiz_id: quiz.id,
          question_text: q.question,
          options: q.options || [],
          order_index: i
        }))
      );
    }

    res.json({ quiz });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Chatbot
router.post('/chatbot', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (!model) return res.status(503).json({ message: 'AI not configured' });
    const { message, mode = 'love' } = req.body;
    const result = await model.generateContent(`System: You are a ${mode} assistant. User: ${message}`);
    res.json({ response: result.response.text() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
