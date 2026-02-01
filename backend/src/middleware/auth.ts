import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types/AuthRequest';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Exclude sensitive fields
    const { password, securityPassphraseHash, ...userWithoutSensitive } = user;

    req.userId = decoded.userId;
    req.user = userWithoutSensitive;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (user) {
        // Exclude sensitive fields
        const { password, securityPassphraseHash, ...userWithoutSensitive } = user;

        req.userId = decoded.userId;
        req.user = userWithoutSensitive;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export type { AuthRequest } from '../types/AuthRequest';

