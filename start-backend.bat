@echo off
cd /d "c:\Users\shruthi keerthana\OneDrive\Desktop\LinkMind\backend"
set "MONGODB_URI=mongodb://localhost:27017/relationship-manager"
set "JWT_SECRET=your-secret-key-here-12345"
set "NODE_ENV=development"
set "PORT=5000"
echo Starting backend server...
node src/index.js
