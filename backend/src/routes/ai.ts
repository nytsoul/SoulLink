import express, { Response } from 'express';
import OpenAI from 'openai';
import { authenticate, AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import User from '../models/User';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Initialize OpenAI client only if API key is provided
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  
  try {
    return new OpenAI({
      apiKey: apiKey,
    });
  } catch (error) {
    console.warn('OpenAI initialization failed:', error);
    return null;
  }
};

const openai = getOpenAIClient();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many AI requests, please try again later.',
});

// Generate love poem
router.post('/poem', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        message: 'AI features are not available. Please configure OPENAI_API_KEY in .env',
        poem: 'Roses are red,\nViolets are blue,\nAI is not configured,\nBut I still care for you! ❤️'
      });
    }

    const { prompt, recipientName, mode = 'love' } = req.body;
    const user = await User.findById(req.userId);

    const systemPrompt = mode === 'love'
      ? 'You are a romantic poet. Write beautiful, heartfelt love poems.'
      : 'You are a friendly poet. Write warm, platonic friendship poems.';

    const userPrompt = prompt
      ? `Write a ${mode} poem based on: ${prompt}${recipientName ? ` for ${recipientName}` : ''}`
      : `Write a ${mode} poem${recipientName ? ` for ${recipientName}` : ''} based on the user's profile: ${user?.bio || 'a kind person'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const poem = completion.choices[0]?.message?.content || 'Unable to generate poem';

    res.json({ poem, mode });
  } catch (error: any) {
    console.error('AI poem error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate poem' });
  }
});

// Generate quiz
router.post('/quiz', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', count = 25 } = req.body;
    const user = await User.findById(req.userId);

    const quizType = mode === 'love' ? 'romantic compatibility and love' : 'friendship and platonic relationships';

    let questions;

    if (!openai) {
      // Fallback: generate simple questions when AI is not configured
      console.log('[AI Quiz - OpenAI not configured] Generating fallback questions');
      questions = Array.from({ length: Math.min(count, 25) }, (_, i) => ({
        question: `Question ${i + 1}: What do you value most in a ${mode === 'love' ? 'romantic relationship' : 'friendship'}?`,
        type: 'multiple-choice',
        options: ['Trust', 'Communication', 'Shared interests', 'Support'],
      }));
    } else {
      const prompt = `Generate exactly ${count} ${quizType} quiz questions in JSON format. Each question should have:
- question: string
- type: "multiple-choice" | "true-false" | "scale" | "text"
- options: array of strings (if multiple-choice)
Return only valid JSON array, no markdown.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a quiz generator. Return only valid JSON arrays.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      try {
        const content = completion.choices[0]?.message?.content || '[]';
        questions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        // Fallback: generate simple questions
        questions = Array.from({ length: Math.min(count, 25) }, (_, i) => ({
          question: `Question ${i + 1} about ${quizType}?`,
          type: 'multiple-choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
        }));
      }
    }

    // Save quiz
    const quiz = new Quiz({
      userId: req.userId,
      mode,
      questions: questions.slice(0, count),
    });
    await quiz.save();

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    console.error('AI quiz error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate quiz' });
  }
});

// Get advice/ideas
router.post('/advice', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { query, mode = 'love', type = 'date-ideas' } = req.body;

    if (!openai) {
      const fallbackAdvice = type === 'date-ideas'
        ? mode === 'love'
          ? '1. Have a picnic in the park\n2. Visit a local museum\n3. Cook dinner together\n4. Go stargazing\n5. Take a scenic walk'
          : '1. Try a new restaurant\n2. Go to a concert or show\n3. Play board games\n4. Explore a new neighborhood\n5. Do a fun activity together'
        : 'Communication is key in any relationship. Make time for each other, listen actively, and be honest about your feelings.';
      
      return res.status(503).json({ 
        message: 'AI features are not available. Please configure OPENAI_API_KEY in .env',
        advice: fallbackAdvice,
        mode,
        type
      });
    }

    const systemPrompt = mode === 'love'
      ? 'You are a romantic relationship advisor. Provide helpful, thoughtful advice and date ideas.'
      : 'You are a friendship advisor. Provide helpful, thoughtful advice and activity ideas.';

    const userPrompt = type === 'date-ideas'
      ? `Suggest 5 creative ${mode === 'love' ? 'date' : 'activity'} ideas${query ? ` related to: ${query}` : ''}`
      : `Provide advice about: ${query || 'general relationship tips'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const advice = completion.choices[0]?.message?.content || 'Unable to generate advice';

    res.json({ advice, mode, type });
  } catch (error: any) {
    console.error('AI advice error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate advice' });
  }
});

// Chatbot assistant
router.post('/chatbot', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { message, mode = 'love', conversationHistory = [] } = req.body;

    if (!openai) {
      return res.status(503).json({ 
        message: 'AI chatbot is not available. Please configure OPENAI_API_KEY in .env',
        response: 'I\'m sorry, but AI features are currently unavailable. Please configure your OpenAI API key to use the chatbot assistant. In the meantime, here are some conversation tips: Be genuine, ask open-ended questions, and show interest in the other person!',
        mode
      });
    }

    const systemPrompt = mode === 'love'
      ? 'You are a helpful relationship assistant. Provide tips, conversation prompts, and advice for romantic relationships. Be friendly and supportive.'
      : 'You are a helpful friendship assistant. Provide tips, conversation prompts, and advice for platonic relationships. Be friendly and supportive.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // Last 5 messages for context
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that.';

    res.json({ response, mode });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: error.message || 'Failed to get chatbot response' });
  }
});

// Love ideas generator (enhanced)
router.post('/love-ideas', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { occasion, budget, location, preferences, mode = 'love' } = req.body;
    const user = await User.findById(req.userId);

    if (!openai) {
      const fallbackIdeas = [
        'Plan a surprise date night',
        'Write a heartfelt letter',
        'Create a personalized playlist',
        'Cook their favorite meal',
        'Plan a weekend getaway',
      ];
      return res.json({ ideas: fallbackIdeas, mode });
    }

    const prompt = `Generate 10 creative ${mode === 'love' ? 'romantic' : 'friendship'} ideas${occasion ? ` for ${occasion}` : ''}${budget ? ` with a budget of ${budget}` : ''}${location ? ` in ${location}` : ''}${preferences ? ` based on: ${preferences}` : ''}. Make them personal and thoughtful.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: mode === 'love'
            ? 'You are a romantic ideas expert. Generate creative, thoughtful romantic gestures and date ideas.'
            : 'You are a friendship expert. Generate creative, fun activities and gestures for friends.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.9,
    });

    const ideasText = completion.choices[0]?.message?.content || '';
    const ideas = ideasText
      .split('\n')
      .filter(line => line.trim() && (line.match(/^\d+\./) || line.match(/^[-•]/)))
      .map(line => line.replace(/^\d+\.\s*|^[-•]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 10);

    res.json({ ideas, mode });
  } catch (error: any) {
    console.error('Love ideas error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate ideas' });
  }
});

export default router;
