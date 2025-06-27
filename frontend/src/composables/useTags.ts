import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// TypeScript interfaces
interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagsData {
  tags: Tag[];
}

// GraphQL queries and mutations
const GET_TAGS = gql`
  query Tags {
    tags {
      id
      name
      slug
    }
  }
`;

const CREATE_TAG = gql`
  mutation CreateTag($createTagInput: CreateTagInput!) {
    createTag(createTagInput: $createTagInput) {
      id
      name
      slug
    }
  }
`;

const UPDATE_TAG = gql`
  mutation UpdateTag($updateTagId: Int!, $updateTagInput: UpdateTagInput!) {
    updateTag(id: $updateTagId, updateTagInput: $updateTagInput) {
      id
      name
      slug
    }
  }
`;

const DELETE_TAG = gql`
  mutation RemoveTag($removeTagId: Int!) {
    removeTag(id: $removeTagId)
  }
`;

export function useTags() {
  const $q = useQuasar();

  // Reactive data
  const loading = ref(false);
  const tags = ref<Tag[]>([]);

  // Pagination
  const pagination = ref({
    sortBy: 'name',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // GraphQL operations
  const {
    result: tagsResult,
    loading: tagsLoading,
    refetch: refetchTags,
  } = useQuery<TagsData>(
    GET_TAGS,
    {},
    {
      fetchPolicy: 'network-only',
    },
  );

  const { mutate: createTagMutation } = useMutation(CREATE_TAG);
  const { mutate: updateTagMutation } = useMutation(UPDATE_TAG);
  const { mutate: deleteTagMutation } = useMutation(DELETE_TAG);

  // Watch for query results
  watch(tagsResult, (newResult) => {
    if (newResult?.tags) {
      tags.value = newResult.tags;
      pagination.value.rowsNumber = newResult.tags.length;
    }
  });

  watch(tagsLoading, (newLoading) => {
    loading.value = newLoading;
  });

  // Function to convert name to slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Actions
  const deleteTag = (tag: Tag) => {
    $q.dialog({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa thẻ "${tag.name}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          await deleteTagMutation({
            removeTagId: Number(tag.id),
          });
          await refetchTags();
          $q.notify({
            type: 'positive',
            message: `Đã xóa thẻ ${tag.name}`,
            position: 'top',
          });
        } catch (err) {
          console.error('Error deleting tag:', err);
          $q.notify({
            type: 'negative',
            message: 'Có lỗi xảy ra khi xóa thẻ',
            position: 'top',
          });
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
    filter?: unknown;
    getCellValue: (col: unknown, row: unknown) => unknown;
  }) => {
    pagination.value = {
      ...props.pagination,
      rowsNumber: props.pagination.rowsNumber || 0,
    };
  };

  return {
    // Data
    loading,
    tags,
    pagination,

    // Methods
    generateSlug,
    deleteTag,
    onRequest,
    refetchTags,

    // Mutations
    createTagMutation,
    updateTagMutation,
  };
}
