import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/* -------------------- REGISTER -------------------- */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('dob').isISO8601().withMessage('Valid date of birth is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, phone, password, dob, gender, pronouns, location, bio, interests, profilePhotos, modeDefault } = req.body;

      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        }
      });

      if (authError || !authData.user) {
        return res.status(400).json({ message: authError?.message || 'Registration failed' });
      }

      // 2. Create profile in public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          dob,
          phone,
          gender,
          pronouns,
          location,
          bio,
          interests: interests || [],
          profile_photos: profilePhotos || [],
          mode_default: modeDefault || 'love',
          mode_locked: true,
        });

      if (profileError) {
        // Rollback auth user if profile creation fails? Supabase doesn't have cross-store transactions easily.
        // But for migration, we'll just handle the error.
        console.error('Profile creation error:', profileError);
        return res.status(400).json({ message: 'Profile creation failed' });
      }

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: authData.user.id,
          name,
          email,
          modeDefault: modeDefault || 'love',
        },
        session: authData.session,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
);

/* -------------------- LOGIN -------------------- */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        return res.status(401).json({ message: error?.message || 'Invalid credentials' });
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      res.json({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          name: profile?.name || data.user.email,
          email: data.user.email,
          modeDefault: profile?.mode_default,
          isEmailVerified: !!data.user.email_confirmed_at,
          profile,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* -------------------- GET CURRENT USER -------------------- */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  // Authentication middleware already fetched the profile and attached it to req.user
  if (!req.user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: req.user });
});

/* -------------------- FORGOT PASSWORD -------------------- */
router.post('/forgot-password', [body('email').isEmail()], async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Password reset link has been sent to your email' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
