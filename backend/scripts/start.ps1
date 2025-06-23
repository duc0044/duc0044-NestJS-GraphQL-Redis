# PowerShell script to start NestJS GraphQL Redis MySQL Project

Write-Host "🚀 Starting NestJS GraphQL Redis MySQL Project..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Start Redis and MySQL containers
Write-Host "📦 Starting Redis and MySQL containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.full.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
$redisRunning = docker ps --format "table {{.Names}}" | Select-String "redis-server"
$mysqlRunning = docker ps --format "table {{.Names}}" | Select-String "mysql-server"

if ($redisRunning -and $mysqlRunning) {
    Write-Host "✅ Services are running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service URLs:" -ForegroundColor Cyan
    Write-Host "   - NestJS API: http://localhost:3000" -ForegroundColor White
    Write-Host "   - GraphQL Playground: http://localhost:3000/graphql" -ForegroundColor White
    Write-Host "   - phpMyAdmin: http://localhost:8080" -ForegroundColor White
    Write-Host "   - Redis Commander: http://localhost:8081" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Default credentials:" -ForegroundColor Cyan
    Write-Host "   - MySQL: root / 140204" -ForegroundColor White
    Write-Host "   - Redis: duc0044" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Some services failed to start. Please check Docker logs." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the NestJS application
Write-Host "🚀 Starting NestJS application..." -ForegroundColor Green
npm run dev 