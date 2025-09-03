@echo off
cd /d "%~dp0"
set MONGODB_URI=mongodb://localhost:27017/relationship-manager
set JWT_SECRET=your-secret-key-here-12345
set NODE_ENV=development
set PORT=5000
echo Starting LinkMind Backend Server...
node src/index.js
