import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'memories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  },
});

const router = express.Router();

// Serve uploaded files
router.get('/file/:filename', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(307, `${frontendUrl}/placeholder-image.svg`);
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (['.mp4'].includes(ext)) contentType = 'video/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Check access in Supabase
    const { data: item, error } = await supabase
      .from('memories')
      .select('*')
      .eq('url', filename)
      .or(`user_id.eq.${req.userId},visibility.eq.public`)
      .single();

    if (error && !filename.startsWith('photobooth-')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get memory items
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { visibility, tags, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('memories')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId);

    if (visibility) query = query.eq('visibility', visibility);
    if (tags) query = query.contains('tags', (tags as string).split(','));

    const { data: items, count, error } = await query
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({ message: error.message });

    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const itemsWithUrls = items?.map((item: any) => ({
      ...item,
      url: `${apiUrl}/api/memories/file/${item.url}`,
    }));

    res.json({ items: itemsWithUrls, count, remaining: Math.max(0, 500 - (count || 0)) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Upload memory item
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, visibility = 'private', encrypted = false, encryptedData } = req.body;

    const { count } = await supabase.from('memories').select('*', { count: 'exact', head: true }).eq('user_id', req.userId);
    if ((count || 0) >= 500) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Maximum 500 memory items allowed' });
    }

    if (!req.file && !encryptedData) return res.status(400).json({ message: 'File or data required' });

    const url = req.file ? req.file.filename : 'encrypted://' + Date.now();
    const mediaType = req.file?.mimetype.startsWith('video/') ? 'video' : 'photo';

    const { data: item, error } = await supabase
      .from('memories')
      .insert({
        user_id: req.userId,
        url,
        media_type: mediaType,
        title: title || 'Untitled',
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
        visibility,
        encrypted,
        encrypted_data: encryptedData,
      })
      .select()
      .single();

    if (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ ...item, url: `/api/memories/file/${url}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update memory item
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, visibility } = req.body;
    const updates: any = {};
    if (title) updates.title = title;
    if (tags) updates.tags = tags.split(',').map((t: string) => t.trim());
    if (visibility) updates.visibility = visibility;

    const { data: item, error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(404).json({ message: 'Memory not found or not authorized' });
    res.json({ ...item, url: `/api/memories/file/${item.url}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete memory item
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: item, error } = await supabase
      .from('memories')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error || !item) return res.status(404).json({ message: 'Memory not found' });

    if (item.url && !item.url.startsWith('encrypted://')) {
      const filePath = path.join(uploadsDir, item.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Memory item deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
