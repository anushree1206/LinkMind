@echo off
title LinkMind Backend Server
cd /d "%~dp0backend"
set MONGODB_URI=mongodb://localhost:27017/relationship-manager
set JWT_SECRET=your-secret-key-here-12345
set NODE_ENV=development
set PORT=5000
echo Starting LinkMind Backend Server...
echo Port: %PORT%
echo MongoDB: %MONGODB_URI%
echo.
node simple-start.js
pause
