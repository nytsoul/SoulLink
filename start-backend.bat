@echo off
echo Starting Backend Server...
echo.
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop
echo.
call npm run dev

