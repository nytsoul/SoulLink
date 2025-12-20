# SoulLink

SoulLink is a modern, AI-powered social platform for building meaningful romantic and platonic connections. It features dual modes (Love & Friendship), secure chat, games, AI assistant, and more—all with a beautiful, responsive UI.

## Features
- Dual-mode: Switch between Love and Friendship experiences
- AI-powered matching, chat tips, and content
- Face verification and blockchain-backed privacy
- Secure, real-time chat with media sharing
- Interactive games (Truth or Dare, quizzes, etc.)
- Memories gallery for photos and videos
- Calendar for important dates
- Responsive, modern UI with dark mode

## Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Multer, OpenAI API
- **Other:** JWT Auth, Socket.io, Vercel/Render deployment

## Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- (Optional) OpenAI API key for AI features
- (Optional) SMTP/Twilio for email/SMS

### Installation
1. **Clone the repo:**
   ```bash
   git clone https://github.com/nytsoul/SoulLink.git
   cd SoulLink
   ```
2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `backend` and `frontend` folders and fill in required values.
4. **Start the backend:**
   ```bash
   cd ../backend
   npm run dev
   ```
5. **Start the frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```
6. **Visit the app:**
   - Frontend: http://localhost:3000 (or 3001 if 3000 is busy)
   - Backend: http://localhost:5000

## Project Structure
```
SoulLink/
  backend/      # Express API, MongoDB models, routes
  frontend/     # Next.js app, components, pages
  contracts/    # Smart contracts (optional)
  uploads/      # Uploaded media
```

## Customization
- Update branding in `/frontend/components/Navbar.tsx` and `/frontend/components/Footer.tsx`.
- Add or modify games in `/frontend/app/games/`.
- Configure AI and verification in backend `/backend/src/routes/`.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

**SoulLink** — Connect. Play. Grow. Powered by AI.

