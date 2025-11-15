@echo off
echo Installing all dependencies...
echo.

echo Installing root dependencies...
call npm install
echo.

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo Installing backend dependencies...
cd backend
call npm install
cd ..
echo.

echo.
echo ✅ All dependencies installed!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update .env files in frontend and backend
echo 3. Run: npm run dev
echo.

pause

