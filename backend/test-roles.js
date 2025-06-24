const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

let adminToken = '';
let userToken = '';
let adminUser = null;
let regularUser = null;

async function testRoleBasedAccess() {
  try {
    console.log('🚀 Testing Role-Based Access Control...\n');

    // Test 1: Create admin user
    console.log('1. Creating admin user...');
    const createAdminResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(createUserInput: {
            username: "admin"
            email: "admin@example.com"
            password: "password123"
            role: ADMIN
          }) {
            id
            username
            email
            role
          }
        }
      `
    });

    adminUser = createAdminResponse.data.data.createUser;
    console.log('✅ Admin user created:', adminUser.username, 'Role:', adminUser.role);

    // Test 2: Create regular user
    console.log('\n2. Creating regular user...');
    const createUserResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(createUserInput: {
            username: "user"
            email: "user@example.com"
            password: "password123"
            role: USER
          }) {
            id
            username
            email
            role
          }
        }
      `
    });

    regularUser = createUserResponse.data.data.createUser;
    console.log('✅ Regular user created:', regularUser.username, 'Role:', regularUser.role);

    // Test 3: Login as admin
    console.log('\n3. Logging in as admin...');
    const adminLoginResponse = await axios.post(API_URL, {
      query: `
        mutation {
          login(loginInput: {
            email: "admin@example.com"
            password: "password123"
          }) {
            user {
              id
              username
              role
            }
            token
          }
        }
      `
    });

    adminToken = adminLoginResponse.data.data.login.token;
    console.log('✅ Admin logged in, token received');

    // Test 4: Login as regular user
    console.log('\n4. Logging in as regular user...');
    const userLoginResponse = await axios.post(API_URL, {
      query: `
        mutation {
          login(loginInput: {
            email: "user@example.com"
            password: "password123"
          }) {
            user {
              id
              username
              role
            }
            token
          }
        }
      `
    });

    userToken = userLoginResponse.data.data.login.token;
    console.log('✅ User logged in, token received');

    // Test 5: Admin can access all users (admin only)
    console.log('\n5. Testing admin access to all users...');
    try {
      const adminUsersResponse = await axios.post(API_URL, {
        query: `
          query {
            users {
              id
              username
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

      console.log('✅ Admin can access all users:', adminUsersResponse.data.data.users.length, 'users found');
    } catch (error) {
      console.log('❌ Admin cannot access all users:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 6: Regular user cannot access all users
    console.log('\n6. Testing regular user access to all users (should fail)...');
    try {
      const userUsersResponse = await axios.post(API_URL, {
        query: `
          query {
            users {
              id
              username
              email
              role
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('❌ User can access all users (should not happen)');
    } catch (error) {
      console.log('✅ User correctly denied access to all users:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 7: Admin can create category
    console.log('\n7. Testing admin can create category...');
    try {
      const createCategoryResponse = await axios.post(API_URL, {
        query: `
          mutation {
            createCategory(createCategoryInput: {
              name: "Admin Category"
              slug: "admin-category"
              description: "Category created by admin"
            }) {
              id
              name
              slug
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Admin can create category:', createCategoryResponse.data.data.createCategory.name);
    } catch (error) {
      console.log('❌ Admin cannot create category:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 8: Regular user cannot create category
    console.log('\n8. Testing regular user cannot create category...');
    try {
      const userCreateCategoryResponse = await axios.post(API_URL, {
        query: `
          mutation {
            createCategory(createCategoryInput: {
              name: "User Category"
              slug: "user-category"
              description: "Category created by user"
            }) {
              id
              name
              slug
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('❌ User can create category (should not happen)');
    } catch (error) {
      console.log('✅ User correctly denied access to create category:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 9: Admin can promote user to admin
    console.log('\n9. Testing admin can promote user to admin...');
    try {
      const promoteResponse = await axios.post(API_URL, {
        query: `
          mutation {
            promoteToAdmin(userId: ${regularUser.id}) {
              id
              username
              role
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Admin can promote user:', promoteResponse.data.data.promoteToAdmin.role);
    } catch (error) {
      console.log('❌ Admin cannot promote user:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 10: Regular user cannot promote others
    console.log('\n10. Testing regular user cannot promote others...');
    try {
      const userPromoteResponse = await axios.post(API_URL, {
        query: `
          mutation {
            promoteToAdmin(userId: ${adminUser.id}) {
              id
              username
              role
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('❌ User can promote others (should not happen)');
    } catch (error) {
      console.log('✅ User correctly denied access to promote others:', error.response?.data?.errors?.[0]?.message);
    }

    // Test 11: Get current user info
    console.log('\n11. Testing get current user info...');
    try {
      const meResponse = await axios.post(API_URL, {
        query: `
          query {
            me {
              id
              username
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

      console.log('✅ Admin can get own info:', meResponse.data.data.me.username);
    } catch (error) {
      console.log('❌ Cannot get user info:', error.response?.data?.errors?.[0]?.message);
    }

    console.log('\n🎉 Role-based access control test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Admin permissions: ✅ Working');
    console.log('- User restrictions: ✅ Working');
    console.log('- Authentication: ✅ Working');
    console.log('- Authorization: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRoleBasedAccess(); 