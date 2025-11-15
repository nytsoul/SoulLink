import express, { Response } from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search and match users
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      mode = 'love',
      minAge,
      maxAge,
      location,
      interests,
      gender,
      limit = 20,
      offset = 0,
    } = req.query;

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate age range
    const today = new Date();
    const maxDob = minAge ? new Date(today.getFullYear() - parseInt(minAge as string), today.getMonth(), today.getDate()) : null;
    const minDob = maxAge ? new Date(today.getFullYear() - parseInt(maxAge as string) - 1, today.getMonth(), today.getDate()) : null;

    // Build query - make email verification optional for development
    const query: any = {
      _id: { $ne: currentUser._id },
      modeDefault: mode || currentUser.modeDefault,
    };
    
    // Only require email verification in production
    if (process.env.NODE_ENV === 'production') {
      query.isEmailVerified = true;
    }

    if (minDob) query.dob = { ...query.dob, $lte: minDob };
    if (maxDob) query.dob = { ...query.dob, $gte: maxDob };
    if (location) query.location = new RegExp(location as string, 'i');
    if (gender) query.gender = gender;
    if (interests) {
      const interestArray = (interests as string).split(',').map(i => i.trim());
      query.interests = { $in: interestArray };
    }

    const users = await User.find(query)
      .select('-password -securityPassphraseHash')
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .sort({ createdAt: -1 });

    res.json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get match suggestions
router.get('/suggestions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple matching algorithm - show all users in same mode
    const query: any = {
      _id: { $ne: currentUser._id },
      modeDefault: currentUser.modeDefault,
    };
    
    // Only require email verification in production
    if (process.env.NODE_ENV === 'production') {
      query.isEmailVerified = true;
    }

    // If user has interests, prefer matching interests, but also show others
    let users;
    if (currentUser.interests && currentUser.interests.length > 0) {
      // First try to find users with matching interests
      const interestQuery = { ...query, interests: { $in: currentUser.interests } };
      users = await User.find(interestQuery)
        .select('-password -securityPassphraseHash')
        .limit(10)
        .sort({ createdAt: -1 });
      
      // If not enough matches, add users without matching interests
      if (users.length < 5) {
        const additionalUsers = await User.find({
          ...query,
          _id: { $nin: [currentUser._id, ...users.map(u => u._id)] },
        })
          .select('-password -securityPassphraseHash')
          .limit(10 - users.length)
          .sort({ createdAt: -1 });
        users = [...users, ...additionalUsers];
      }
    } else {
      // No interests, just show all users in same mode
      users = await User.find(query)
        .select('-password -securityPassphraseHash')
        .limit(10)
        .sort({ createdAt: -1 });
    }

    // Score matches (simple algorithm)
    const scoredUsers = users.map(user => {
      let score = 0;
      if (user.location === currentUser.location) score += 10;
      const commonInterests = user.interests.filter(i => currentUser.interests.includes(i));
      score += commonInterests.length * 5;
      return { ...user.toObject(), matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ suggestions: scoredUsers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

