import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -securityPassphraseHash');
    if (!user) {
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
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -securityPassphraseHash');

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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if mode is locked
    if (user.modeLocked) {
      return res.status(403).json({ 
        message: 'Mode cannot be changed. Please logout and register with a new account to change mode.',
        modeLocked: true 
      });
    }

    user.modeDefault = mode;
    await user.save();

    res.json({ user: user.toObject() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle private mode
router.post('/private-mode', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { privateMode: enabled === true },
      { new: true }
    ).select('-password -securityPassphraseHash');

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Set security passphrase
router.post('/security-passphrase', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { passphrase } = req.body;
    if (!passphrase || passphrase.length < 8) {
      return res.status(400).json({ message: 'Passphrase must be at least 8 characters' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { securityPassphraseHash: passphrase },
      { new: true }
    ).select('-password');

    res.json({ message: 'Security passphrase set successfully' });
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

    const user = await User.findByIdAndUpdate(
      req.userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    ).select('-password -securityPassphraseHash');

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

