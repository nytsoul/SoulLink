# Loves Platform

A dual-mode (Love / Friends) social-matching site with AI features, face-verification, private memory gallery, calendar, games, and blockchain integration.

## Features

- **Dual Mode**: Toggle between Love and Friends modes
- **AI Features**: Poem generation, quiz generation, advice chatbot
- **Face Verification**: Optional biometric verification
- **Memory Gallery**: Private encrypted photo/video storage (max 500 items)
- **Calendar**: Events, birthdays, anniversaries
- **Games**: Interactive mini-games for both modes
- **Blockchain**: Smart contracts for consent records and verification proofs
- **Secure Chat**: Encrypted messaging with AI assistant

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: MongoDB
- **Blockchain**: Solidity (Ethereum/Polygon)
- **Storage**: IPFS + S3
- **AI**: OpenAI API
- **Face Recognition**: AWS Rekognition / FaceNet

## Getting Started

### 🚀 Quick Deploy to Free Hosting

**Deploy to production in 20 minutes:**
- Frontend: Vercel (free)
- Backend: Render (free)
- Database: MongoDB Atlas (free)

👉 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide**  
👉 **See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for quick checklist**

### Local Development

#### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- MetaMask (for blockchain features)

#### Installation

```bash
npm run install:all
```

#### Environment Setup

1. Copy `.env.example` files in both `frontend` and `backend` directories
2. Fill in your API keys and configuration

#### Run Development

```bash
npm run dev
```

This starts both frontend (http://localhost:3000) and backend (http://localhost:5000)

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/           # Express API server
├── contracts/         # Solidity smart contracts
└── README.md
```

## Security & Privacy

- Client-side encryption for sensitive data
- GDPR/CCPA compliant
- Explicit consent for face recognition
- Blockchain proofs for verification records
- Rate limiting and anti-abuse measures

## Legal

⚠️ **Important**: Consult with a lawyer before deploying, especially regarding:
- Biometric data collection (face recognition)
- Data privacy regulations (GDPR, CCPA)
- Age verification requirements
- Terms of service and privacy policy

## License

MIT

