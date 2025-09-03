@echo off
title LinkMind Backend Server
cd /d "%~dp0"
set MONGODB_URI=mongodb://localhost:27017/relationship-manager
set JWT_SECRET=your-secret-key-here-12345
set NODE_ENV=development
set PORT=5000
echo.
echo ========================================
echo   LinkMind Backend Server
echo ========================================
echo.
echo Starting server on port %PORT%...
echo MongoDB: %MONGODB_URI%
echo Environment: %NODE_ENV%
echo.
node simple-start.js
