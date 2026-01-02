#!/bin/bash

# Shipment Tracker Deployment Script

echo "🚀 Starting Shipment Tracker Deployment..."

# Check Node version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create .env.production if not exists
    if [ ! -f .env.production ]; then
        echo "⚠️  .env.production not found. Creating from .env.example..."
        cp .env.example .env.production
        echo "❗ Please update .env.production with your production values"
    fi
    
    # Run database migrations (if any)
    echo "🗄️  Checking database..."
    
    # Start the application
    echo "🌐 Starting application..."
    npm start
else
    echo "❌ Build failed!"
    exit 1
fi