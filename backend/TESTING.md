# Hướng dẫn Test và Sử dụng NestJS GraphQL Redis MySQL

## 🚀 Khởi động hệ thống

### Bước 1: Khởi động Docker containers

```bash
# Chạy toàn bộ hệ thống (MySQL + Redis)
docker-compose -f docker-compose.full.yml up -d

# Hoặc chạy từng service riêng lẻ
docker-compose up -d  # Chỉ Redis
docker-compose -f docker-compose.mysql.yml up -d  # Chỉ MySQL
```

### Bước 2: Khởi động NestJS application

```bash
npm install
npm run dev
```

## 📊 Truy cập các service

- **GraphQL Playground**: http://localhost:3000/graphql
- **phpMyAdmin**: http://localhost:8080 (root/140204)
- **Redis Commander**: http://localhost:8081 (password: duc0044)

## 🧪 Test GraphQL Queries

### 1. Test Redis Connection

```graphql
query {
  redisPing
}
```

### 2. Test Cache Operations

```graphql
# Set cache
mutation {
  setCache(
    key: "test:user"
    value: "{\"id\": 1, \"name\": \"John\"}"
    ttl: 3600
  )
}

# Get cache
query {
  getCache(key: "test:user")
}

# Delete cache
mutation {
  deleteCache(key: "test:user")
}

# Get all keys with pattern
query {
  getKeys(pattern: "user:*")
}
```

### 3. Test User Operations (with Cache)

```graphql
# Create user
mutation {
  createUser(
    createUserInput: {
      name: "John Doe"
      email: "john@example.com"
      password: "password123"
    }
  ) {
    id
    name
    email
  }
}

# Get all users (cached)
query {
  users {
    id
    name
    email
  }
}

# Get user by ID (cached)
query {
  user(id: 1) {
    id
    name
    email
  }
}

# Update user
mutation {
  updateUser(
    id: 1
    updateUserInput: { name: "John Updated", email: "john.updated@example.com" }
  ) {
    id
    name
    email
  }
}

# Delete user
mutation {
  deleteUser(id: 1) {
    id
    name
    email
  }
}
```

### 4. Test Post Operations (with Cache)

```graphql
# Create post
mutation {
  createPost(
    createPostInput: {
      title: "My First Post"
      content: "This is my first post content"
      authorId: 1
    }
  ) {
    id
    title
    content
    author {
      id
      name
    }
  }
}

# Get all posts (cached)
query {
  posts {
    id
    title
    content
    author {
      id
      name
    }
    comments {
      id
      content
    }
  }
}

# Get post by ID (cached)
query {
  post(id: 1) {
    id
    title
    content
    author {
      id
      name
    }
    comments {
      id
      content
    }
  }
}
```

## 🔍 Monitoring Cache Performance

### 1. Redis Commander

Truy cập http://localhost:8081 để xem:

- Tất cả keys trong Redis
- TTL của từng key
- Memory usage
- Real-time operations

### 2. Cache Hit/Miss Analysis

```graphql
# Check if data is cached
query {
  getCache(key: "user:1")
}

# If returns null, data is not cached
# If returns data, cache hit occurred
```

### 3. Clear Cache

```graphql
# Clear specific cache
mutation {
  deleteCache(key: "user:1")
}

# Clear all cache
mutation {
  clearAllCache
}
```

## 📈 Performance Testing

### 1. Test Cache Performance

```bash
# First request (cache miss - slower)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { user(id: 1) { id name email } }"}'

# Second request (cache hit - faster)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { user(id: 1) { id name email } }"}'
```

### 2. Load Testing

```bash
# Install Apache Bench
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 -p test-query.json -T application/json http://localhost:3000/graphql
```

File `test-query.json`:

```json
{
  "query": "query { users { id name email } }"
}
```

## 🐛 Debugging

### 1. Check Redis Connection

```bash
# Connect to Redis container
docker exec -it redis-server redis-cli -a duc0044

# Test connection
ping

# List all keys
keys *

# Get specific key
get user:1

# Check TTL
ttl user:1
```

### 2. Check MySQL Connection

```bash
# Connect to MySQL container
docker exec -it mysql-server mysql -u root -p140204

# Show databases
SHOW DATABASES;

# Use test database
USE test;

# Show tables
SHOW TABLES;

# Check user table
SELECT * FROM user;
```

### 3. Check Application Logs

```bash
# View NestJS logs
docker logs <container-name>

# Follow logs in real-time
docker logs -f <container-name>
```

## 🔧 Troubleshooting

### Redis Connection Issues

1. **Connection refused**: Check if Redis container is running

   ```bash
   docker ps | grep redis
   ```

2. **Authentication failed**: Check Redis password
   ```bash
   docker exec -it redis-server redis-cli -a duc0044 ping
   ```

### MySQL Connection Issues

1. **Connection refused**: Check if MySQL container is running

   ```bash
   docker ps | grep mysql
   ```

2. **Access denied**: Check MySQL credentials
   ```bash
   docker exec -it mysql-server mysql -u root -p140204 -e "SELECT 1;"
   ```

### Cache Not Working

1. **Check Redis service**: Ensure Redis is running and accessible
2. **Check cache keys**: Use Redis Commander to verify keys are being set
3. **Check TTL**: Verify cache expiration is set correctly
4. **Check serialization**: Ensure data is properly JSON serialized

## 📊 Performance Metrics

### Expected Performance Improvements

- **First request**: ~100-200ms (database query)
- **Cached request**: ~5-10ms (Redis lookup)
- **Cache hit ratio**: Should be >80% for frequently accessed data

### Monitoring Commands

```bash
# Check Redis memory usage
docker exec -it redis-server redis-cli -a duc0044 info memory

# Check Redis keyspace
docker exec -it redis-server redis-cli -a duc0044 info keyspace

# Monitor Redis operations in real-time
docker exec -it redis-server redis-cli -a duc0044 monitor
```

## 🎯 Best Practices

1. **Cache Strategy**:

   - Cache frequently accessed data
   - Set appropriate TTL
   - Invalidate cache on data changes

2. **Key Naming**:

   - Use consistent naming convention
   - Include entity type and ID
   - Use prefixes for organization

3. **Error Handling**:

   - Always handle Redis connection errors
   - Fallback to database if cache fails
   - Log cache operations for debugging

4. **Performance**:
   - Monitor cache hit ratio
   - Optimize cache key patterns
   - Use appropriate data structures
