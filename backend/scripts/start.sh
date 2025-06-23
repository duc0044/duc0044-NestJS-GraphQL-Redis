#!/bin/bash

echo "🚀 Starting NestJS GraphQL Redis MySQL Project..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Redis and MySQL containers
echo "📦 Starting Redis and MySQL containers..."
docker-compose -f docker-compose.full.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if docker ps | grep -q "redis-server" && docker ps | grep -q "mysql-server"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "   - NestJS API: http://localhost:3000"
    echo "   - GraphQL Playground: http://localhost:3000/graphql"
    echo "   - phpMyAdmin: http://localhost:8080"
    echo "   - Redis Commander: http://localhost:8081"
    echo ""
    echo "🔑 Default credentials:"
    echo "   - MySQL: root / 140204"
    echo "   - Redis: duc0044"
    echo ""
else
    echo "❌ Some services failed to start. Please check Docker logs."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the NestJS application
echo "🚀 Starting NestJS application..."
npm run dev 