// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateOTP, sendSMSOTP, storeOTP, verifyOTP } from '../utils/otp';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Ensure env var exists and return it as string.
 * Throws if missing (so runtime error is explicit).
 */
function getEnv(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET' | 'JWT_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN'): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(`${key} is not set in environment`);
  }
  return v;
}

/** Interface for token payload we use */
interface MyTokenPayload extends JwtPayload {
  userId?: string;
}

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

      const existingUser = await User.findOne({
        $or: [
          { email },
          { phone }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }

      const user = await User.create({
        name,
        email,
        phone,
        password, // Password will be hashed by User model pre-save hook
        dob: new Date(dob),
        gender,
        pronouns,
        location,
        bio,
        interests: interests || [],
        profilePhotos: profilePhotos || [],
        modeDefault: modeDefault || 'love',
        modeLocked: true,
      });

      // Verification tokens
      const emailToken = crypto.randomBytes(32).toString('hex');
      const phoneOTP = generateOTP();

      storeOTP(`email:${user.id}`, emailToken, 1440); // 24 hours
      storeOTP(`phone:${user.id}`, phoneOTP, 10); // 10 minutes

      // Don't fail registration if email/sms fails in dev
      try {
        await sendVerificationEmail(user.email, emailToken);
        await sendSMSOTP(user.phone, phoneOTP);
      } catch (e) {
        console.error('Failed to send verification:', e);
      }

      // JWT creation
      const JWT_SECRET = getEnv('JWT_SECRET');
      const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

      const signOptions = { expiresIn: JWT_EXPIRES_IN } as unknown as SignOptions;
      const token = jwt.sign({ userId: user.id }, JWT_SECRET as Secret, signOptions);

      res.status(201).json({
        message: 'Registration successful. Please verify your email and phone.',
        token,
        user: {
          id: user.id,
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

/* -------------------- VERIFY EMAIL -------------------- */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    if (!token || !userId) return res.status(400).json({ message: 'Token and userId are required' });

    if (!verifyOTP(`email:${userId}`, token)) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Email verified successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* -------------------- VERIFY PHONE -------------------- */
router.post('/verify-phone', async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'UserId and OTP are required' });

    if (!verifyOTP(`phone:${userId}`, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findByIdAndUpdate(userId, { isPhoneVerified: true }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Phone verified successfully', user: { id: user.id, name: user.name, phone: user.phone } });
  } catch (error: any) {
    console.error('Verify phone error:', error);
    res.status(500).json({ message: error.message });
  }
});

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
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const JWT_SECRET = getEnv('JWT_SECRET');
      const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
      const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';
      const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

      const signOptions = { expiresIn: JWT_EXPIRES_IN } as unknown as SignOptions;
      const refreshSignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN } as unknown as SignOptions;

      const token = jwt.sign({ userId: user.id }, JWT_SECRET as Secret, signOptions);
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET as Secret, refreshSignOptions);

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          modeDefault: user.modeDefault,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* -------------------- REFRESH TOKEN -------------------- */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
    const JWT_SECRET = getEnv('JWT_SECRET');
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as Secret) as MyTokenPayload | string;

    let userId: string | undefined;
    if (typeof decoded === 'object' && decoded !== null) {
      userId = decoded.userId ? String(decoded.userId) : undefined;
    }

    if (!userId) {
      return res.status(401).json({ message: 'Invalid refresh token payload' });
    }

    const signOptions = { expiresIn: JWT_EXPIRES_IN } as unknown as SignOptions;
    const newToken = jwt.sign({ userId }, JWT_SECRET as Secret, signOptions);
    res.json({ token: newToken });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/* -------------------- FORGOT PASSWORD -------------------- */
router.post('/forgot-password', [body('email').isEmail()], async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // don't reveal existence
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    storeOTP(`reset:${user.id}`, resetToken, 60); // 1 hour

    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* -------------------- RESET PASSWORD -------------------- */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, userId, newPassword } = req.body;
    if (!token || !userId || !newPassword) return res.status(400).json({ message: 'Token, userId, and newPassword are required' });

    if (!verifyOTP(`reset:${userId}`, token)) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* -------------------- GET CURRENT USER -------------------- */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // authenticate middleware must set req.userId as string
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Exclude sensitive fields
    const { password, securityPassphraseHash, ...userWithoutSensitive } = user;

    res.json({ user: userWithoutSensitive });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
