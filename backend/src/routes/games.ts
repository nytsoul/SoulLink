import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Get available games
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love' } = req.query;

    const games = [
      {
        id: 'would-you-rather',
        name: 'Would You Rather',
        description: 'Fun questions to get to know each other',
        mode: 'both',
      },
      {
        id: 'truth-or-dare',
        name: 'Truth or Dare',
        description: mode === 'love' ? 'Romantic edition' : 'Friendship edition',
        mode: mode as string,
      },
      {
        id: 'love-language',
        name: 'Love Language Test',
        description: 'Discover your love language',
        mode: 'love',
      },
      {
        id: 'personality-match',
        name: 'Personality Match',
        description: 'See how your personalities align',
        mode: 'both',
      },
    ].filter((game) => game.mode === 'both' || game.mode === mode);

    res.json({ games });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get game questions
router.get('/:gameId/questions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const { mode = 'love' } = req.query;

    const questionSets: Record<string, any[]> = {
      'would-you-rather': [
        { question: 'Beach or mountain?', options: ['Beach', 'Mountain'] },
        { question: 'Restaurant or cook at home?', options: ['Restaurant', 'Home'] },
      ],
      'truth-or-dare': [
        { question: 'What is your biggest fear?', type: 'truth' },
        { question: 'Dare: Send a funny selfie', type: 'dare' },
      ],
    };

    const questions = questionSets[gameId] || [];
    res.json({ questions, gameId, mode });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Submit game result
router.post('/:gameId/result', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const { answers, score, participantId } = req.body;

    const { data: result, error } = await supabase
      .from('game_results')
      .insert({
        user_id: req.userId,
        game_id: gameId,
        score,
        answers,
        participant_id: participantId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.status(201).json({ message: 'Result saved', result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

