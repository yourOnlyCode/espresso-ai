@echo off
echo ========================================
echo DocAuto - Manual Setup (No Docker)
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend

echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please edit it with your database credentials.
)

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed in backend
    echo.
    echo Please ensure:
    echo 1. Node.js 18+ is installed: node --version
    echo 2. npm is working: npm --version
    echo.
    echo If Node.js is not installed, download from: https://nodejs.org
    pause
    exit /b 1
)

cd ..

echo.
echo Step 2: Setting up Frontend...
cd frontend

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed in frontend
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: You need to install PostgreSQL and Redis manually:
echo.
echo 1. PostgreSQL 14+: https://www.postgresql.org/download/windows/
echo    - Create database: createdb docauto
echo    - Update backend\.env with your credentials
echo.
echo 2. Redis: https://github.com/microsoftarchive/redis/releases
echo    - Or use Redis Cloud (free): https://redis.com/try-free/
echo.
echo 3. Run migrations:
echo    cd backend
echo    npm run migrate
echo.
echo 4. Start backend:
echo    cd backend
echo    npm run dev
echo.
echo 5. Start frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
pause
