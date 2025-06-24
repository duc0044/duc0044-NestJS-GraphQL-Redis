import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
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
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($updatePostId: ID!, $updatePostInput: UpdatePostInput!) {
    updatePost(id: $updatePostId, input: $updatePostInput) {
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
    category_id
    content
    created_at
    id
    slug
    tags {
      id
      name
    }
    thumbnail
    title
    updated_at
    user {
      id
      username
    }
    user_id
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
    await updatePostMutation({ updatePostId: post.id, updatePostInput: post });
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

  const getPostById = (postId: string) => {
    const { result, loading, error } = useQuery<PostByIdData>(GET_POSTS_BY_ID, {
      postId: Number(postId),
    });
    return {
      post: result.value?.post,
      loading: loading.value,
      error: error.value,
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
    getPostById,
  };
}
