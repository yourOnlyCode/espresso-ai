# Quick Setup Guide (No Docker)

## Prerequisites

1. **Node.js 18+** - Download from https://nodejs.org
2. **PostgreSQL 14+** - Download from https://www.postgresql.org/download/windows/
3. **Redis** (Optional for now) - Can skip initially

## Step-by-Step Setup

### 1. Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from: https://nodejs.org
# Install the LTS version (18.x or higher)
```

### 2. Install PostgreSQL

Download and install from: https://www.postgresql.org/download/windows/

During installation:
- Set password for postgres user (remember this!)
- Keep default port: 5432
- Install pgAdmin (GUI tool)

After installation, create database:
```bash
# Open Command Prompt and run:
createdb -U postgres docauto
```

### 3. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your settings:
# - DB_PASSWORD=your_postgres_password
# - Comment out Redis settings for now (add # at start of line)
```

**Edit backend\.env:**
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# Redis (comment out for now)
# REDIS_HOST=localhost
# REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# AWS (optional - can skip for now)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# S3_BUCKET_NAME=your-bucket

# OpenAI (optional - can skip for now)
# OPENAI_API_KEY=your_key

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 4. Run Database Migrations

```bash
# Still in backend folder
npm run migrate
```

### 5. Start Backend

```bash
# In backend folder
npm run dev

# You should see:
# 🚀 Server running on port 3000
```

### 6. Setup Frontend (New Terminal)

```bash
# Open NEW terminal window
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev

# You should see:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3001
```

### 7. Test the Application

Open browser: http://localhost:3001

You should see the landing page!

## Troubleshooting

### "npm install" fails with ENOENT

**Solution 1: Clear npm cache**
```bash
npm cache clean --force
npm install
```

**Solution 2: Delete node_modules and try again**
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Solution 3: Check Node.js version**
```bash
node --version
# Should be 18.x or higher
```

### "createdb: command not found"

**Solution:** Add PostgreSQL to PATH or use pgAdmin:
1. Open pgAdmin
2. Right-click "Databases"
3. Create → Database
4. Name: docauto

### "Cannot connect to database"

**Solution:** Check PostgreSQL is running:
1. Open Services (Windows + R, type "services.msc")
2. Find "postgresql-x64-14" (or similar)
3. Make sure it's "Running"

### Redis errors

**Solution:** Comment out Redis for now:
1. Open `backend/src/config/redis.ts`
2. Comment out the connection code
3. Or skip Redis features initially

## Simplified .env (Minimal Setup)

If you want to start with minimal features:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=dev_secret_key_12345
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3001
```

## What Works Without Redis/AWS/OpenAI

✅ User registration and login
✅ Document CRUD operations
✅ Template management
✅ Basic workflows
✅ Dashboard
✅ All UI features

❌ PDF generation (needs Puppeteer setup)
❌ AI features (needs OpenAI API key)
❌ File uploads (needs AWS S3)
❌ Session caching (needs Redis)

## Next Steps

1. Test user registration: http://localhost:3001/register
2. Create your first document
3. Explore the dashboard
4. Add AWS/OpenAI keys later for advanced features

## Need Help?

Check these files:
- **README.md** - Full documentation
- **API_DOCUMENTATION.md** - API reference
- **TROUBLESHOOTING.md** - Common issues

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run migrate      # Run database migrations
npm run dev          # Start development server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server

# Database
createdb docauto     # Create database
psql -U postgres     # Connect to PostgreSQL
```
