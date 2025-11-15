import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { generateOTP, sendSMSOTP, storeOTP, verifyOTP } from '../utils/otp';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register
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
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, password, dob, gender, pronouns, location, bio, interests, profilePhotos, modeDefault } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }

      // Create user
      const user = new User({
        name,
        email,
        phone,
        password,
        dob,
        gender,
        pronouns,
        location,
        bio,
        interests: interests || [],
        profilePhotos: profilePhotos || [],
        modeDefault: modeDefault || 'love',
        modeLocked: true, // Lock mode after registration
      });

      await user.save();

      // Generate verification tokens
      const emailToken = crypto.randomBytes(32).toString('hex');
      const phoneOTP = generateOTP();

      // Store tokens
      storeOTP(`email:${user._id}`, emailToken, 1440); // 24 hours
      storeOTP(`phone:${user._id}`, phoneOTP, 10); // 10 minutes

      // Send verification
      await sendVerificationEmail(user.email, emailToken);
      await sendSMSOTP(user.phone, phoneOTP);

      // Generate JWT
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured in .env');
        return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
      }

      const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      res.status(201).json({
        message: 'Registration successful. Please verify your email and phone.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          modeDefault: user.modeDefault,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
);

// Verify Email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.body.userId;

    if (!token || !userId) {
      return res.status(400).json({ message: 'Token and userId are required' });
    }

    const stored = (global as any).otpStore?.get(`email:${userId}`);
    if (!stored || stored.otp !== token || Date.now() > stored.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Phone
router.post('/verify-phone', async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'UserId and OTP are required' });
    }

    if (!verifyOTP(`phone:${userId}`, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPhoneVerified = true;
    await user.save();

    res.json({ message: 'Phone verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
      }

      const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      const refreshToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      });

      res.json({
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          modeDefault: user.modeDefault,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Refresh Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Forgot Password
router.post('/forgot-password', [body('email').isEmail()], async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    storeOTP(`reset:${user._id}`, resetToken, 60); // 1 hour

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, userId, newPassword } = req.body;

    if (!token || !userId || !newPassword) {
      return res.status(400).json({ message: 'Token, userId, and newPassword are required' });
    }

    if (!verifyOTP(`reset:${userId}`, token)) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password -securityPassphraseHash');
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

