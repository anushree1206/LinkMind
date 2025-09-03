@echo off
title LinkMind Frontend Server
cd /d "%~dp0frontend"
echo Starting LinkMind Frontend Server...
echo Port: 3000
echo.
npm run dev
pause
