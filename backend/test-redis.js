const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

async function testRedisIntegration() {
  try {
    console.log('🚀 Testing Redis Integration with Blog API...\n');

    // Test 1: Test Redis ping
    console.log('1. Testing Redis connection...');
    const pingResponse = await axios.post(API_URL, {
      query: `
        query {
          redisPing
        }
      `
    });

    console.log('✅ Redis ping:', pingResponse.data.data.redisPing);

    // Test 2: Create a user
    console.log('\n2. Creating a user...');
    const createUserResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(createUserInput: {
            username: "redisuser"
            email: "redis@example.com"
            password: "password123"
          }) {
            id
            username
            email
          }
        }
      `
    });

    const user = createUserResponse.data.data.createUser;
    console.log('✅ User created:', user.username);

    // Test 3: Create a category
    console.log('\n3. Creating a category...');
    const createCategoryResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createCategory(createCategoryInput: {
            name: "Redis Testing"
            slug: "redis-testing"
            description: "Testing Redis caching"
          }) {
            id
            name
            slug
          }
        }
      `
    });

    const category = createCategoryResponse.data.data.createCategory;
    console.log('✅ Category created:', category.name);

    // Test 4: Query categories (should be cached)
    console.log('\n4. Querying categories (first time - from DB)...');
    const startTime1 = Date.now();
    const categoriesResponse1 = await axios.post(API_URL, {
      query: `
        query {
          categories {
            id
            name
            slug
          }
        }
      `
    });
    const endTime1 = Date.now();
    console.log(`✅ Categories fetched in ${endTime1 - startTime1}ms`);

    // Test 5: Query categories again (should be from cache)
    console.log('\n5. Querying categories (second time - from cache)...');
    const startTime2 = Date.now();
    const categoriesResponse2 = await axios.post(API_URL, {
      query: `
        query {
          categories {
            id
            name
            slug
          }
        }
      `
    });
    const endTime2 = Date.now();
    console.log(`✅ Categories fetched in ${endTime2 - startTime2}ms`);

    // Test 6: Test Redis cache operations
    console.log('\n6. Testing Redis cache operations...');

    // Set a test cache
    const setCacheResponse = await axios.post(API_URL, {
      query: `
        mutation {
          setCache(key: "test:key", value: "test:value", ttl: 60)
        }
      `
    });
    console.log('✅ Cache set:', setCacheResponse.data.data.setCache);

    // Get the test cache
    const getCacheResponse = await axios.post(API_URL, {
      query: `
        query {
          getCache(key: "test:key")
        }
      `
    });
    console.log('✅ Cache get:', getCacheResponse.data.data.getCache);

    // Test 7: Get cache TTL
    const getTtlResponse = await axios.post(API_URL, {
      query: `
        query {
          getTtl(key: "test:key")
        }
      `
    });
    console.log('✅ Cache TTL:', getTtlResponse.data.data.getTtl, 'seconds');

    // Test 8: Get all cache keys
    const getKeysResponse = await axios.post(API_URL, {
      query: `
        query {
          getKeys(pattern: "*")
        }
      `
    });
    console.log('✅ Cache keys found:', getKeysResponse.data.data.getKeys.length);

    console.log('\n🎉 Redis integration test completed successfully!');
    console.log('\n📊 Performance comparison:');
    console.log(`- First query (DB): ${endTime1 - startTime1}ms`);
    console.log(`- Second query (Cache): ${endTime2 - startTime2}ms`);
    console.log(`- Performance improvement: ${Math.round(((endTime1 - startTime1) - (endTime2 - startTime2)) / (endTime1 - startTime1) * 100)}%`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRedisIntegration(); 