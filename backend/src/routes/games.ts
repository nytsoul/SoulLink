import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get available games
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love' } = req.query;

    const games = [
      {
        id: 'compatibility-quiz',
        name: 'Compatibility Quiz',
        description: mode === 'love' ? 'Test your romantic compatibility' : 'Test your friendship compatibility',
        mode: 'both',
      },
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

    // Simple game questions (in production, use AI or database)
    const questionSets: Record<string, any[]> = {
      'would-you-rather': [
        { question: 'Would you rather go on a beach vacation or mountain adventure?', options: ['Beach', 'Mountain'] },
        { question: 'Would you rather have dinner at a fancy restaurant or cook together at home?', options: ['Restaurant', 'Home'] },
        { question: 'Would you rather watch a movie or go for a walk?', options: ['Movie', 'Walk'] },
      ],
      'truth-or-dare': [
        { question: 'What is your biggest fear?', type: 'truth' },
        { question: 'Dare: Send a funny selfie', type: 'dare' },
        { question: 'What is your most embarrassing moment?', type: 'truth' },
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

    // Store game result (create GameResult model if needed)
    res.json({
      message: 'Game result saved',
      gameId,
      score,
      participantId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

