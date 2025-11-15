# 🚀 Deployment Guide - Free Hosting

This guide will help you deploy the Loves Platform to free hosting services:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js)
- **Database**: MongoDB Atlas (Free tier)

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free): https://vercel.com
3. Render account (free): https://render.com
4. MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Choose **FREE** tier (M0 Sandbox)

### 1.2 Create Cluster
1. Click "Build a Database"
2. Select **FREE** (M0) tier
3. Choose a cloud provider and region (closest to you)
4. Click "Create"

### 1.3 Setup Database Access
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### 1.4 Setup Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add specific IPs for production
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `loves` (or your preferred database name)

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/loves?retryWrites=true&w=majority
```

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment

1. **Push code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/loves-platform.git
   git push -u origin main
   ```

### 2.2 Create Render Service

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.3 Configure Render Service

**Basic Settings:**
- **Name**: `loves-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Click "Advanced" → "Add Environment Variable" and add:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/loves?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional (for full features)
OPENAI_API_KEY=your-openai-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@loves.com
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
```

**Important Notes:**
- Generate strong secrets: `openssl rand -base64 32`
- Replace `FRONTEND_URL` with your Vercel URL (after deployment)
- Render free tier spins down after 15 minutes of inactivity (first request may be slow)

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://loves-backend.onrender.com` (or your custom name)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

1. Make sure your code is on GitHub

### 3.2 Create Vercel Project

1. Go to https://vercel.com and sign up/login
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

### 3.3 Configure Vercel Project

**Framework Preset:**
- **Framework Preset**: Next.js (auto-detected)

**Root Directory:**
- Click "Edit" next to Root Directory
- Set to: `frontend`

**Environment Variables:**
Click "Environment Variables" and add:

```env
NEXT_PUBLIC_API_URL=https://loves-backend.onrender.com
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_CHAIN_ID=137
```

**Important:**
- Replace `https://loves-backend.onrender.com` with your actual Render backend URL

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

---

## 🔄 Step 4: Update Environment Variables

### 4.1 Update Backend (Render)

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

### 4.2 Update Frontend (Vercel)

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Update `NEXT_PUBLIC_API_URL` if needed
5. Redeploy: Go to "Deployments" → Click "..." → "Redeploy"

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

1. Visit: `https://your-backend.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Try registering a new account
3. Test login functionality

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Backend returns 503 or times out**
- **Solution**: Render free tier spins down after inactivity. First request may take 30-60 seconds to wake up.

**Problem: MongoDB connection error**
- **Solution**: 
  - Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
  - Verify connection string is correct
  - Check database user credentials

**Problem: CORS errors**
- **Solution**: Update `FRONTEND_URL` in Render environment variables

### Frontend Issues

**Problem: API calls fail**
- **Solution**: 
  - Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
  - Verify backend is running (check Render logs)
  - Check browser console for errors

**Problem: Build fails**
- **Solution**: 
  - Check Vercel build logs
  - Ensure all dependencies are in `package.json`
  - Check for TypeScript errors

---

## 📝 Important Notes

### Render Free Tier Limitations

1. **Spins down after 15 minutes** of inactivity
2. **First request** after spin-down takes 30-60 seconds
3. **512MB RAM** limit
4. **No persistent storage** (use MongoDB Atlas for data)
5. **Sleeps after inactivity** (can use uptime monitoring to keep awake)

### Vercel Free Tier

1. **Unlimited deployments**
2. **100GB bandwidth** per month
3. **Automatic HTTPS**
4. **Global CDN**
5. **No sleep/spin-down**

### MongoDB Atlas Free Tier

1. **512MB storage**
2. **Shared RAM**
3. **No backup** (upgrade for backups)
4. **Perfect for development/small apps**

---

## 🚀 Keep Backend Awake (Optional)

Since Render free tier spins down, you can use a service to ping it:

1. **UptimeRobot** (free): https://uptimerobot.com
   - Add monitor for your backend URL
   - Set interval to 5 minutes
   - This will keep it awake

2. **Cron Job** (alternative):
   - Use GitHub Actions or similar
   - Ping backend every 5 minutes

---

## 📊 Monitoring

### Render Logs
- Go to Render dashboard → Your service → "Logs"
- View real-time logs and errors

### Vercel Analytics
- Go to Vercel dashboard → Your project → "Analytics"
- View deployment status and errors

### MongoDB Atlas Monitoring
- Go to MongoDB Atlas → "Metrics"
- Monitor database performance

---

## 🔐 Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable MongoDB Atlas IP whitelist (restrict to Render IPs)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up rate limiting (already configured)
- [ ] Regular security updates

---

## 🎉 Success!

Your Loves Platform is now live:
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas (cloud)

All services are free and production-ready!

---

## 📞 Support

If you encounter issues:
1. Check deployment logs (Render/Vercel)
2. Verify environment variables
3. Test backend health endpoint
4. Check MongoDB Atlas connection
5. Review this guide again

Happy deploying! 🚀


