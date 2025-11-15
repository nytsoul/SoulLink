import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import ConsentRecord from '../models/ConsentRecord';
import Verification from '../models/Verification';

const router = express.Router();

// Get blockchain records for user
router.get('/records', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const consents = await ConsentRecord.find({
      userId: req.userId,
      onChainTxHash: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    const verifications = await Verification.find({
      userId: req.userId,
      onChainTxHash: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    res.json({
      consents: consents.map((c) => ({
        type: c.consentType,
        hash: c.consentHash,
        txHash: c.onChainTxHash,
        timestamp: c.createdAt,
      })),
      verifications: verifications.map((v) => ({
        type: v.type,
        hash: v.proofHash,
        txHash: v.onChainTxHash,
        timestamp: v.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Verify on-chain record
router.get('/verify/:txHash', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { txHash } = req.params;

    // In production, query blockchain here
    // For now, check if record exists in DB
    const consent = await ConsentRecord.findOne({ onChainTxHash: txHash, userId: req.userId });
    const verification = await Verification.findOne({ onChainTxHash: txHash, userId: req.userId });

    if (!consent && !verification) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      verified: true,
      record: consent || verification,
      txHash,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

