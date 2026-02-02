import express, { Response } from 'express';
import { supabase } from '../lib/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';
import { generateOTP, storeOTP, verifyOTP } from '../utils/otp';
import { sendSimpleEmail } from '../utils/email';

const router = express.Router();

// Initialize OpenAI for chatbot (optional)
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
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
    if (!participantId) return res.status(400).json({ message: 'Participant ID is required' });

    // Find if a chat already exists between these two users
    const { data: existingChats, error: findError } = await supabase
      .from('chat_participants')
      .select('chat_id, chats!inner(mode)')
      .eq('user_id', req.userId)
      .eq('chats.mode', mode);

    if (findError) return res.status(500).json({ message: findError.message });

    // Check if the other participant is also in any of these chats
    let chat_id: string | null = null;
    if (existingChats && existingChats.length > 0) {
      const chatIds = existingChats.map((c: any) => c.chat_id);
      const { data: sharedChats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .in('chat_id', chatIds)
        .eq('user_id', participantId);

      if (sharedChats && sharedChats.length > 0) {
        chat_id = sharedChats[0].chat_id;
      }
    }

    if (!chat_id) {
      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({ mode })
        .select()
        .single();

      if (chatError) return res.status(500).json({ message: chatError.message });
      chat_id = newChat.id;

      // Add participants
      await supabase.from('chat_participants').insert([
        { chat_id, user_id: req.userId },
        { chat_id, user_id: participantId }
      ]);

      return res.json({ chat: newChat });
    }

    // Return existing chat
    const { data: chat } = await supabase.from('chats').select('*').eq('id', chat_id).single();
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Request OTP to initiate chat with a user by email
router.post('/request-otp', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const { data: targetUser, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !targetUser) return res.status(404).json({ message: 'Target user not found' });

    const otp = generateOTP();
    const key = `chat:${req.userId}:${targetUser.id}`;
    storeOTP(key, otp, 10);

    const subject = 'Loves — Chat connection request OTP';
    const body = `<p>You have a chat connection request from a user. Use this OTP to approve the connection: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`;
    await sendSimpleEmail(targetUser.email, subject, body);

    const isEmailConfigured = !!(process.env.SMTP_HOST && process.env.EMAIL_FROM);
    const responsePayload: any = { message: 'OTP sent to target user (they must verify)', targetId: targetUser.id };
    if (!isEmailConfigured) responsePayload.otp = otp;

    res.json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP and create/get chat on success
router.post('/verify-otp', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, otp, mode = 'love' } = req.body;
    if (!targetId || !otp) return res.status(400).json({ message: 'targetId and otp are required' });

    const key = `chat:${req.userId}:${targetId}`;
    if (!verifyOTP(key, otp)) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Same logic as /create
    const { data: existingChats } = await supabase
      .from('chat_participants')
      .select('chat_id, chats!inner(mode)')
      .eq('user_id', req.userId)
      .eq('chats.mode', mode);

    let chat_id: string | null = null;
    if (existingChats) {
      const chatIds = existingChats.map((c: any) => c.chat_id);
      const { data: sharedChats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .in('chat_id', chatIds)
        .eq('user_id', targetId);
      if (sharedChats && sharedChats.length > 0) chat_id = sharedChats[0].chat_id;
    }

    if (!chat_id) {
      const { data: newChat } = await supabase.from('chats').insert({ mode }).select().single();
      if (!newChat) return res.status(500).json({ message: 'Failed to create chat' });
      chat_id = newChat.id;
      await supabase.from('chat_participants').insert([{ chat_id, user_id: req.userId }, { chat_id, user_id: targetId }]);
      return res.json({ chat: newChat });
    }

    const { data: chat } = await supabase.from('chats').select('*').eq('id', chat_id).single();
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user chats
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Get all chat IDs the user is in
    const { data: userChats, error: chatIdsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', req.userId);

    if (chatIdsError) return res.status(500).json({ message: chatIdsError.message });

    const chatIds = userChats.map((uc: any) => uc.chat_id);

    // 2. Get chats with details
    // We'll need to fetch other participants separately or use a complex join
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        *,
        chat_participants(
          user_id,
          profiles(id, name, profile_photos)
        ),
        messages(content, created_at, sender_id)
      `)
      .in('id', chatIds)
      .order('last_message_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });

    // Format for frontend (populate participants/lastMessage)
    const formattedChats = chats.map((c: any) => {
      const participants = c.chat_participants.map((cp: any) => cp.profiles);
      const lastMessage = c.messages && c.messages.length > 0 ? c.messages[0] : null;
      return {
        ...c,
        participants,
        lastMessage,
      };
    });

    res.json({ chats: formattedChats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(id, name, profile_photos)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({ message: error.message });

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

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: req.userId,
        content,
        message_type: messageType,
        encrypted,
      })
      .select(`
        *,
        profiles:sender_id(id, name, profile_photos)
      `)
      .single();

    if (error) return res.status(500).json({ message: error.message });

    // Update chat last_message_at
    await supabase.from('chats').update({ last_message_at: new Date() }).eq('id', chatId);

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// AI Chatbot Assistant
router.post('/:chatId/assistant', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { query, type = 'tips' } = req.body;

    const { data: chat } = await supabase.from('chats').select('mode').eq('id', chatId).single();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const mode = chat.mode || 'love';

    // Same OpenAI logic as before
    if (!openai) {
      const fallbackResponses: Record<string, string> = {
        tips: mode === 'love' ? '💡 Romantic tips...' : '💡 Friendship tips...',
        ideas: mode === 'love' ? '💕 Date ideas...' : '🤝 Activity ideas...',
        icebreakers: '❄️ Icebreakers...',
        advice: '💬 Advice...',
      };
      return res.json({ response: fallbackResponses[type] || fallbackResponses.tips, type, mode });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'Assistant info...' }, { role: 'user', content: query || 'Tips' }],
      max_tokens: 300,
    });

    res.json({ response: completion.choices[0]?.message?.content, type, mode });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    await supabase
      .from('messages')
      .update({ read_at: new Date() })
      .eq('chat_id', chatId)
      .neq('sender_id', req.userId)
      .is('read_at', null);

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
