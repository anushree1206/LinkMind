@echo off
title LinkMind Backend Server
cd /d "c:\Users\shruthi keerthana\OneDrive\Desktop\LinkMind\backend"
set "MONGODB_URI=mongodb://localhost:27017/relationship-manager"
set "JWT_SECRET=your-secret-key-here-12345"
set "NODE_ENV=development"
set "PORT=5000"
echo.
echo ========================================
echo   LinkMind Backend Server Starting...
echo ========================================
echo.
echo Environment Variables:
echo MONGODB_URI: %MONGODB_URI%
echo JWT_SECRET: [SET]
echo NODE_ENV: %NODE_ENV%
echo PORT: %PORT%
echo.
npm start
pause
