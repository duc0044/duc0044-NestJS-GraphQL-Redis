const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

async function testAPI() {
  try {
    console.log('🚀 Testing Blog API...\n');

    // Test 1: Create a user
    console.log('1. Creating a user...');
    const createUserResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createUser(createUserInput: {
            username: "testuser"
            email: "test@example.com"
            password: "password123"
          }) {
            id
            username
            email
            created_at
          }
        }
      `
    });

    const user = createUserResponse.data.data.createUser;
    console.log('✅ User created:', user.username);

    // Test 2: Create a category
    console.log('\n2. Creating a category...');
    const createCategoryResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createCategory(createCategoryInput: {
            name: "Technology"
            slug: "technology"
            description: "Technology related posts"
          }) {
            id
            name
            slug
            description
          }
        }
      `
    });

    const category = createCategoryResponse.data.data.createCategory;
    console.log('✅ Category created:', category.name);

    // Test 3: Create a tag
    console.log('\n3. Creating a tag...');
    const createTagResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createTag(createTagInput: {
            name: "JavaScript"
            slug: "javascript"
          }) {
            id
            name
            slug
          }
        }
      `
    });

    const tag = createTagResponse.data.data.createTag;
    console.log('✅ Tag created:', tag.name);

    // Test 4: Create a post
    console.log('\n4. Creating a post...');
    const createPostResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createPost(
            createPostInput: {
              title: "Getting Started with JavaScript"
              slug: "getting-started-with-javascript"
              content: "JavaScript is a powerful programming language..."
              category_id: ${category.id}
              tag_ids: [${tag.id}]
            }
            userId: ${user.id}
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
      `
    });

    const post = createPostResponse.data.data.createPost;
    console.log('✅ Post created:', post.title);

    // Test 5: Create a comment
    console.log('\n5. Creating a comment...');
    const createCommentResponse = await axios.post(API_URL, {
      query: `
        mutation {
          createComment(createCommentInput: {
            content: "Great tutorial!"
            post_id: ${post.id}
            user_id: ${user.id}
          }) {
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
      `
    });

    const comment = createCommentResponse.data.data.createComment;
    console.log('✅ Comment created:', comment.content);

    // Test 6: Query all posts
    console.log('\n6. Querying all posts...');
    const postsResponse = await axios.post(API_URL, {
      query: `
        query {
          posts {
            id
            title
            slug
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
      `
    });

    const posts = postsResponse.data.data.posts;
    console.log('✅ Found', posts.length, 'posts');

    // Test 7: Search posts
    console.log('\n7. Searching posts...');
    const searchResponse = await axios.post(API_URL, {
      query: `
        query {
          searchPosts(query: "JavaScript") {
            id
            title
            slug
          }
        }
      `
    });

    const searchResults = searchResponse.data.data.searchPosts;
    console.log('✅ Search found', searchResults.length, 'posts');

    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('\n📊 Summary:');
    console.log('- Users:', 1);
    console.log('- Categories:', 1);
    console.log('- Tags:', 1);
    console.log('- Posts:', posts.length);
    console.log('- Comments:', 1);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAPI();
