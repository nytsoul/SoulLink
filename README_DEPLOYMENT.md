# 🚀 Deployment Instructions

## Quick Start

Follow these steps to deploy your Loves Platform to free hosting:

### 1. Database (MongoDB Atlas) - 5 min
- Sign up: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string

### 2. Backend (Render) - 10 min
- Sign up: https://render.com
- Deploy from GitHub
- Set environment variables

### 3. Frontend (Vercel) - 5 min
- Sign up: https://vercel.com
- Deploy from GitHub
- Set environment variables

## Detailed Guide

See `DEPLOYMENT.md` for complete step-by-step instructions.

## Quick Reference

See `QUICK_DEPLOY.md` for a checklist.

## Environment Variables Needed

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Support

Check deployment logs if issues occur:
- Render: Dashboard → Service → Logs
- Vercel: Dashboard → Project → Deployments → Logs


