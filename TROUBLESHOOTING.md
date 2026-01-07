# Troubleshooting Guide

## Common Issues and Solutions

### 1. "docker-compose is not recognized"

**Cause:** Docker Desktop is not installed.

**Solution:** Use manual setup instead:
```bash
# Run this instead:
setup-manual.bat

# Or follow: SETUP_NO_DOCKER.md
```

---

### 2. "npm install" fails with ENOENT errors

**Cause:** npm cache corruption or permission issues.

**Solutions:**

**Option A: Clear npm cache**
```bash
npm cache clean --force
npm install
```

**Option B: Delete and reinstall**
```bash
# In backend or frontend folder
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Option C: Run as Administrator**
```bash
# Right-click Command Prompt
# Select "Run as Administrator"
cd path\to\espresso-ai\backend
npm install
```

**Option D: Check Node.js installation**
```bash
node --version
npm --version

# Should show:
# v18.x.x or higher
# 9.x.x or higher
```

If not installed or old version:
- Download from: https://nodejs.org
- Install LTS version (18.x or 20.x)
- Restart terminal after installation

---

### 3. "Cannot find module" errors

**Cause:** Dependencies not installed properly.

**Solution:**
```bash
# Delete everything and start fresh
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

cd ..\frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### 4. PostgreSQL connection errors

**Error:** "ECONNREFUSED" or "password authentication failed"

**Solutions:**

**Check PostgreSQL is running:**
```bash
# Windows Services
# Press Windows + R
# Type: services.msc
# Find: postgresql-x64-14 (or similar)
# Status should be "Running"
```

**Check credentials in .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

**Create database if missing:**
```bash
# Using psql
psql -U postgres
CREATE DATABASE docauto;
\q

# Or using pgAdmin GUI
# Right-click Databases → Create → Database
# Name: docauto
```

---

### 5. "Port 3000 already in use"

**Cause:** Another application is using port 3000.

**Solutions:**

**Option A: Kill the process**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Option B: Change port**
```bash
# Edit backend/.env
PORT=3001

# Or run with different port
set PORT=3001 && npm run dev
```

---

### 6. Redis connection errors

**Cause:** Redis not installed or not running.

**Solutions:**

**Option A: Skip Redis for now**
```bash
# Comment out Redis in backend/src/server.ts
# Find this line:
# await connectRedis();
# Change to:
# // await connectRedis();
```

**Option B: Install Redis**
- Windows: https://github.com/microsoftarchive/redis/releases
- Or use Redis Cloud (free): https://redis.com/try-free/

**Option C: Use Redis Cloud**
```env
# In backend/.env
REDIS_HOST=your-redis-cloud-host.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password
```

---

### 7. "npm run migrate" fails

**Error:** Database connection or migration errors.

**Solutions:**

**Check database exists:**
```bash
psql -U postgres -l
# Should list "docauto" database
```

**Check .env settings:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=correct_password
```

**Run migration manually:**
```bash
cd backend
node -r ts-node/register src/database/migrate.ts
```

---

### 8. Frontend won't start

**Error:** "Module not found" or build errors.

**Solutions:**

**Reinstall dependencies:**
```bash
cd frontend
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json
npm install
npm run dev
```

**Check Node.js version:**
```bash
node --version
# Must be 18.x or higher for Next.js 14
```

---

### 9. "Cannot GET /api/..." errors

**Cause:** Backend not running or wrong URL.

**Solutions:**

**Check backend is running:**
```bash
# Should see in backend terminal:
# 🚀 Server running on port 3000
```

**Test backend directly:**
```bash
# Open browser or use curl:
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

**Check frontend API URL:**
```javascript
// frontend/src/lib/api.ts
// Should have:
baseURL: process.env.API_URL || 'http://localhost:3000/api'
```

---

### 10. TypeScript errors

**Error:** "Cannot find name" or type errors.

**Solutions:**

**Reinstall TypeScript:**
```bash
npm install -D typescript @types/node
```

**Check tsconfig.json exists:**
```bash
# Should exist in both:
backend/tsconfig.json
frontend/tsconfig.json
```

---

## Quick Fixes Checklist

Before asking for help, try these:

- [ ] Node.js 18+ installed: `node --version`
- [ ] npm working: `npm --version`
- [ ] PostgreSQL installed and running
- [ ] Database "docauto" created
- [ ] .env file exists in backend folder
- [ ] .env has correct database password
- [ ] npm install completed without errors
- [ ] Migrations ran successfully
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001

---

## Minimal Working Setup

If you just want to see it work quickly:

### 1. Install Only Node.js and PostgreSQL

Skip Redis, AWS, OpenAI for now.

### 2. Minimal .env

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=dev_secret_123
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
```

### 3. Comment out Redis

In `backend/src/server.ts`, comment out:
```typescript
// await connectRedis();
```

### 4. Run

```bash
# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Still Having Issues?

### Check System Requirements

**Minimum:**
- Windows 10 or higher
- Node.js 18.x or higher
- PostgreSQL 14 or higher
- 4GB RAM
- 2GB free disk space

### Get Detailed Error Info

```bash
# Run with verbose logging
npm install --verbose
npm run dev --verbose
```

### Clean Everything

```bash
# Nuclear option - start completely fresh
cd backend
rmdir /s /q node_modules
rmdir /s /q dist
del package-lock.json

cd ..\frontend
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json

# Then reinstall
cd ..\backend
npm install

cd ..\frontend
npm install
```

---

## Contact & Resources

- Node.js Download: https://nodejs.org
- PostgreSQL Download: https://www.postgresql.org/download/
- npm Documentation: https://docs.npmjs.com
- Next.js Docs: https://nextjs.org/docs

---

## Common Error Messages Decoded

| Error | Meaning | Fix |
|-------|---------|-----|
| ENOENT | File/folder not found | Check path, reinstall |
| EACCES | Permission denied | Run as Administrator |
| ECONNREFUSED | Can't connect | Check service is running |
| EADDRINUSE | Port already used | Kill process or change port |
| MODULE_NOT_FOUND | Missing dependency | npm install |
| ETIMEDOUT | Network timeout | Check internet, try again |

---

**Remember:** You don't need Docker, Redis, AWS, or OpenAI to get started. Just Node.js and PostgreSQL are enough to run the core application!
