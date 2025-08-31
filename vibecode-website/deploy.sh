#!/bin/bash

# VibeCode Website Deployment Script
# Created by Tushar Aggarwal for the VibeCode project

echo "🚀 VibeCode Website Deployment Script"
echo "======================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the vibecode-website directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧹 Cleaning previous builds..."
rm -rf .next out

echo "🔧 Running type checking..."
npm run type-check

echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Static files generated in 'out' directory"
    echo "📊 Build statistics:"
    du -sh out
    echo ""
    echo "🌐 Ready for deployment to:"
    echo "  • Vercel (recommended)"
    echo "  • Netlify" 
    echo "  • GitHub Pages"
    echo "  • Any static hosting provider"
    echo ""
    echo "🎉 Deployment ready! Upload the 'out' directory to your hosting provider."
else
    echo "❌ Build failed. Please check the errors above and try again."
    exit 1
fi