# 🚀 Quick Start Guide

## Automatic Setup (Recommended)

Run this command to automatically install all dependencies and setup the project:

```bash
npm run setup
```

Or use the script directly:
```bash
node setup.js
```

**Windows users can also run:**
```bash
install-all.bat
```

**Mac/Linux users can run:**
```bash
chmod +x install-all.sh
./install-all.sh
```

## Manual Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Setup Environment Files

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loves
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (Cloud):**
- Sign up: https://www.mongodb.com/cloud/atlas
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### 4. Start Development Servers

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## ✅ Verify Everything Works

1. **Backend Health**: http://localhost:5000/health
   - Should return: `{"status":"ok"}`

2. **Frontend**: http://localhost:3000
   - Should show homepage

3. **Register**: Create a test account
4. **Login**: Test authentication
5. **Features**: Test matches, chat, memories, etc.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Id
```

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For Atlas: Check network access (allow 0.0.0.0/0)

### Module Not Found
```bash
# Reinstall dependencies
npm run install:all
```

## 🎉 Ready!

Your platform is now running locally. All features are available!

