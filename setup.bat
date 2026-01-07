@echo off
echo ========================================
echo DocAuto - Document Automation Platform
echo Quick Start Script
echo ========================================
echo.

echo [1/5] Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Docker is not installed. You'll need to set up PostgreSQL and Redis manually.
    echo.
    goto manual_setup
)

echo [2/5] Setting up environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env - Please update with your credentials
)

echo.
echo [3/5] Starting Docker containers (PostgreSQL + Redis)...
docker-compose up -d postgres redis
timeout /t 10 /nobreak >nul

echo.
echo [4/5] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [5/5] Running database migrations...
call npm run migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run database migrations
    pause
    exit /b 1
)

cd ..

echo.
echo [6/6] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Backend:  cd backend  && npm run dev
echo   2. Frontend: cd frontend && npm run dev
echo.
echo Backend will run on:  http://localhost:3000
echo Frontend will run on: http://localhost:3001
echo.
echo Don't forget to update backend\.env with your:
echo   - AWS credentials (for S3)
echo   - OpenAI API key (for AI features)
echo   - Stripe keys (for payments)
echo.
pause
exit /b 0

:manual_setup
echo.
echo Manual Setup Required:
echo 1. Install PostgreSQL 14+ and create database 'docauto'
echo 2. Install Redis 6+
echo 3. Update backend\.env with your database credentials
echo 4. Run: cd backend && npm install && npm run migrate
echo 5. Run: cd frontend && npm install
echo 6. Start backend: cd backend && npm run dev
echo 7. Start frontend: cd frontend && npm run dev
echo.
pause
exit /b 0
