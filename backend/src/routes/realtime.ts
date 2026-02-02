import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'photobooth');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `pb-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Photo Booth
router.post('/photobooth', authenticate, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Photo required' });

    const { data: item, error } = await supabase
      .from('memories')
      .insert({
        user_id: req.userId,
        url: req.file.filename,
        media_type: 'photo',
        title: req.body.title || 'Photo Booth',
        tags: req.body.tags?.split(',') || ['photobooth'],
      })
      .select()
      .single();

    if (error) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: error.message });
    }

    res.json({ item });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Emotion detection (placeholder logic)
router.post('/emotion', authenticate, async (req: AuthRequest, res: Response) => {
  const { chatText } = req.body;
  let emotion = 'neutral';
  if (chatText?.includes('happy')) emotion = 'happy';
  else if (chatText?.includes('sad')) emotion = 'sad';
  res.json({ emotion });
});

// Burn Message
router.post('/burn-message', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, content, autoDeleteAfter = 60 } = req.body;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + autoDeleteAfter);

    const { data: message, error } = await supabase
      .from('burn_messages')
      .insert({
        sender_id: req.userId,
        recipient_id: recipientId,
        content,
        expires_at: expiresAt,
        auto_delete_after: autoDeleteAfter,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// View Burn Message
router.get('/burn-message/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: message, error } = await supabase
      .from('burn_messages')
      .update({ is_viewed: true, viewed_at: new Date() })
      .eq('id', req.params.id)
      .eq('recipient_id', req.userId)
      .gt('expires_at', new Date().toISOString())
      .is('is_viewed', false)
      .select()
      .single();

    if (error) return res.status(404).json({ message: 'Not found or expired' });
    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/burn-messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: messages } = await supabase
      .from('burn_messages')
      .select('*')
      .eq('recipient_id', req.userId)
      .is('is_viewed', false)
      .gt('expires_at', new Date().toISOString());
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


