#!/bin/bash

# 🦞 AI CTO Deploy Script - Vercel Edition
# Usage: ./deploy.sh [commit-message]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project config
PROJECT_NAME="collector-demo"
GITHUB_REPO="0xwinnie/collector-demo"
VERCEL_PROJECT="0xwinnie-collector-demo"

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME}...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Get commit message
if [ -z "$1" ]; then
    COMMIT_MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
else
    COMMIT_MSG="$1"
fi

# Check git status
echo -e "${YELLOW}📋 Checking git status...${NC}"
git status --short

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  No local changes to deploy${NC}"
    echo -e "${BLUE}🔄 Pulling latest changes from GitHub...${NC}"
    git pull origin main
    echo ""
fi

# Stage all changes
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add -A

# Commit
echo -e "${YELLOW}💾 Committing: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️  Nothing to commit${NC}"

# Push to GitHub
echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
git push origin main

COMMIT_SHA=$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Pushed commit: ${COMMIT_SHA}${NC}"
echo ""

# Wait for Vercel deployment (if VERCEL_TOKEN is set)
if [ -n "$VERCEL_TOKEN" ]; then
    echo -e "${BLUE}⏳ Waiting for Vercel deployment...${NC}"
    
    # Get deployment status
    MAX_RETRIES=30
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        sleep 5
        
        # Query Vercel API for deployment status
        DEPLOYMENT_STATUS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
            "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT&limit=1" \
            | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ "$DEPLOYMENT_STATUS" = "READY" ]; then
            echo -e "${GREEN}🎉 Deployment successful!${NC}"
            
            # Get deployment URL
            DEPLOY_URL=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
                "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT&limit=1" \
                | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
            
            echo -e "${GREEN}🌐 Live URL: https://${DEPLOY_URL}${NC}"
            echo -e "${GREEN}🌐 Custom Domain: https://testing0906.sol.site${NC}"
            break
        elif [ "$DEPLOYMENT_STATUS" = "ERROR" ]; then
            echo -e "${RED}❌ Deployment failed!${NC}"
            echo -e "${BLUE}📊 Check logs: https://vercel.com/${GITHUB_REPO}/${COMMIT_SHA}${NC}"
            exit 1
        fi
        
        echo -n "."
        RETRY_COUNT=$((RETRY_COUNT + 1))
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "\n${YELLOW}⏰ Timeout waiting for deployment${NC}"
        echo -e "${BLUE}📊 Check status: https://vercel.com/${GITHUB_REPO}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN not set, skipping deployment check${NC}"
    echo -e "${BLUE}📊 Vercel will auto-deploy from GitHub push${NC}"
    echo -e "${BLUE}🌐 Check status: https://vercel.com/${GITHUB_REPO}${NC}"
fi

echo ""
echo -e "${GREEN}✨ Deploy script completed!${NC}"
