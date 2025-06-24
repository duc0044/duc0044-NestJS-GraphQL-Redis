# Blog API Documentation

This is a complete GraphQL API for a blog system built with NestJS, TypeORM, MySQL, and Redis with role-based access control.

## Features

- **User Management**: Registration, authentication, profile management
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Category Management**: Create, read, update, delete categories (Admin only)
- **Post Management**: Create, read, update, delete blog posts with tags
- **Comment System**: Add comments to posts
- **Tag System**: Manage tags and associate them with posts
- **Search**: Search posts by title and content
- **Relationships**: Full support for relationships between entities
- **Redis Caching**: Performance optimization with intelligent caching
- **JWT Authentication**: Secure token-based authentication

## Role-Based Access Control

### User Roles

- **USER**: Regular user with limited permissions
- **ADMIN**: Administrator with full system access

### Permission Matrix

| Operation         | USER | ADMIN |
| ----------------- | ---- | ----- |
| View posts        | ✅   | ✅    |
| Create posts      | ✅   | ✅    |
| Edit own posts    | ✅   | ✅    |
| Edit any post     | ❌   | ✅    |
| Delete own posts  | ✅   | ✅    |
| Delete any post   | ❌   | ✅    |
| View categories   | ✅   | ✅    |
| Create categories | ❌   | ✅    |
| Edit categories   | ❌   | ✅    |
| Delete categories | ❌   | ✅    |
| View all users    | ❌   | ✅    |
| Edit user roles   | ❌   | ✅    |
| Delete users      | ❌   | ✅    |
| Create comments   | ✅   | ✅    |
| Edit comments     | ✅   | ✅    |
| Delete comments   | ✅   | ✅    |

## Authentication

### JWT Token

All protected operations require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Response

```graphql
type LoginResponse {
  user: User!
  token: String!
}
```

## Database Schema

The API uses the following database tables:

- `users` - User accounts with roles
- `categories` - Blog categories
- `posts` - Blog posts
- `comments` - Comments on posts
- `tags` - Tags for posts
- `post_tags` - Many-to-many relationship between posts and tags

## GraphQL Endpoints

### Authentication Operations

#### Login

```graphql
mutation {
  login(loginInput: { email: "user@example.com", password: "password123" }) {
    user {
      id
      username
      email
      role
    }
    token
  }
}
```

#### Get Current User

```graphql
query {
  me {
    id
    username
    email
    role
  }
}
```

### User Operations

#### Create User

```graphql
mutation {
  createUser(
    createUserInput: {
      username: "john_doe"
      email: "john@example.com"
      password: "password123"
      role: USER # or ADMIN
    }
  ) {
    id
    username
    email
    role
    created_at
  }
}
```

#### Get All Users (Admin Only)

```graphql
query {
  users {
    id
    username
    email
    role
    created_at
    posts {
      id
      title
    }
    comments {
      id
      content
    }
  }
}
```

#### Update User (Admin Only)

```graphql
mutation {
  updateUser(
    id: 1
    updateUserInput: {
      username: "new_username"
      email: "newemail@example.com"
      role: ADMIN
    }
  ) {
    id
    username
    email
    role
  }
}
```

#### Update My Profile (Authenticated Users)

```graphql
mutation {
  updateMyProfile(
    updateUserInput: { username: "new_username", email: "newemail@example.com" }
  ) {
    id
    username
    email
    role
  }
}
```

#### Promote User to Admin (Admin Only)

```graphql
mutation {
  promoteToAdmin(userId: 1) {
    id
    username
    role
  }
}
```

#### Demote User (Admin Only)

```graphql
mutation {
  demoteToUser(userId: 1) {
    id
    username
    role
  }
}
```

### Category Operations

#### Create Category (Admin Only)

```graphql
mutation {
  createCategory(
    createCategoryInput: {
      name: "Technology"
      slug: "technology"
      description: "Technology related posts"
    }
  ) {
    id
    name
    slug
    description
  }
}
```

#### Get All Categories (Public)

```graphql
query {
  categories {
    id
    name
    slug
    description
    posts {
      id
      title
    }
  }
}
```

#### Update Category (Admin Only)

```graphql
mutation {
  updateCategory(
    id: 1
    updateCategoryInput: {
      name: "Updated Technology"
      slug: "updated-technology"
      description: "Updated description"
    }
  ) {
    id
    name
    slug
  }
}
```

### Post Operations

#### Create Post (Authenticated Users)

```graphql
mutation {
  createPost(
    createPostInput: {
      title: "My First Blog Post"
      slug: "my-first-blog-post"
      content: "This is the content of my first blog post..."
      thumbnail: "https://example.com/image.jpg"
      category_id: 1
      tag_ids: [1, 2, 3]
    }
  ) {
    id
    title
    slug
    content
    user {
      username
    }
    category {
      name
    }
    tags {
      name
    }
  }
}
```

#### Get All Posts (Public)

```graphql
query {
  posts {
    id
    title
    slug
    content
    thumbnail
    created_at
    user {
      username
    }
    category {
      name
    }
    tags {
      name
    }
    comments {
      content
      user {
        username
      }
    }
  }
}
```

#### Get My Posts (Authenticated Users)

```graphql
query {
  myPosts {
    id
    title
    slug
    created_at
  }
}
```

#### Update Post (Owner or Admin)

```graphql
mutation {
  updatePost(
    id: 1
    updatePostInput: { title: "Updated Title", content: "Updated content" }
  ) {
    id
    title
    content
  }
}
```

### Comment Operations

#### Create Comment (Authenticated Users)

```graphql
mutation {
  createComment(
    createCommentInput: { content: "Great post!", post_id: 1, user_id: 1 }
  ) {
    id
    content
    created_at
    user {
      username
    }
    post {
      title
    }
  }
}
```

### Tag Operations

#### Create Tag (Admin Only)

```graphql
mutation {
  createTag(createTagInput: { name: "JavaScript", slug: "javascript" }) {
    id
    name
    slug
  }
}
```

## Redis Operations

### Cache Management

```graphql
# Set cache
mutation {
  setCache(key: "test:key", value: "test:value", ttl: 60)
}

# Get cache
query {
  getCache(key: "test:key")
}

# Delete cache
mutation {
  deleteCache(key: "test:key")
}

# Get cache TTL
query {
  getTtl(key: "test:key")
}

# Get all cache keys
query {
  getKeys(pattern: "*")
}

# Clear all cache
mutation {
  clearAllCache
}
```

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:

   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=3307
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=140204
   DATABASE_NAME=test

   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=duc0044
   REDIS_DB=0
   REDIS_KEY_PREFIX=app:

   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Database Setup**

   - Create a MySQL database
   - The tables will be created automatically when you start the application

4. **Start the Application**

   ```bash
   npm run dev
   ```

5. **Access GraphQL Playground**
   Open your browser and go to `http://localhost:3000/graphql`

## Testing

### Test Role-Based Access Control

```bash
node test-roles.js
```

### Test Redis Integration

```bash
node test-redis.js
```

### Test Basic API

```bash
node test-api.js
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions
- **Password Hashing**: Bcrypt password hashing
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Redis-based rate limiting (can be implemented)

## Performance Features

- **Redis Caching**: Intelligent caching for frequently accessed data
- **Database Optimization**: Efficient queries with proper indexing
- **Connection Pooling**: TypeORM connection pooling
- **Lazy Loading**: On-demand relationship loading

## Error Handling

The API includes comprehensive error handling:

- **Authentication Errors**: Invalid tokens, expired tokens
- **Authorization Errors**: Insufficient permissions
- **Validation Errors**: Input validation using class-validator
- **Not Found Errors**: When entities don't exist
- **Conflict Errors**: When trying to create duplicate entries

## Example Usage with Authentication

```graphql
# 1. Create an admin user
mutation {
  createUser(
    createUserInput: {
      username: "admin"
      email: "admin@example.com"
      password: "password123"
      role: ADMIN
    }
  ) {
    id
    username
    role
  }
}

# 2. Login to get token
mutation {
  login(loginInput: { email: "admin@example.com", password: "password123" }) {
    user {
      id
      username
      role
    }
    token
  }
}

# 3. Use token in Authorization header for protected operations
# Headers: { "Authorization": "Bearer <your-token>" }
mutation {
  createCategory(
    createCategoryInput: {
      name: "Technology"
      slug: "technology"
      description: "Tech posts"
    }
  ) {
    id
    name
  }
}
```

This API provides a complete blog system with role-based access control, authentication, caching, and all essential features for content management and user interaction.
