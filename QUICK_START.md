# Quick Start Guide

## Fix: ERR_CONNECTION_REFUSED Error

This error means the backend server is not running. Follow these steps:

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install separately:
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Mac/Linux
sudo systemctl start mongod
# Or:
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### Step 3: Start Backend Server

```bash
# From project root
cd backend
npm run dev

# Or from root (if concurrently is installed)
npm run dev:backend
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Step 4: Start Frontend (in a new terminal)

```bash
# From project root
cd frontend
npm run dev

# Or from root
npm run dev:frontend
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

### Backend won't start

1. **Check MongoDB is running:**
   ```bash
   mongosh --eval "db.version()"
   ```

2. **Check port 5000 is available:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

3. **Check environment variables:**
   - Make sure `backend/.env` exists
   - Verify `MONGODB_URI` is correct

### Frontend can't connect to backend

1. **Check backend is running:**
   - Visit http://localhost:5000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check environment variables:**
   - Make sure `frontend/.env.local` exists
   - Verify `NEXT_PUBLIC_API_URL=http://localhost:5000`

3. **Restart frontend after creating .env.local:**
   ```bash
   # Stop frontend (Ctrl+C)
   # Then restart:
   cd frontend && npm run dev
   ```

### MongoDB Connection Error

If you see `MongoDB connection error`:

1. **Local MongoDB:**
   - Make sure MongoDB service is running
   - Check connection string: `mongodb://localhost:27017/loves`

2. **MongoDB Atlas:**
   - Update `MONGODB_URI` in `backend/.env`
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/loves`

## Running Both Servers Together

From project root:
```bash
npm run dev
```

This runs both frontend and backend concurrently.

## Environment Files

Make sure these files exist:

- ✅ `backend/.env` (created automatically)
- ✅ `frontend/.env.local` (created automatically)

If they don't exist, copy from `.env.example` files.

## Next Steps

Once both servers are running:

1. Visit http://localhost:3000
2. Click "Sign Up" to create an account
3. Fill in the registration form
4. Check your email/phone for verification codes (if configured)

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `PROJECT_SUMMARY.md` for feature overview
- Make sure all dependencies are installed: `npm run install:all`

