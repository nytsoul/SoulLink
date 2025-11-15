# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Git

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 2. Environment Configuration

#### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/loves
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Optional but recommended
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

OPENAI_API_KEY=your-openai-api-key

# Blockchain (optional)
PRIVATE_KEY=your-private-key
RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your-contract-address
```

#### Frontend (.env.local)
Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 3. Database Setup

Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

### 5. Deploy Smart Contracts (Optional)

```bash
cd contracts
npm install

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:local

# Deploy to testnet (Mumbai)
npm run deploy:mumbai

# Deploy to mainnet (Polygon)
npm run deploy:polygon
```

Update `CONTRACT_ADDRESS` in backend `.env` after deployment.

## Features Overview

### ✅ Implemented

- User authentication (register, login, OTP verification)
- Dual-mode toggle (Love/Friends)
- User profiles and matching
- Chat system with Socket.IO
- AI features (poems, quizzes, advice, chatbot)
- Memory gallery (max 500 items)
- Face verification system
- Calendar with import/export
- Games feature
- Blockchain smart contracts
- Security features (rate limiting, encryption support)

### 🔧 Configuration Needed

1. **Email Service**: Configure SMTP for email verification
2. **SMS Service**: Configure Twilio for phone OTP
3. **AI Service**: Add OpenAI API key for AI features
4. **Face Recognition**: Configure AWS Rekognition or alternative
5. **IPFS/S3**: Set up media storage
6. **Blockchain**: Deploy contracts and configure RPC

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/mode` - Set mode
- `POST /api/users/wallet` - Link wallet

### Matches
- `GET /api/matches/search` - Search users
- `GET /api/matches/suggestions` - Get match suggestions

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat/create` - Create chat
- `GET /api/chat/:chatId/messages` - Get messages
- `POST /api/chat/:chatId/messages` - Send message

### AI
- `POST /api/ai/poem` - Generate poem
- `POST /api/ai/quiz` - Generate quiz
- `POST /api/ai/advice` - Get advice
- `POST /api/ai/chatbot` - Chatbot assistant

### Memories
- `GET /api/memories` - Get memory items
- `POST /api/memories` - Upload memory
- `PUT /api/memories/:id` - Update memory
- `DELETE /api/memories/:id` - Delete memory

### Verification
- `POST /api/verification/face/request` - Request face verification
- `GET /api/verification/face` - Get verification status
- `POST /api/verification/consent` - Grant consent
- `POST /api/verification/consent/revoke` - Revoke consent

### Calendar
- `GET /api/calendar` - Get events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event
- `GET /api/calendar/export` - Export calendar (ICS)

### Games
- `GET /api/games` - Get available games
- `GET /api/games/:gameId/questions` - Get game questions
- `POST /api/games/:gameId/result` - Submit game result

### Blockchain
- `GET /api/blockchain/records` - Get user records
- `GET /api/blockchain/verify/:txHash` - Verify record

## Security Notes

⚠️ **Important Security Considerations:**

1. **Face Recognition**: 
   - Requires explicit consent (GDPR/CCPA compliant)
   - Store only encrypted embeddings, not raw images
   - Allow users to revoke consent and delete data

2. **Data Privacy**:
   - Encrypt sensitive data at rest
   - Use client-side encryption for memory gallery
   - Never store passwords in plain text

3. **Blockchain**:
   - Only store hashes on-chain, not personal data
   - Use gas-efficient L2 (Polygon) for lower costs
   - Audit smart contracts before mainnet deployment

4. **Legal Compliance**:
   - Consult lawyer for biometric data collection
   - Implement age verification (18+)
   - Create comprehensive privacy policy and terms

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique secrets for JWT
3. Enable HTTPS
4. Set up proper CORS origins
5. Use Redis for OTP storage (instead of memory)
6. Set up monitoring and logging
7. Run security audits
8. Deploy smart contracts to mainnet
9. Set up CDN for media files
10. Configure backup strategies

## Support

For issues or questions, contact: support@loves.com

