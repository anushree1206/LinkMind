@echo off
title LinkMind Backend - LinkedIn Sync Fix
cd /d "%~dp0backend"
set "MONGODB_URI=mongodb://localhost:27017/relationship-manager"
set "JWT_SECRET=your-secret-key-here-12345"
set "NODE_ENV=development"
set "PORT=5000"
echo.
echo ========================================
echo   Starting LinkMind Backend Server
echo ========================================
echo.
echo MongoDB URI: %MONGODB_URI%
echo Port: %PORT%
echo Environment: %NODE_ENV%
echo.
echo Starting server...
node src/index.js
