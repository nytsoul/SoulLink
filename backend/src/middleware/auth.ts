import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    // Fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      res.status(401).json({ message: 'User profile not found' });
      return;
    }

    req.userId = authUser.id;
    req.user = profile;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
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
      const { data: { user: authUser } } = await supabase.auth.getUser(token);

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          req.userId = authUser.id;
          req.user = profile;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export type { AuthRequest } from '../types/AuthRequest';

