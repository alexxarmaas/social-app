# 🚀 Quick Vercel Deployment Script

Write-Host "🚗 Deploying Tramassso to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host ""
Write-Host "📦 Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/dashboard"
Write-Host "2. Select your project"
Write-Host "3. Go to Storage tab"
Write-Host "4. Create Postgres database"
Write-Host "5. Create Blob storage"
Write-Host "6. Set environment variables:"
Write-Host "   - NEXTAUTH_URL (your production URL)"
Write-Host "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
Write-Host "7. Run: npx prisma db push (to sync database schema)"
Write-Host ""
Write-Host "🎉 Your app is live!" -ForegroundColor Green
