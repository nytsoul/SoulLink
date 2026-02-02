import path from 'path';
import dotenv from 'dotenv';
const envResult = dotenv.config({ path: path.join(__dirname, '../.env') });
console.log(`[DIAGNOSTIC] index.ts - CWD: ${process.cwd()}`);
console.log(`[DIAGNOSTIC] index.ts - __dirname: ${__dirname}`);
console.log(`[DIAGNOSTIC] index.ts - Env Load: ${envResult.error ? 'FAILED' : 'SUCCESS'}`);
if (envResult.error) console.error(envResult.error);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';
import memoryRoutes from './routes/memories';
import verificationRoutes from './routes/verification';
import calendarRoutes from './routes/calendar';
import gameRoutes from './routes/games';
import blockchainRoutes from './routes/blockchain';
import loveRoutes from './routes/love';
import personalityRoutes from './routes/personality';
import realtimeRoutes from './routes/realtime';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('CORS fail'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS fail'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 900000,
  max: 1000,
  message: 'Too many requests',
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/love', loveRoutes);
app.use('/api/personality', personalityRoutes);
app.use('/api/realtime', realtimeRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', db: 'supabase' }));

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => socket.join(roomId));
  socket.on('send-message', (data) => io.to(data.roomId).emit('receive-message', data));
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});

export { io };
