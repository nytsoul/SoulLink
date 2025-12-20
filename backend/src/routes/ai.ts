import express, { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import User from '../models/User';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = express.Router();

// Initialize Gemini client
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.warn('Gemini initialization failed:', error);
    return null;
  }
};

const model = getGeminiModel();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many AI requests, please try again later.',
});

// Generate love poem
router.post('/poem', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (!model) {
      return res.status(503).json({
        message: 'AI features are not available. Please configure GEMINI_API_KEY in .env',
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

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    const poem = response.text() || 'Unable to generate poem';

    res.json({ poem, mode });
  } catch (error: any) {
    console.error('AI poem error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate poem' });
  }
});

// Generate quiz
router.post('/quiz', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', count = 15 } = req.body;
    const user = await User.findById(req.userId);

    const quizType = mode === 'love' ? 'romantic compatibility and love' : 'friendship and platonic relationships';

    let questions;

    if (!model) {
      // Fallback: generate simple questions when AI is not configured
      console.log('[AI Quiz - Gemini not configured] Generating fallback questions');
      questions = Array.from({ length: Math.min(count, 15) }, (_, i) => ({
        question: `Question ${i + 1}: What do you value most in a ${mode === 'love' ? 'romantic relationship' : 'friendship'}?`,
        type: 'multiple-choice',
        options: ['Trust', 'Communication', 'Shared interests', 'Support'],
      }));
    } else {
      const prompt = `Generate exactly ${count} unique and diverse ${quizType} quiz questions in JSON format. 
      The questions MUST be different from each other.
      Include a mix of question types:
      - "multiple-choice" (provide 4 distinct options)
      - "scale" (1-5 rating)
      - "text" (open-ended)
      
      Focus on deep, psychological, and fun aspects of ${quizType}.
      
      Format:
      [
        {
          "question": "string",
          "type": "multiple-choice" | "scale" | "text",
          "options": ["string", "string", "string", "string"] // Only for multiple-choice
        }
      ]
      
      Return ONLY valid JSON array. No markdown, no code blocks.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        questions = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        // Fallback: generate diverse simple questions
        const topics = ['Trust', 'Communication', 'Future Goals', 'Conflict Resolution', 'Intimacy', 'Values', 'Interests', 'Finances', 'Family', 'Social Life', 'Habits', 'Travel', 'Humor', 'Empathy', 'Growth'];
        questions = topics.slice(0, count).map((topic, i) => ({
          question: `How important is ${topic} to you in a ${mode === 'love' ? 'relationship' : 'friendship'}?`,
          type: i % 3 === 0 ? 'scale' : 'multiple-choice',
          options: i % 3 === 0 ? undefined : ['Very Important', 'Somewhat Important', 'Not Important', 'Indifferent'],
        }));
      }
    }

    // Save quiz
    const quiz = new Quiz({
      userId: req.userId,
      mode,
      questions: questions.slice(0, count),
      type: 'solo', // Default to solo
    });
    await quiz.save();

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    console.error('AI quiz error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate quiz' });
  }
});

// Create Compatibility Quiz
router.post('/quiz/create-compatibility', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love' } = req.body;

    // Generate questions (reuse existing logic or call internal function)
    // For simplicity, we'll copy the generation logic here or refactor. 
    // Let's assume we use the same prompt logic.

    const count = 15;
    const quizType = mode === 'love' ? 'romantic compatibility and love' : 'friendship and platonic relationships';
    let questions;

    if (!model) {
      const topics = ['Trust', 'Communication', 'Future Goals', 'Conflict Resolution', 'Intimacy', 'Values', 'Interests', 'Finances', 'Family', 'Social Life', 'Habits', 'Travel', 'Humor', 'Empathy', 'Growth'];
      questions = topics.slice(0, count).map((topic, i) => ({
        question: `How important is ${topic} to you in a ${mode === 'love' ? 'relationship' : 'friendship'}?`,
        type: i % 3 === 0 ? 'scale' : 'multiple-choice',
        options: i % 3 === 0 ? undefined : ['Very Important', 'Somewhat Important', 'Not Important', 'Indifferent'],
      }));
    } else {
      const prompt = `Generate exactly ${count} unique and diverse ${quizType} quiz questions in JSON format. 
      The questions MUST be different from each other.
      Include a mix of question types:
      - "multiple-choice" (provide 4 distinct options)
      - "scale" (1-5 rating)
      - "text" (open-ended)
      
      Focus on deep, psychological, and fun aspects of ${quizType}.
      
      Format:
      [
        {
          "question": "string",
          "type": "multiple-choice" | "scale" | "text",
          "options": ["string", "string", "string", "string"] // Only for multiple-choice
        }
      ]
      
      Return ONLY valid JSON array. No markdown, no code blocks.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        questions = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        // Fallback
        const topics = ['Trust', 'Communication', 'Future Goals', 'Conflict Resolution', 'Intimacy', 'Values', 'Interests', 'Finances', 'Family', 'Social Life', 'Habits', 'Travel', 'Humor', 'Empathy', 'Growth'];
        questions = topics.slice(0, count).map((topic, i) => ({
          question: `How important is ${topic} to you in a ${mode === 'love' ? 'relationship' : 'friendship'}?`,
          type: i % 3 === 0 ? 'scale' : 'multiple-choice',
          options: i % 3 === 0 ? undefined : ['Very Important', 'Somewhat Important', 'Not Important', 'Indifferent'],
        }));
      }
    }

    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 char code

    const quiz = new Quiz({
      userId: req.userId,
      mode,
      type: 'compatibility',
      questions: questions.slice(0, count),
      code,
      status: 'created',
    });
    await quiz.save();

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    console.error('Create compatibility quiz error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create Compatibility Quiz Manually
router.post('/quiz/create-compatibility-manual', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'love', questions } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one question' });
    }

    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    const quiz = new Quiz({
      userId: req.userId,
      mode,
      type: 'compatibility',
      questions: questions.map((q: any) => ({
        question: q.question,
        type: q.type || 'text',
        options: q.options
      })),
      code,
      status: 'created',
    });
    await quiz.save();

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    console.error('Create manual compatibility quiz error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit Creator Answers
router.post('/quiz/submit-creator', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findOne({ _id: quizId, userId: req.userId });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    quiz.creatorAnswers = answers;
    quiz.status = 'waiting_for_taker';
    await quiz.save();

    res.json({ message: 'Answers saved', code: quiz.code });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Join Quiz
router.post('/quiz/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const quiz = await Quiz.findOne({ code });

    if (!quiz) return res.status(404).json({ message: 'Invalid code' });
    if (quiz.status === 'completed') return res.status(400).json({ message: 'Quiz already completed' });
    if (quiz.userId.toString() === req.userId) return res.status(400).json({ message: 'You cannot take your own quiz' });

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Submit Taker Answers
router.post('/quiz/submit-taker', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate score
    let matchCount = 0;
    let totalCount = 0;

    // Simple matching logic: exact match for choice/scale, similarity for text (skipped for now)
    if (quiz.creatorAnswers) {
      Object.keys(quiz.creatorAnswers).forEach((key) => {
        // @ts-ignore
        const creatorAns = quiz.creatorAnswers[key];
        const takerAns = answers[key];

        if (creatorAns !== undefined && takerAns !== undefined) {
          totalCount++;
          if (String(creatorAns).toLowerCase() === String(takerAns).toLowerCase()) {
            matchCount++;
          } else if (typeof creatorAns === 'number' && typeof takerAns === 'number') {
            // For scale, give partial credit?
            if (Math.abs(creatorAns - takerAns) <= 1) matchCount += 0.5;
          }
        }
      });
    }

    const score = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0;

    quiz.takerAnswers = answers;
    quiz.takerId = req.userId as any;
    quiz.score = score;
    quiz.status = 'completed';
    quiz.completed = true;
    await quiz.save();

    res.json({ score, quiz: quiz.toObject() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get Quiz by ID
router.get('/quiz/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Only allow creator or taker to view
    if (quiz.userId.toString() !== req.userId && quiz.takerId?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ quiz: quiz.toObject() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get advice/ideas
router.post('/advice', authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { query, mode = 'love', type = 'date-ideas' } = req.body;

    if (!model) {
      const fallbackAdvice = type === 'date-ideas'
        ? mode === 'love'
          ? '1. Have a picnic in the park\n2. Visit a local museum\n3. Cook dinner together\n4. Go stargazing\n5. Take a scenic walk'
          : '1. Try a new restaurant\n2. Go to a concert or show\n3. Play board games\n4. Explore a new neighborhood\n5. Do a fun activity together'
        : 'Communication is key in any relationship. Make time for each other, listen actively, and be honest about your feelings.';

      return res.status(503).json({
        message: 'AI features are not available. Please configure GEMINI_API_KEY in .env',
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

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    const advice = response.text() || 'Unable to generate advice';

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

    if (!model) {
      return res.status(503).json({
        message: 'AI chatbot is not available. Please configure GEMINI_API_KEY in .env',
        response: 'I\'m sorry, but AI features are currently unavailable. Please configure your Gemini API key to use the chatbot assistant. In the meantime, here are some conversation tips: Be genuine, ask open-ended questions, and show interest in the other person!',
        mode
      });
    }

    const systemPrompt = mode === 'love'
      ? 'You are a helpful relationship assistant. Provide tips, conversation prompts, and advice for romantic relationships. Be friendly and supportive.'
      : 'You are a helpful friendship assistant. Provide tips, conversation prompts, and advice for platonic relationships. Be friendly and supportive.';

    // Construct history for Gemini
    // Gemini supports history in a specific format, but for simplicity in single-turn or simple multi-turn, we can concatenate.
    // Ideally use startChat for history, but here we'll just append context.

    const historyContext = conversationHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${historyContext}\n\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text() || 'I apologize, I could not process that.';

    res.json({ response: text, mode });
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

    if (!model) {
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

    const systemPrompt = mode === 'love'
      ? 'You are a romantic ideas expert. Generate creative, thoughtful romantic gestures and date ideas.'
      : 'You are a friendship expert. Generate creative, fun activities and gestures for friends.';

    const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = await result.response;
    const ideasText = response.text() || '';

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
