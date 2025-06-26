import { ref, watch, computed, readonly, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

interface User {
  username: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  user?: User;
  category: Category;
  tags: Tag[];
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface PostsData {
  posts: Post[];
}

interface PostByIdData {
  post: Post;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  category_id: number;
  tag_ids: number[];
}

interface PostsByCategoryData {
  postsByCategory: Post[];
}

interface PostsByTagData {
  postsByTag: Post[];
}

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      slug
      content
      thumbnail
      category {
        id
        name
      }
      tags {
        id
        name
      }
      user {
        username
      }
    }
  }
`;

const UPDATE_POST = gql`
 mutation UpdatePost($id: Int!, $updatePostInput: UpdatePostInput!) {
  updatePost(id: $id, updatePostInput: $updatePostInput) {
    id
    title
    slug
    content
    category {
      id
      name
    }
    tags {
      id
      name
    }
  }
}

`;

const DELETE_POST = gql`
mutation RemovePost($removePostId: Int!) {
  removePost(id: $removePostId)
}
`;

const CREATE_POST = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
    id
    title
    slug
    content
    thumbnail
    }
  }
`;

const GET_POSTS_BY_ID = gql`
 query Post($postId: Int!) {
  post(id: $postId) {
      category {
        id
        name
      }
      slug
      content
      title
    tags {
      id
      name
    }
    thumbnail
  }
}
`;

const GET_POSTS_BY_CATEGORY = gql`
  query PostsByCategory($categoryId: Int!) {
  postsByCategory(categoryId: $categoryId) {
    category {
      name
    }
    content
    id
    slug
    tags {
      name
    }
    thumbnail
    title
    user {
      username
    }
  }
}
`;

const GET_POSTS_BY_TAG = gql`
  query PostsByTag($tagId: Int!) {
    postsByTag(tagId: $tagId) {
       category {
      name
    }
    content
    id
    slug
    tags {
      name
    }
    thumbnail
    title
    user {
      username
    }
  }
}
`;

export function usePosts() {
  const $q = useQuasar();
  const posts = ref<Post[]>([]);
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  const { result, loading, error, refetch } = useQuery<PostsData>(GET_POSTS);

  watch(result, (newResult) => {
    if (newResult?.posts) {
      posts.value = newResult.posts;
      pagination.value.rowsNumber = newResult.posts.length;
    }
  }, { immediate: true });

  const { mutate: createPostMutation } = useMutation(CREATE_POST);
  const { mutate: updatePostMutation } = useMutation(UPDATE_POST);
  const { mutate: deletePostMutation } = useMutation(DELETE_POST);



  const createPost = async (post: CreatePostInput) => {
    await createPostMutation({ createPostInput: post });
    await refetch();
    $q.notify({ type: 'positive', message: 'Thêm bài viết thành công!', position: 'top' });
  };

  const updatePost = async (post: Post) => {
    await updatePostMutation({
      id: Number(post.id),
      updatePostInput: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        thumbnail: post.thumbnail,
        category_id: Number(post.category.id),
        tag_ids: post.tags.map(tag => Number(tag.id)),
      },
    });
    await refetch();
    $q.notify({ type: 'positive', message: 'Cập nhật bài viết thành công!', position: 'top' });
  };

  const deletePost = (postId: number) => {
    $q.dialog({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa bài viết "${postId}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const removePostId = Number(postId);
          await deletePostMutation({ removePostId });
          await refetch();
          $q.notify({ type: 'positive', message: 'Đã xóa bài viết', position: 'top' });
        } catch (error) {
          console.error('Error deleting post:', error);
          $q.notify({ type: 'negative', message: 'Lỗi khi xóa bài viết', position: 'top' });
        }
      })();
    });
  };

  const onRequest = (props: {
    pagination: {
      sortBy: string;
      descending: boolean;
      page: number;
      rowsPerPage: number;
      rowsNumber?: number;
    };
  }) => {
    pagination.value = {
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      rowsNumber: posts.value.length,
    };
  };

  return {
    posts,
    pagination,
    loading,
    error,
    onRequest,
    refetchPosts: refetch,
    createPost,
    updatePost,
    deletePost,
  };
}

// Separate composable for getting a single post by ID
export function usePostById(postId: number) {
  const { result, loading, error } = useQuery<PostByIdData>(GET_POSTS_BY_ID, {
    postId: Number(postId),
  });

  return {
    post: computed(() => result.value?.post),
    loading: readonly(loading),
    error: readonly(error),
  };
}

export function usePostsByCategory(categoryId: Ref<number>) {
  const { result, loading, error } = useQuery<PostsByCategoryData>(GET_POSTS_BY_CATEGORY,
    computed(() => ({ categoryId: categoryId.value })),
    () => ({ enabled: categoryId.value > 0 })
  );

  return {
    posts: computed(() => result.value?.postsByCategory || []),
    loading: readonly(loading),
    error: readonly(error),
  };
};

export function usePostsByTag(tagId: Ref<number>) {
  const { result, loading, error } = useQuery<PostsByTagData>(GET_POSTS_BY_TAG,
    computed(() => ({ tagId: tagId.value })),
    () => ({ enabled: tagId.value > 0 })
  );

  return {
    posts: computed(() => result.value?.postsByTag || []),
    loading: readonly(loading),
    error: readonly(error),
  };
}
