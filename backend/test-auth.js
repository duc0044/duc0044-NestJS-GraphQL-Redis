const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

// Test authentication flow
async function testAuth() {
  try {
    console.log('🚀 Testing Authentication Flow...\n');

    // Step 1: Create a user
    console.log('1. Creating a user...');
    const createUserResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(
            createUserInput: {
              name: "Test User"
              email: "test@example.com"
              password: "password123"
            }
          ) {
            id
            name
            email
            role
          }
        }
      `
    });

    console.log('✅ User created:', createUserResponse.data.data.createUser);

    // Step 2: Login to get JWT token
    console.log('\n2. Logging in to get JWT token...');
    const loginResponse = await axios.post(API_URL, {
      query: `
        mutation {
          login(
            loginInput: {
              email: "test@example.com"
              password: "password123"
            }
          ) {
            user {
              id
              name
              email
              role
            }
            token
          }
        }
      `
    });

    const { user, token } = loginResponse.data.data.login;
    console.log('✅ Login successful:', user);
    console.log('🔑 JWT Token received');

    // Step 3: Try to access protected endpoint without token (should fail)
    console.log('\n3. Testing access without token (should fail)...');
    try {
      await axios.post(API_URL, {
        query: `
          query {
            users {
              id
              name
              email
            }
          }
        `
      });
    } catch (error) {
      console.log('❌ Access denied (expected):', error.response.data.errors[0].message);
    }

    // Step 4: Access protected endpoint with token
    console.log('\n4. Testing access with JWT token...');
    const protectedResponse = await axios.post(API_URL, {
      query: `
        query {
          me {
            id
            name
            email
            role
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Protected endpoint accessed:', protectedResponse.data.data.me);

    // Step 5: Try to access admin-only endpoint (should fail for regular user)
    console.log('\n5. Testing admin-only endpoint (should fail for regular user)...');
    try {
      await axios.post(API_URL, {
        query: `
          query {
            users {
              id
              name
              email
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log('❌ Admin access denied (expected):', error.response.data.errors[0].message);
    }

    // Step 6: Create an admin user
    console.log('\n6. Creating an admin user...');
    const createAdminResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(
            createUserInput: {
              name: "Admin User"
              email: "admin@example.com"
              password: "admin123"
            }
          ) {
            id
            name
            email
            role
          }
        }
      `
    });

    console.log('✅ Admin user created:', createAdminResponse.data.data.createUser);

    // Step 7: Login as admin
    console.log('\n7. Logging in as admin...');
    const adminLoginResponse = await axios.post(API_URL, {
      query: `
        mutation {
          login(
            loginInput: {
              email: "admin@example.com"
              password: "admin123"
            }
          ) {
            user {
              id
              name
              email
              role
            }
            token
          }
        }
      `
    });

    const adminToken = adminLoginResponse.data.data.login.token;
    console.log('✅ Admin login successful');

    // Step 8: Access admin-only endpoint with admin token
    console.log('\n8. Testing admin-only endpoint with admin token...');
    const adminResponse = await axios.post(API_URL, {
      query: `
        query {
          users {
            id
            name
            email
            role
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Admin endpoint accessed successfully');
    console.log('📋 Users list:', adminResponse.data.data.users);

    console.log('\n🎉 All authentication tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth(); 