import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import MemoryItem from '../models/MemoryItem';
import { authenticate, AuthRequest } from '../middleware/auth';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'memories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

const router = express.Router();

// Serve uploaded files (public endpoint for authenticated users)
router.get('/file/:filename', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to this file
    const item = await MemoryItem.findOne({ 
      cidOrUrl: filename,
      $or: [
        { userId: req.userId },
        { visibility: 'public' },
        { visibility: 'shared', sharedWith: req.userId }
      ]
    });

    if (!item && !filename.startsWith('photobooth-')) {
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

    const query: any = { userId: req.userId };
    if (visibility) query.visibility = visibility;
    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    const items = await MemoryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const count = await MemoryItem.countDocuments({ userId: req.userId });

    // Add full URL to items
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const apiUrl = process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
    const itemsWithUrls = items.map(item => {
      const filename = path.basename(item.cidOrUrl);
      return {
        ...item.toObject(),
        url: `${apiUrl}/api/memories/file/${filename}`,
        filename: filename,
      };
    });

    res.json({ items: itemsWithUrls, count, remaining: Math.max(0, 500 - count) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single memory item
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await MemoryItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Memory item not found' });
    }

    res.json({
      ...item.toObject(),
      url: `/api/memories/file/${path.basename(item.cidOrUrl)}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Upload memory item (photo/video)
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, visibility = 'private', encrypted = false, encryptedData } = req.body;

    // Check limit
    const count = await MemoryItem.countDocuments({ userId: req.userId });
    if (count >= 500) {
      return res.status(400).json({ message: 'Maximum 500 memory items allowed' });
    }

    if (!req.file && !encryptedData) {
      return res.status(400).json({ message: 'File or encrypted data required' });
    }

    let cidOrUrl: string;
    let mediaType: 'photo' | 'video';

    if (req.file) {
      // Store file path
      cidOrUrl = req.file.filename;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
    } else {
      // Encrypted data
      cidOrUrl = 'encrypted://' + Date.now();
      mediaType = 'photo'; // Default for encrypted
    }

    const item = new MemoryItem({
      userId: req.userId,
      cidOrUrl,
      mediaType,
      title: title || 'Untitled',
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      visibility,
      encrypted: encrypted || !!encryptedData,
      encryptedData,
    });

    await item.save();

    res.status(201).json({
      ...item.toObject(),
      url: `/api/memories/file/${path.basename(cidOrUrl)}`,
    });
  } catch (error: any) {
    // Delete uploaded file if item creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple files
router.post('/batch', authenticate, upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { tags, visibility = 'private' } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const count = await MemoryItem.countDocuments({ userId: req.userId });
    if (count + files.length > 500) {
      // Delete uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(400).json({ message: 'Upload would exceed 500 item limit' });
    }

    const items = await Promise.all(
      files.map(async (file) => {
        const item = new MemoryItem({
          userId: req.userId,
          cidOrUrl: file.filename,
          mediaType: file.mimetype.startsWith('video/') ? 'video' : 'photo',
          title: file.originalname.replace(/\.[^/.]+$/, ''),
          tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          visibility,
        });
        return item.save();
      })
    );

    res.status(201).json({
      items: items.map(item => ({
        ...item.toObject(),
        url: `/api/memories/file/${path.basename(item.cidOrUrl)}`,
      })),
    });
  } catch (error: any) {
    // Clean up uploaded files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update memory item
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, visibility, sharedWith } = req.body;

    const item = await MemoryItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Memory item not found' });
    }

    if (title) item.title = title;
    if (tags) item.tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (visibility) item.visibility = visibility;
    if (sharedWith) item.sharedWith = sharedWith;

    await item.save();

    res.json({
      ...item.toObject(),
      url: `/api/memories/file/${path.basename(item.cidOrUrl)}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete memory item
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await MemoryItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Memory item not found' });
    }

    // Delete physical file
    if (item.cidOrUrl && !item.cidOrUrl.startsWith('encrypted://')) {
      const filePath = path.join(uploadsDir, path.basename(item.cidOrUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Memory item deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
