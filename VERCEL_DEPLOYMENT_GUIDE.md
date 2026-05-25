# Vercel Deployment Guide - Selfassessment App

## Overview
- **Frontend**: Next.js 14 app → Vercel
- **Backend**: Express.js API → Vercel (serverless functions)
- **Database**: PostgreSQL → Supabase (free tier available)

This guide walks you through the entire deployment process, taking ~30-45 minutes.

---

## Step 1: Set Up PostgreSQL Database (Supabase) - 5 minutes

### Option A: Free Supabase Tier (Recommended for testing)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign up with GitHub
3. Create a new project:
   - Project name: `selfassessment-app-prod`
   - Region: Choose closest to you
   - Password: Generate strong password (save it!)
4. Wait for project to initialize (~2 minutes)

5. Get your connection string:
   - Go to **Settings** → **Database**
   - Under "Connection string", select **URI**
   - Copy the connection string (looks like: `postgresql://postgres:PASSWORD@host:5432/postgres`)
   - Replace `[YOUR-PASSWORD]` with the password you created

**Save this value - you'll need it for Vercel environment variables.**

### Option B: AWS RDS (Production-grade)
If you prefer AWS:
1. Create RDS PostgreSQL instance
2. Get connection string from RDS dashboard
3. Follow same steps as above with your connection string

---

## Step 2: Push Code to GitHub - 5 minutes

Your project needs to be on GitHub for Vercel to access it.

```bash
cd C:\Users\staff\Selfassesment-app

# If not already a git repo:
git init

# Add all files
git add .

# Commit
git commit -m "feat: ISO 9001 Self-Assessment App - ready for deployment"

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: If your repo already exists and is on GitHub, just ensure _archive is in .gitignore and push:
```bash
git add .gitignore
git commit -m "chore: add _archive to gitignore"
git push
```

---

## Step 3: Deploy Frontend to Vercel - 10 minutes

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### 3.2 Import Frontend Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. Configure the import:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build --workspace=frontend`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

4. Click **"Deploy"**

Vercel will build and deploy. You'll get a URL like:
`https://your-app-name.vercel.app`

**Save this frontend URL - you'll need it for the backend.**

---

## Step 4: Set Up Backend on Vercel - 15 minutes

The backend runs as Vercel serverless functions.

### 4.1 Configure Backend for Vercel

Update `backend/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build --workspace=backend",
  "public": false,
  "functions": {
    "src/index.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

Create this file in your project root (not in backend folder):

```json
// vercel.json in root of project
{
  "version": 2,
  "public": false,
  "buildCommand": "cd backend && npm run build",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

Actually, let's use a simpler approach with backend as separate deployment. Let me guide you:

### 4.2 Create `vercel.json` in Backend Folder

In `backend/` create a file `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "public": false,
  "functions": {
    "src/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/index.ts"
    }
  ]
}
```

### 4.3 Import Backend to Vercel (as separate project)

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select same GitHub repository
3. Configure the import:
   - **Root Directory**: `./backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: (add next step)

### 4.4 Add Environment Variables to Backend

In Vercel backend settings, add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1 |
| `JWT_SECRET` | Generate a strong random string (min 32 chars) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your frontend Vercel URL (e.g., `https://your-app.vercel.app`) |
| `PORT` | `3001` |

**How to generate JWT_SECRET**:
```bash
# On Windows, in PowerShell:
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32|ForEach-Object {[char][byte](Get-Random -Min 33 -Max 127)})-join ''))

# Or use this simpler version:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click **"Deploy"**

**Save the backend URL**, looks like:
`https://backend-project-name.vercel.app`

---

## Step 5: Connect Frontend to Backend - 5 minutes

### 5.1 Update Frontend Environment Variables

In your Vercel frontend project settings, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | Your backend Vercel URL (e.g., `https://backend-project.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Your frontend URL (e.g., `https://your-app.vercel.app`) |

### 5.2 Redeploy Frontend

1. Go to Vercel frontend project
2. Go to **Deployments**
3. Click the latest deployment
4. Click **"Redeploy"** (this picks up new env vars)

---

## Step 6: Set Up Database on First Deploy - 10 minutes

### 6.1 Run Database Migrations

After backend is deployed, you need to run migrations:

```bash
# From your local machine, in the backend folder:
cd backend

# Set your production database URL temporarily
$env:DATABASE_URL = "your-supabase-connection-string-here"

# Run migrations
npm run db:push

# Seed with test data (optional but recommended)
npm run db:seed
```

Or use Vercel CLI to run directly on the deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run command on Vercel
vercel env pull  # Get production env vars locally

# Then run migrations
npm run db:push
```

---

## Step 7: Test Your Deployment - 5 minutes

### Test Backend API

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test Frontend

1. Go to `https://your-app.vercel.app`
2. Try logging in with test credentials from seed data
3. Check if data loads from backend
4. Create a test assessment to verify API connection

---

## Environment Variables Reference

### Frontend (.env.local or Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

### Backend (.env or Vercel)
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-random-secret-key-min-32-chars
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=3001
```

---

## Troubleshooting

### "Database connection refused"
- Check DATABASE_URL is correct in Vercel env vars
- Verify Supabase project is running
- Check IP whitelist in Supabase (allow all for now)

### "CORS errors in browser console"
- Verify CORS_ORIGIN env var matches your frontend URL exactly
- Check backend is deployed and responding

### "Frontend can't connect to backend"
- Check NEXT_PUBLIC_API_URL in frontend env vars
- Verify backend URL is correct and accessible
- Check browser console for actual error message

### "Build fails on Vercel"
- Check build logs in Vercel dashboard
- Ensure package.json scripts are correct
- Verify all dependencies are in package.json (not global)

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Vercel
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Frontend can load data from backend
- [ ] Login works
- [ ] Create assessment works
- [ ] Can upload evidence files
- [ ] PDF reports generate

---

## Next Steps

### Production Hardening
1. Enable HTTPS (automatic with Vercel)
2. Set up error monitoring (Sentry, LogRocket)
3. Set up analytics
4. Configure domain name (custom domain on Vercel)
5. Set up automated backups for database

### Database
1. Set production backups in Supabase
2. Monitor database size and connections
3. Set up database alerts

### Monitoring
1. Monitor Vercel deployment analytics
2. Set up error tracking
3. Monitor backend API response times

---

## Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Your Frontend: (will show after Step 3)
- Your Backend: (will show after Step 4)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Estimated Total Time**: 30-45 minutes
**Cost**: Free tier covers most small projects (~$5/month for production if you need more)
