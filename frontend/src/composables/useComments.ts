import { computed, readonly } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  post?: {
    title: string;
  };
  user?: {
    username: string;
  };
}

interface CommentsData {
  comments: Comment[];
  commentsByPost: Comment[];
}

const GET_COMMENTS = gql`
  query Comments {
    comments {
      id
      content
      post {
        title
      }
      user {
        username
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($createCommentInput: CreateCommentInput!) {
    createComment(createCommentInput: $createCommentInput) {
      id
      content
      created_at
      post {
        title
      }
      user {
        username
      }
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation RemoveComment($removeCommentId: Int!) {
    removeComment(id: $removeCommentId)
  }
`;

const GET_COMMENT_BY_POST = gql`
  query CommentsByPost($postId: Int!) {
    commentsByPost(postId: $postId) {
      id
      content
      post {
        title
      }
      user {
        username
      }
    }
  }
`;

export function useComment() {
  const { result, loading, error } = useQuery<CommentsData>(GET_COMMENTS);

  return {
    comments: computed(() => result.value?.comments || []),
    loading: readonly(loading),
    error: readonly(error),
    onRequest: (props: {
      pagination: {
        sortBy: string;
        descending: boolean;
        page: number;
        rowsPerPage: number;
        rowsNumber?: number;
      };
    }) => {
      console.log(props);
    },
  };
}

export function useComments() {
  const { mutate: createCommentMutation, loading: createLoading } = useMutation(CREATE_COMMENT);
  const { mutate: deleteCommentMutation, loading: deleteLoading } = useMutation(DELETE_COMMENT);

  const createComment = async (content: string, postId: number, userId: number) => {
    try {
      const result = await createCommentMutation({
        createCommentInput: {
          content,
          post_id: postId,
          user_id: userId,
        },
      });
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  };

  const deleteComment = async (id: number) => {
    try {
      const result = await deleteCommentMutation({
        removeCommentId: Number(id),
      });
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    createComment,
    deleteComment,
    createLoading: readonly(createLoading),
    deleteLoading: readonly(deleteLoading),
  };
}

export function useCommentsByPost(postId: number) {
  const { result, loading, error, refetch } = useQuery<CommentsData>(GET_COMMENT_BY_POST, {
    postId: Number(postId),
  });

  return {
    commentsByPost: computed(() => result.value?.commentsByPost || []),
    loading: readonly(loading),
    error: readonly(error),
    refetch,
  };
}
