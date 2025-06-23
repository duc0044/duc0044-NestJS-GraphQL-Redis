const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

// Test queries
const queries = {
  redisPing: {
    query: `
      query {
        redisPing
      }
    `
  },
  setCache: {
    query: `
      mutation {
        setCache(key: "test:quick", value: "Hello from quick test!", ttl: 60)
      }
    `
  },
  getCache: {
    query: `
      query {
        getCache(key: "test:quick")
      }
    `
  },
  createUser: {
    query: `
      mutation {
        createUser(createUserInput: {
          name: "Quick Test User"
          email: "quicktest@example.com"
          password: "password123"
        }) {
          id
          name
          email
        }
      }
    `
  },
  getUsers: {
    query: `
      query {
        users {
          id
          name
          email
        }
      }
    `
  }
};

async function makeRequest(query, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    const response = await axios.post(GRAPHQL_URL, query, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.errors) {
      console.log(`❌ Error: ${response.data.errors[0].message}`);
    } else {
      console.log(`✅ Success:`, JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

async function runQuickTest() {
  console.log('🚀 Starting Quick Test for NestJS GraphQL Redis MySQL...\n');

  // Test Redis connection
  await makeRequest(queries.redisPing, 'Redis Ping');

  // Test cache operations
  await makeRequest(queries.setCache, 'Set Cache');
  await makeRequest(queries.getCache, 'Get Cache');

  // Test user operations
  await makeRequest(queries.createUser, 'Create User');
  await makeRequest(queries.getUsers, 'Get All Users');

  console.log('\n🎉 Quick test completed!');
  console.log('\n📊 Check these URLs:');
  console.log('   - GraphQL Playground: http://localhost:3000/graphql');
  console.log('   - Redis Commander: http://localhost:8081');
  console.log('   - phpMyAdmin: http://localhost:8080');
}

// Run the test
runQuickTest().catch(console.error); 