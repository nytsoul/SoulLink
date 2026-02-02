import express, { Response } from 'express';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get records
router.get('/records', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: consents } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', req.userId)
      .not('on_chain_tx_hash', 'is', null)
      .order('created_at', { ascending: false });

    const { data: verifications } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', req.userId)
      .not('on_chain_tx_hash', 'is', null)
      .order('created_at', { ascending: false });

    res.json({
      consents: consents?.map((c: any) => ({ type: c.consent_type, hash: c.consent_hash, txHash: c.on_chain_tx_hash, timestamp: c.created_at })),
      verifications: verifications?.map((v: any) => ({ type: v.type, hash: v.proof_hash, txHash: v.on_chain_tx_hash, timestamp: v.created_at })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Verify tx
router.get('/verify/:txHash', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { txHash } = req.params;
    const { data: consent } = await supabase.from('consent_records').select('*').eq('on_chain_tx_hash', txHash).eq('user_id', req.userId).single();
    const { data: verification } = await supabase.from('verifications').select('*').eq('on_chain_tx_hash', txHash).eq('user_id', req.userId).single();

    if (!consent && !verification) return res.status(404).json({ message: 'Record not found' });
    res.json({ verified: true, record: consent || verification, txHash });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

