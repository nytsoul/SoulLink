import express, { Response } from 'express';
import Chat, { Message } from '../models/Chat';
import { authenticate, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI for chatbot (optional)
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    return null;
  }
};

const openai = getOpenAIClient();

// Get or create chat
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, mode = 'love' } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if chat exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, participantId] },
      mode,
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.userId, participantId],
        mode,
      });
      await chat.save();
    }

    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user chats
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({
      participants: req.userId,
    })
      .populate('participants', 'name profilePhotos')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json({ chats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.userId as any)) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name profilePhotos')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    res.json({ messages: messages.reverse() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', encrypted = false } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.userId as any)) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = new Message({
      chatId,
      senderId: req.userId,
      content,
      messageType,
      encrypted,
    });
    await message.save();

    chat.lastMessage = message._id as any;
    chat.lastMessageAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profilePhotos');

    res.json({ message: populatedMessage });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// AI Chatbot Assistant - Get conversation tips and love ideas
router.post('/:chatId/assistant', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { query, type = 'tips' } = req.body; // type: 'tips', 'ideas', 'icebreakers', 'advice'

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.userId as any)) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const mode = chat.mode || 'love';

    if (!openai) {
      // Fallback responses
      const fallbackResponses: Record<string, string> = {
        tips: mode === 'love'
          ? '💡 Conversation Tips:\n1. Ask open-ended questions\n2. Share personal stories\n3. Show genuine interest\n4. Use humor appropriately\n5. Be authentic and honest'
          : '💡 Friendship Tips:\n1. Find common interests\n2. Be a good listener\n3. Share experiences\n4. Be supportive\n5. Have fun together',
        ideas: mode === 'love'
          ? '💕 Date Ideas:\n1. Picnic in the park\n2. Cooking together\n3. Museum visit\n4. Stargazing\n5. Local concert'
          : '🤝 Activity Ideas:\n1. Try a new restaurant\n2. Board game night\n3. Hiking adventure\n4. Movie marathon\n5. Explore a new place',
        icebreakers: mode === 'love'
          ? '❄️ Icebreakers:\n1. "What\'s your favorite travel memory?"\n2. "If you could have dinner with anyone, who would it be?"\n3. "What\'s something you\'re passionate about?"\n4. "Tell me about your dream vacation"\n5. "What makes you laugh?"'
          : '❄️ Conversation Starters:\n1. "What are your hobbies?"\n2. "Any good books/movies lately?"\n3. "What\'s your favorite way to relax?"\n4. "Any fun plans this weekend?"\n5. "What\'s something you\'ve always wanted to try?"',
        advice: '💬 Relationship Advice:\nCommunication is key. Be honest, listen actively, and show empathy. Remember that every relationship takes effort and understanding.',
      };

      return res.json({
        response: fallbackResponses[type] || fallbackResponses.tips,
        type,
        mode,
      });
    }

    // Use OpenAI for personalized responses
    const systemPrompts: Record<string, string> = {
      tips: mode === 'love'
        ? 'You are a relationship coach. Provide helpful conversation tips for romantic relationships. Be warm and encouraging.'
        : 'You are a friendship advisor. Provide helpful conversation tips for building platonic friendships. Be friendly and supportive.',
      ideas: mode === 'love'
        ? 'You are a date planning expert. Suggest creative and romantic date ideas. Be imaginative and considerate.'
        : 'You are a social activity planner. Suggest fun activities for friends to do together. Be creative and inclusive.',
      icebreakers: 'You are a conversation expert. Provide engaging icebreaker questions and conversation starters. Be creative and fun.',
      advice: mode === 'love'
        ? 'You are a relationship counselor. Provide thoughtful advice for romantic relationships. Be empathetic and wise.'
        : 'You are a friendship counselor. Provide thoughtful advice for maintaining and strengthening friendships. Be supportive and understanding.',
    };

    const userPrompts: Record<string, string> = {
      tips: query || 'Give me conversation tips',
      ideas: query ? `Suggest ${mode === 'love' ? 'date' : 'activity'} ideas related to: ${query}` : `Suggest 5 ${mode === 'love' ? 'romantic date' : 'fun activity'} ideas`,
      icebreakers: query || 'Give me some icebreaker questions',
      advice: query || 'Give me relationship advice',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompts[type] || systemPrompts.tips },
        { role: 'user', content: userPrompts[type] || userPrompts.tips },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that.';

    res.json({
      response,
      type,
      mode,
    });
  } catch (error: any) {
    console.error('Chatbot assistant error:', error);
    res.status(500).json({ message: error.message || 'Failed to get assistant response' });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { chatId, senderId: { $ne: req.userId }, readAt: null },
      { readAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
