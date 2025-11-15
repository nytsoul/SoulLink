# ⚡ Quick Deployment Checklist

## 🗄️ MongoDB Atlas (5 minutes)

1. ✅ Sign up: https://www.mongodb.com/cloud/atlas/register
2. ✅ Create FREE cluster (M0)
3. ✅ Create database user (save password!)
4. ✅ Network Access: Allow 0.0.0.0/0
5. ✅ Get connection string
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/loves?retryWrites=true&w=majority
   ```

## 🔧 Render Backend (10 minutes)

1. ✅ Sign up: https://render.com
2. ✅ New Web Service → Connect GitHub
3. ✅ Settings:
   - **Root Directory**: `backend`
   - **Build**: `npm install && npm run build`
   - **Start**: `npm start`
4. ✅ Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   JWT_REFRESH_SECRET=<generate-another>
   FRONTEND_URL=https://your-frontend.vercel.app (update after frontend deploy)
   ```
5. ✅ Deploy → Copy URL: `https://your-backend.onrender.com`

## 🎨 Vercel Frontend (5 minutes)

1. ✅ Sign up: https://vercel.com
2. ✅ New Project → Import GitHub repo
3. ✅ Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto)
4. ✅ Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. ✅ Deploy → Copy URL: `https://your-project.vercel.app`

## 🔄 Final Steps

1. ✅ Update Render: Set `FRONTEND_URL` to your Vercel URL
2. ✅ Test: Visit Vercel URL → Register → Login
3. ✅ (Optional) Setup UptimeRobot to keep backend awake

## 🎉 Done!

Your app is live:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: MongoDB Atlas (cloud)

---

**Generate Secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32
```

**Test Backend:**
```bash
curl https://your-backend.onrender.com/health
```


