import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';
import MemoryItem from '../models/MemoryItem';
import BurnMessage from '../models/BurnMessage';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'photobooth');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `photobooth-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Live Photo Booth - Capture and save
router.post('/photobooth', authenticate, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }

    const { filter, title, tags } = req.body;

    // Check memory limit
    const count = await MemoryItem.countDocuments({ userId: req.userId });
    if (count >= 500) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Maximum 500 memory items allowed' });
    }

    const item = new MemoryItem({
      userId: req.userId,
      cidOrUrl: req.file.filename,
      mediaType: 'photo',
      title: title || `Photo Booth - ${new Date().toLocaleDateString()}`,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : ['photobooth', filter || 'none'],
      visibility: 'private',
    });

    await item.save();

    res.json({
      item: {
        ...item.toObject(),
        url: `/api/memories/file/${req.file.filename}`,
      },
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Emotion Detection (placeholder - integrate with actual emotion detection API)
router.post('/emotion', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { imageData, chatText } = req.body;

    // Placeholder emotion detection
    // In production, use: AWS Rekognition, Google Vision API, or custom ML model
    let detectedEmotion = 'neutral';
    
    if (chatText) {
      const text = chatText.toLowerCase();
      if (text.includes('sad') || text.includes('unhappy') || text.includes('down')) {
        detectedEmotion = 'sad';
      } else if (text.includes('happy') || text.includes('excited') || text.includes('joy')) {
        detectedEmotion = 'happy';
      } else if (text.includes('love') || text.includes('heart')) {
        detectedEmotion = 'romantic';
      }
    }

    // Response based on emotion
    const responses: Record<string, any> = {
      sad: {
        message: "Hey, I'm here for you 💙",
        uiTheme: 'soft',
        music: 'calm',
        suggestions: ['Take a break', 'Listen to calming music', 'Talk to someone'],
      },
      happy: {
        message: "You're glowing! ✨",
        uiTheme: 'bright',
        music: 'upbeat',
        suggestions: ['Share your joy', 'Capture this moment', 'Celebrate!'],
      },
      romantic: {
        message: "Love is in the air 💕",
        uiTheme: 'warm',
        music: 'romantic',
        suggestions: ['Send a love message', 'Plan a date', 'Create a memory'],
      },
      neutral: {
        message: "How are you feeling today?",
        uiTheme: 'default',
        music: 'ambient',
        suggestions: [],
      },
    };

    res.json({
      emotion: detectedEmotion,
      ...responses[detectedEmotion],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Location-based Surprise
router.post('/location-surprise', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, locationName } = req.body;

    // Check if location matches any saved locations
    // In production, use geolocation matching
    const surprises = [
      {
        message: "You're near our favorite café ☕ — remember that rainy evening?",
        location: 'cafe',
        triggerDistance: 100, // meters
      },
      {
        message: "This is where we first met! 💕",
        location: 'first_meet',
        triggerDistance: 50,
      },
    ];

    // Simple matching (enhance with actual geolocation)
    const matchedSurprise = surprises[0]; // Placeholder

    res.json({
      hasSurprise: true,
      surprise: matchedSurprise,
      location: { latitude, longitude, name: locationName },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Burn After Reading Message
router.post('/burn-message', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, content, type = 'text', mediaUrl, autoDeleteAfter = 60 } = req.body;

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + autoDeleteAfter);

    const message = new BurnMessage({
      senderId: req.userId,
      recipientId,
      content,
      type,
      mediaUrl,
      expiresAt,
      autoDeleteAfter,
    });
    await message.save();

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// View burn message (auto-deletes after viewing)
router.get('/burn-message/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const message = await BurnMessage.findOne({
      _id: req.params.id,
      recipientId: req.userId,
      isViewed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or expired' });
    }

    // Mark as viewed
    message.isViewed = true;
    message.viewedAt = new Date();
    await message.save();

    // Schedule deletion
    setTimeout(async () => {
      await BurnMessage.findByIdAndDelete(message._id);
    }, message.autoDeleteAfter * 1000);

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending burn messages
router.get('/burn-messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await BurnMessage.find({
      recipientId: req.userId,
      isViewed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


