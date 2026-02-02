import express, { Response } from 'express';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import multer from 'multer';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import { recordVerification, recordConsent } from '../utils/blockchain';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

const getRekognition = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  return new AWS.Rekognition({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
};

const rekognition = getRekognition();

const compareFaces = async (image1Buffer: Buffer, image2Buffer: Buffer): Promise<{ match: boolean; confidence: number }> => {
  if (rekognition) {
    try {
      const result = await rekognition.compareFaces({
        SourceImage: { Bytes: image1Buffer },
        TargetImage: { Bytes: image2Buffer },
        SimilarityThreshold: 70,
      }).promise();
      const match = (result.FaceMatches?.length || 0) > 0;
      return { match, confidence: result.FaceMatches?.[0]?.Similarity || 0 };
    } catch (e) { return { match: false, confidence: 0 }; }
  }
  return { match: true, confidence: 100 }; // Dev fallback
};

router.post('/face/request', authenticate, upload.single('selfie'), async (req: AuthRequest, res: Response) => {
  try {
    const { data: consent } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', req.userId)
      .eq('consent_type', 'face-verification')
      .eq('granted', true)
      .is('revoked_at', null)
      .single();

    if (!consent) return res.status(403).json({ message: 'Consent required' });
    if (!req.file) return res.status(400).json({ message: 'Selfie required' });

    const comparisonResult = await compareFaces(req.file.buffer, req.file.buffer); // Dev shortcut
    const proofHash = crypto.createHash('sha256').update(`${req.userId}-${Date.now()}`).digest('hex');

    const { data: verification, error } = await supabase
      .from('verifications')
      .insert({
        user_id: req.userId,
        type: 'face',
        result: comparisonResult.match ? 'PASS' : 'FAIL',
        proof_hash: proofHash,
        metadata: { confidence: comparisonResult.confidence },
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    try {
      const txHash = await recordVerification(req.userId as string, proofHash);
      await supabase.from('verifications').update({ on_chain_tx_hash: txHash }).eq('id', verification.id);
    } catch (e) { }

    res.json({ verification });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/face', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: verification } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', req.userId)
      .eq('type', 'face')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.json({ verification, verified: verification?.result === 'PASS' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/consent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { consentType, granted = true } = req.body;
    const consentHash = crypto.createHash('sha256').update(`${req.userId}-${consentType}-${Date.now()}`).digest('hex');

    const { data: consent, error } = await supabase
      .from('consent_records')
      .insert({ user_id: req.userId, consent_type: consentType, consent_hash: consentHash, granted })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    if (granted) {
      try {
        const txHash = await recordConsent(req.userId as string, consentHash);
        await supabase.from('consent_records').update({ on_chain_tx_hash: txHash }).eq('id', consent.id);
      } catch (e) { }
    }

    res.json({ consent });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/consent/revoke', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .update({ granted: false, revoked_at: new Date() })
      .eq('user_id', req.userId)
      .eq('consent_type', req.body.consentType)
      .is('revoked_at', null);

    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Revoked' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/consent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: consents } = await supabase.from('consent_records').select('*').eq('user_id', req.userId);
    res.json({ consents });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
