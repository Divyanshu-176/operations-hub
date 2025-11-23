@echo off
REM Root fix: Simple, reliable startup script
cd /d "%~dp0"

REM Check Node.js exists
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM Install if needed
if not exist "node_modules" npm install
if not exist "server\node_modules" (
    cd server
    npm install
    cd ..
)

REM Start backend in new window
start "Backend" cmd /k "cd /d %~dp0server && npm start"

REM Wait for backend
timeout /t 3 /nobreak >nul

REM Start frontend in new window  
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Open browser
timeout /t 5 /nobreak >nul
start http://localhost:8080

echo Started! Check the two windows that opened.
pause


