#!/bin/bash
# Vercel Deployment Checklist - Interactive Guide

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║         VERCEL DEPLOYMENT CHECKLIST - SELFASSESSMENT APP              ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_mark="✓"
cross_mark="✗"

step=1

# Step 1: Prerequisites
echo -e "${BLUE}STEP $step: Check Prerequisites${NC}"
((step++))

echo "1. Do you have a GitHub account? (y/n)"
read -r github_check
if [[ "$github_check" != "y" ]]; then
  echo -e "${RED}$cross_mark GitHub account required. Visit https://github.com/signup${NC}"
  exit 1
fi
echo -e "${GREEN}$check_mark GitHub account ready${NC}"

echo ""
echo "2. Do you have a Vercel account? (y/n)"
read -r vercel_check
if [[ "$vercel_check" != "y" ]]; then
  echo "Go to https://vercel.com and sign up with GitHub"
  read -p "Press Enter when done..."
fi
echo -e "${GREEN}$check_mark Vercel account ready${NC}"

echo ""
echo "3. Do you have a Supabase account for PostgreSQL? (y/n)"
read -r supabase_check
if [[ "$supabase_check" != "y" ]]; then
  echo "Go to https://supabase.com and create an account"
  read -p "Press Enter when done..."
fi
echo -e "${GREEN}$check_mark Supabase account ready${NC}"

# Step 2: Collect Information
echo ""
echo -e "${BLUE}STEP $step: Gather Required Information${NC}"
((step++))

echo ""
echo "Please provide the following:"
echo ""

read -p "GitHub username: " github_user
read -p "GitHub repository name: " github_repo
read -p "Supabase connection string (postgresql://...): " db_connection_string
read -p "Frontend project name on Vercel: " frontend_project
read -p "Backend project name on Vercel: " backend_project

# Generate JWT Secret
echo ""
echo "Generating JWT_SECRET..."
jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null)
if [ -z "$jwt_secret" ]; then
  echo -e "${YELLOW}Could not generate JWT_SECRET automatically${NC}"
  read -p "Enter a strong random string (min 32 characters): " jwt_secret
fi
echo -e "${GREEN}$check_mark JWT_SECRET generated${NC}"

# Step 3: Git Setup
echo ""
echo -e "${BLUE}STEP $step: Prepare Git Repository${NC}"
((step++))

echo "Checking git status..."
cd "$(dirname "$0")" || exit

if [ -d .git ]; then
  echo -e "${GREEN}$check_mark Git repository found${NC}"
else
  echo "Initializing git repository..."
  git init
  echo -e "${GREEN}$check_mark Git initialized${NC}"
fi

echo ""
echo "Current git status:"
git status --short

echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

# Step 4: Commit and Push
echo ""
echo -e "${BLUE}STEP $step: Commit and Push to GitHub${NC}"
((step++))

echo "Adding files..."
git add .

echo "Committing..."
git commit -m "chore: prepare for Vercel deployment"

if git remote | grep -q origin; then
  echo "Remote already configured"
else
  echo "Adding GitHub remote..."
  git remote add origin "https://github.com/$github_user/$github_repo.git"
fi

echo "Pushing to GitHub (you may be asked to authenticate)..."
git push -u origin main 2>/dev/null || git push -u origin master

echo -e "${GREEN}$check_mark Code pushed to GitHub${NC}"

# Step 5: Instructions
echo ""
echo -e "${BLUE}STEP $step: Manual Vercel Deployment${NC}"
((step++))

echo ""
echo "Follow these steps in Vercel dashboard:"
echo ""
echo "1. FRONTEND DEPLOYMENT:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'Add New' → 'Project'"
echo "   - Select repository: $github_user/$github_repo"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: ./frontend"
echo "   - Build Command: npm run build --workspace=frontend"
echo "   - Click Deploy"
echo "   - Add environment variables:"
echo "     * NEXT_PUBLIC_API_URL=https://$backend_project.vercel.app"
echo "     * NEXT_PUBLIC_APP_URL=https://$frontend_project.vercel.app"
echo ""
echo "2. BACKEND DEPLOYMENT:"
echo "   - Click 'Add New' → 'Project'"
echo "   - Select SAME repository"
echo "   - Framework Preset: Other"
echo "   - Root Directory: ./backend"
echo "   - Build Command: npm run build"
echo "   - Click Deploy"
echo "   - Add environment variables:"
echo "     * DATABASE_URL=$db_connection_string"
echo "     * JWT_SECRET=$jwt_secret"
echo "     * NODE_ENV=production"
echo "     * CORS_ORIGIN=https://$frontend_project.vercel.app"
echo ""
echo "3. SAVE YOUR CONFIGURATION:"
echo ""
echo "=== SAVE THESE VALUES ==="
echo "Frontend URL: https://$frontend_project.vercel.app"
echo "Backend URL: https://$backend_project.vercel.app"
echo "Database URL: $db_connection_string"
echo "JWT Secret: $jwt_secret"
echo "=========================="
echo ""

# Step 6: Database Setup
echo -e "${BLUE}STEP $step: Set Up Database${NC}"
((step++))

echo ""
echo "After deployments are complete, run database migrations:"
echo ""
echo "cd backend"
echo "npm install"
echo "\$env:DATABASE_URL = '$db_connection_string'"
echo "npm run db:push"
echo "npm run db:seed"
echo ""

read -p "Have you completed the above steps? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${GREEN}✓ Deployment complete!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Visit https://$frontend_project.vercel.app"
  echo "2. Log in with test credentials from seed data"
  echo "3. Test creating an assessment"
  echo "4. Monitor Vercel dashboard for errors"
else
  echo "Deployment incomplete. Come back when ready!"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT GUIDE COMPLETE                          ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
