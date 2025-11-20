#!/bin/bash
set -e

echo "🚀 Starting kentangpas backend deployment..."

cd /var/www/bibitku-be

echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --production

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running database seeder (optional)..."
npm run db:seed || echo "⚠️  Seeder skipped or failed (not critical)"

echo "♻️  Restarting PM2 application..."
pm2 restart bibitku-be

echo "✅ Backend deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status bibitku-be

echo ""
echo "📝 Recent Logs:"
pm2 logs bibitku-be --lines 20 --nostream

echo ""
echo "🔍 Health Check:"
sleep 2
curl -s http://localhost:4000/health || echo "⚠️  Health check failed"
