import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 500 }),
    body('location').optional().trim(),
    body('interests').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = req.body;
      const { data: user, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.userId)
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Set mode default (only allowed if not locked)
router.post('/mode', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode } = req.body;
    if (!['love', 'friends'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' });
    }

    // Check if mode is locked
    if (req.user.mode_locked) {
      return res.status(403).json({
        message: 'Mode cannot be changed. Please logout and register with a new account to change mode.',
        modeLocked: true
      });
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update({ mode_default: mode })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle private mode
router.post('/private-mode', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ private_mode: enabled === true })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Link wallet
router.post('/wallet', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress.toLowerCase() })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

