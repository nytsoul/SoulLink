# 🚀 START HERE - Fix Connection Error

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` because the **backend server is not running**.

## Quick Fix (3 Steps)

### Step 1: Create Environment Files

Create `backend/.env` file with this content:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/loves
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

Create `frontend/.env.local` file with this content:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### Step 3: Start Backend Server

**Open a new terminal window** and run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

**Keep this terminal open!** The backend must stay running.

### Step 4: Start Frontend (if not already running)

In your original terminal (or a new one):

```bash
cd frontend
npm run dev
```

## Alternative: Run Both at Once

From the project root:
```bash
npm run dev
```

This starts both frontend and backend together.

## MongoDB Not Running?

If you see "MongoDB connection error":

**Option 1: Install and start MongoDB locally**
- Download: https://www.mongodb.com/try/download/community
- Start: `mongod` (or it may auto-start as a service)

**Option 2: Use MongoDB Atlas (Cloud - Free)**
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loves
   ```

## Verify It's Working

1. Backend health check: http://localhost:5000/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. Frontend: http://localhost:3000
   - Should load without connection errors

## Still Having Issues?

1. **Check if port 5000 is in use:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

2. **Check backend logs** for specific errors

3. **Make sure .env files are in the correct locations:**
   - `backend/.env` (not `.env.example`)
   - `frontend/.env.local` (not `.env.example`)

4. **Restart both servers** after creating .env files

