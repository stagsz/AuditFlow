@echo off
REM Vercel Deployment Checklist - Windows Batch Version

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         VERCEL DEPLOYMENT CHECKLIST - SELFASSESSMENT APP              ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check Git
echo [STEP 1] Checking Git Setup...
if not exist .git (
  echo Initializing git repository...
  call git init
) else (
  echo Git repository found
)
echo.

REM Step 2: Collect information
echo [STEP 2] Gathering Information...
echo.
set /p github_user="GitHub username: "
set /p github_repo="GitHub repository name: "
set /p backend_url="Backend URL (e.g., my-backend.vercel.app): "
set /p frontend_url="Frontend URL (e.g., my-app.vercel.app): "
set /p db_url="Supabase connection string: "
echo.

REM Generate JWT Secret
echo Generating JWT_SECRET...
for /f "delims=" %%a in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set jwt_secret=%%a

REM Step 3: Commit and Push
echo.
echo [STEP 3] Preparing Git...
echo Adding files...
call git add .

echo Committing...
call git commit -m "chore: prepare for Vercel deployment"

echo Adding GitHub remote...
call git remote add origin https://github.com/%github_user%/%github_repo%.git 2>nul
if %errorlevel% neq 0 (
  echo Remote already configured
)

echo Pushing to GitHub (authenticate when prompted)...
call git push -u origin main
if %errorlevel% neq 0 (
  echo Trying master branch...
  call git push -u origin master
)

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    DEPLOYMENT CONFIGURATION                           ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo [FRONTEND] Add these environment variables in Vercel:
echo   NEXT_PUBLIC_API_URL=https://%backend_url%
echo   NEXT_PUBLIC_APP_URL=https://%frontend_url%
echo.
echo [BACKEND] Add these environment variables in Vercel:
echo   DATABASE_URL=%db_url%
echo   JWT_SECRET=%jwt_secret%
echo   NODE_ENV=production
echo   CORS_ORIGIN=https://%frontend_url%
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    SAVE THESE VALUES SECURELY                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Frontend URL: https://%frontend_url%
echo Backend URL: https://%backend_url%
echo JWT Secret: %jwt_secret%
echo Database URL: %db_url%
echo.

REM Step 4: Database setup
echo.
echo [STEP 4] Run Database Migrations (after Vercel deploys)
echo.
echo Commands to run:
echo   cd backend
echo   npm install
echo   $env:DATABASE_URL = "%db_url%"
echo   npm run db:push
echo   npm run db:seed
echo.

echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    NEXT STEPS                                          ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo 1. Open Vercel dashboard: https://vercel.com/dashboard
echo.
echo 2. IMPORT FRONTEND:
echo    - Click "Add New" ^> "Project"
echo    - Select: %github_user%/%github_repo%
echo    - Root Directory: ./frontend
echo    - Build Command: npm run build --workspace=frontend
echo    - Deploy ^> Add env vars from above
echo.
echo 3. IMPORT BACKEND (same repo, different project):
echo    - Click "Add New" ^> "Project"
echo    - Select: %github_user%/%github_repo%
echo    - Root Directory: ./backend
echo    - Build Command: npm run build
echo    - Deploy ^> Add env vars from above
echo.
echo 4. Run database migrations:
echo    cd backend
echo    npm install
echo    npm run db:push
echo    npm run db:seed
echo.
echo 5. Visit your frontend URL and test!
echo.

pause
