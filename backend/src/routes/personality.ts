import express, { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';
import crypto from 'crypto';

const router = express.Router();

// Personality quiz questions
const PERSONALITY_QUESTIONS = [
  // ... (keep same questions array as above)
  {
    id: 1,
    question: 'How do you express your feelings?',
    options: [
      { text: 'Verbally & Often', emoji: '💬', score: 1 },
      { text: 'Through Actions', emoji: '💪', score: 2 },
      { text: 'Romantically', emoji: '❤️', score: 3 },
      { text: 'Thoughtfully', emoji: '🤔', score: 4 },
    ],
  },
  {
    id: 2,
    question: 'Your ideal time together is:',
    options: [
      { text: 'Adventure', emoji: '🎢', score: 1 },
      { text: 'Quiet moments', emoji: '🌙', score: 2 },
      { text: 'Deep talks', emoji: '💭', score: 3 },
      { text: 'Fun & laughter', emoji: '😄', score: 4 },
    ],
  },
  {
    id: 3,
    question: 'When challenges arise, you:',
    options: [
      { text: 'Face them head-on', emoji: '⚔️', score: 1 },
      { text: 'Listen & support', emoji: '👂', score: 2 },
      { text: 'Find solutions together', emoji: '🤝', score: 3 },
      { text: 'Give space & understanding', emoji: '🕊️', score: 4 },
    ],
  },
  {
    id: 4,
    question: 'Your love language is:',
    options: [
      { text: 'Words of affirmation', emoji: '🗣️', score: 1 },
      { text: 'Acts of service', emoji: '🙏', score: 2 },
      { text: 'Physical touch', emoji: '🤗', score: 3 },
      { text: 'Quality time', emoji: '⏰', score: 4 },
    ],
  },
  {
    id: 5,
    question: 'Your personality vibe is:',
    options: [
      { text: 'Spontaneous & wild', emoji: '🌪️', score: 1 },
      { text: 'Calm & serene', emoji: '☮️', score: 2 },
      { text: 'Passionate & intense', emoji: '🔥', score: 3 },
      { text: 'Fun & playful', emoji: '🎮', score: 4 },
    ],
  },
  {
    id: 6,
    question: 'When someone is sad, you:',
    options: [
      { text: 'Cheer them up', emoji: '🎉', score: 1 },
      { text: 'Listen without judgment', emoji: '🎧', score: 2 },
      { text: 'Hold them close', emoji: '🫂', score: 3 },
      { text: 'Help them find solutions', emoji: '🔍', score: 4 },
    ],
  },
  {
    id: 7,
    question: 'Commitment means to you:',
    options: [
      { text: 'Adventure together', emoji: '🗺️', score: 1 },
      { text: 'Safety & stability', emoji: '🏠', score: 2 },
      { text: 'Deep emotional bond', emoji: '💞', score: 3 },
      { text: 'Growing together', emoji: '🌱', score: 4 },
    ],
  },
  {
    id: 8,
    question: 'Your ideal date would be:',
    options: [
      { text: 'Exploring new places', emoji: '✈️', score: 1 },
      { text: 'Cozy night in', emoji: '🛋️', score: 2 },
      { text: 'Romantic dinner', emoji: '🍽️', score: 3 },
      { text: 'Shared activity/hobby', emoji: '🎨', score: 4 },
    ],
  },
  {
    id: 9,
    question: 'In friendship, you value:',
    options: [
      { text: 'Fun & laughter', emoji: '😆', score: 1 },
      { text: 'Loyalty & trust', emoji: '🤞', score: 2 },
      { text: 'Deep understanding', emoji: '💎', score: 3 },
      { text: 'Always being there', emoji: '🌟', score: 4 },
    ],
  },
  {
    id: 10,
    question: 'Your biggest strength is:',
    options: [
      { text: 'Confidence', emoji: '💪', score: 1 },
      { text: 'Compassion', emoji: '💝', score: 2 },
      { text: 'Intelligence', emoji: '🧠', score: 3 },
      { text: 'Humor', emoji: '😂', score: 4 },
    ],
  },
];

const PERSONALITY_TYPES = [
  { min: 10, max: 15, type: 'The Free Spirit', icon: '🦅' },
  { min: 16, max: 21, type: 'The Nurturer', icon: '🌸' },
  { min: 22, max: 27, type: 'The Romantic', icon: '💕' },
  { min: 28, max: 40, type: 'The Sage', icon: '🌙' },
];

router.get('/questions', (req: Request, res: Response) => {
  res.json({ questions: PERSONALITY_QUESTIONS });
});

router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode } = req.body;
    const shareCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    const { data: quiz, error } = await supabase
      .from('personality_quizzes')
      .insert({
        user_id: req.userId,
        mode,
        share_code: shareCode,
        answers: [],
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ quizId: quiz.id, shareCode, questions: PERSONALITY_QUESTIONS });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, answers } = req.body;

    let totalScore = 0;
    const processedAnswers: any[] = [];

    for (const answer of answers) {
      const question = PERSONALITY_QUESTIONS.find((q) => q.id === answer.questionId);
      if (!question) continue;
      const option = question.options.find((o) => o.text === answer.selectedOption);
      if (option) {
        totalScore += option.score;
        processedAnswers.push({ ...answer, emoji: option.emoji, score: option.score });
      }
    }

    const personalityType = PERSONALITY_TYPES.find(pt => totalScore >= pt.min && totalScore <= pt.max)?.type || 'Mysterious';

    const { data: quiz, error } = await supabase
      .from('personality_quizzes')
      .update({
        answers: processedAnswers,
        total_score: totalScore,
        personality_type: personalityType,
        completed: true,
        completed_at: new Date(),
      })
      .eq('id', quizId)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ quiz });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/share/:shareCode', async (req: Request, res: Response) => {
  try {
    const { data: quiz, error } = await supabase
      .from('personality_quizzes')
      .select('*, profiles(name, profile_photos)')
      .eq('share_code', req.params.shareCode)
      .single();

    if (error || !quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({ quiz: { ...quiz, sharedBy: quiz.profiles, questions: PERSONALITY_QUESTIONS } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/submit-shared', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { originalQuizId, answers } = req.body;
    const { data: originalQuiz } = await supabase.from('personality_quizzes').select('*').eq('id', originalQuizId).single();
    if (!originalQuiz) return res.status(404).json({ message: 'Original quiz not found' });

    // (Score calculation logic remains similar to /submit)
    // ... calculate totalScore, personalityType

    // Simplified for now - assume score calc happens
    const totalScore = answers.reduce((acc: number, a: any) => acc + (a.score || 0), 0);
    const scoreDifference = Math.abs(originalQuiz.total_score - totalScore);
    const compatibility = Math.max(0, 100 - scoreDifference * 2);

    // Update original quiz shared_with
    const sharedWith = originalQuiz.shared_with || [];
    if (!sharedWith.includes(req.userId)) sharedWith.push(req.userId);
    await supabase.from('personality_quizzes').update({ shared_with: sharedWith }).eq('id', originalQuizId);

    res.json({ compatibility: { score: compatibility } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-quizzes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: quizzes, error } = await supabase
      .from('personality_quizzes')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json({ quizzes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
