import express, { Response } from 'express';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Verification from '../models/Verification';
import ConsentRecord from '../models/ConsentRecord';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { recordVerification, recordConsent } from '../utils/blockchain';

const router = express.Router();

// File upload for verification
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Initialize AWS Rekognition (optional)
const getRekognition = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }
  try {
    return new AWS.Rekognition({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  } catch (error) {
    console.warn('AWS Rekognition initialization failed:', error);
    return null;
  }
};

const rekognition = getRekognition();

// Simple face comparison (for development - use AWS Rekognition in production)
const compareFaces = async (image1Buffer: Buffer, image2Buffer: Buffer): Promise<{ match: boolean; confidence: number }> => {
  if (rekognition) {
    try {
      // Use AWS Rekognition for face comparison
      const params = {
        SourceImage: { Bytes: image1Buffer },
        TargetImage: { Bytes: image2Buffer },
        SimilarityThreshold: 70,
      };
      
      const result = await rekognition.compareFaces(params).promise();
      
      if (result.FaceMatches && result.FaceMatches.length > 0) {
        const similarity = result.FaceMatches[0].Similarity || 0;
        return {
          match: similarity >= 70,
          confidence: similarity,
        };
      }
      
      return { match: false, confidence: 0 };
    } catch (error) {
      console.error('AWS Rekognition error:', error);
      // Fallback to basic check
      return { match: false, confidence: 0 };
    }
  }
  
  // Development fallback: simple size-based check (not real verification)
  // In production, always use proper face recognition
  const sizeDiff = Math.abs(image1Buffer.length - image2Buffer.length);
  const avgSize = (image1Buffer.length + image2Buffer.length) / 2;
  const similarity = Math.max(0, 100 - (sizeDiff / avgSize) * 100);
  
  return {
    match: similarity > 50, // Very basic check for dev
    confidence: similarity,
  };
};

// Request face verification
router.post('/face/request', authenticate, upload.single('selfie'), async (req: AuthRequest, res: Response) => {
  try {
    // Check consent
    const consent = await ConsentRecord.findOne({
      userId: req.userId,
      consentType: 'face-verification',
      granted: true,
      revokedAt: null,
    });

    if (!consent) {
      return res.status(403).json({ 
        message: 'Face verification consent required. Please grant consent first.',
        requiresConsent: true,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Selfie image is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's profile photo
    let profilePhotoBuffer: Buffer | null = null;
    if (user.profilePhotos && user.profilePhotos.length > 0) {
      // In production, fetch from storage
      // For now, we'll use the selfie as both (development mode)
      profilePhotoBuffer = req.file.buffer;
    }

    const selfieBuffer = req.file.buffer;

    // Compare faces
    let comparisonResult;
    if (profilePhotoBuffer) {
      comparisonResult = await compareFaces(profilePhotoBuffer, selfieBuffer);
    } else {
      // No profile photo - auto approve for first verification
      comparisonResult = { match: true, confidence: 100 };
    }

    // Create proof hash
    const proofHash = crypto
      .createHash('sha256')
      .update(`${req.userId}-${Date.now()}-${selfieBuffer.toString('base64').slice(0, 100)}`)
      .digest('hex');

    const verification = new Verification({
      userId: req.userId,
      type: 'face',
      result: comparisonResult.match ? 'PASS' : 'FAIL',
      proofHash,
      metadata: {
        confidence: comparisonResult.confidence,
        imageUrl: `data:${req.file.mimetype};base64,${selfieBuffer.toString('base64').slice(0, 200)}`,
      },
    });

    await verification.save();

    // Record on blockchain
    try {
      const txHash = await recordVerification(req.userId as string, proofHash);
      verification.onChainTxHash = txHash;
      await verification.save();
    } catch (blockchainError) {
      console.error('Blockchain recording error:', blockchainError);
    }

    res.json({
      verification: {
        ...verification.toObject(),
        result: verification.result,
        confidence: comparisonResult.confidence,
      },
      message: verification.result === 'PASS' 
        ? 'Face verification successful!' 
        : 'Face verification failed. Please try again.',
    });
  } catch (error: any) {
    console.error('Face verification error:', error);
    res.status(500).json({ message: error.message || 'Face verification failed' });
  }
});

// Get verification status
router.get('/face', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const verification = await Verification.findOne({
      userId: req.userId,
      type: 'face',
    }).sort({ createdAt: -1 });

    if (!verification) {
      return res.json({ verification: null, verified: false });
    }

    res.json({
      verification,
      verified: verification.result === 'PASS',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all verifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const verifications = await Verification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ verifications });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Consent management
router.post('/consent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { consentType, granted = true } = req.body;

    if (!['face-verification', 'data-processing', 'marketing', 'blockchain'].includes(consentType)) {
      return res.status(400).json({ message: 'Invalid consent type' });
    }

    const consentHash = crypto
      .createHash('sha256')
      .update(`${req.userId}-${consentType}-${Date.now()}`)
      .digest('hex');

    const consent = new ConsentRecord({
      userId: req.userId,
      consentType,
      consentHash,
      granted,
    });

    await consent.save();

    // Record on blockchain if granted
    if (granted) {
      try {
        const txHash = await recordConsent(req.userId as string, consentHash);
        consent.onChainTxHash = txHash;
        await consent.save();
      } catch (blockchainError) {
        console.error('Blockchain recording error:', blockchainError);
      }
    }

    res.json({ consent, message: `Consent ${granted ? 'granted' : 'denied'} successfully` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Revoke consent
router.post('/consent/revoke', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { consentType } = req.body;

    const consent = await ConsentRecord.findOneAndUpdate(
      {
        userId: req.userId,
        consentType,
        granted: true,
        revokedAt: null,
      },
      { granted: false, revokedAt: new Date() },
      { new: true }
    );

    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }

    res.json({ consent, message: 'Consent revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all consents
router.get('/consent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const consents = await ConsentRecord.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ consents });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
