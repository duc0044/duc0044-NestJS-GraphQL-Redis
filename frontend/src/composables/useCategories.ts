import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// TypeScript interfaces
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface CategoriesData {
  categories: Category[];
}

// GraphQL queries and mutations
const GET_CATEGORIES = gql`
  query Categories {
    categories {
      description
      id
      name
      slug
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
      id
      name
      slug
      description
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($updateCategoryId: Int!, $updateCategoryInput: UpdateCategoryInput!) {
    updateCategory(id: $updateCategoryId, updateCategoryInput: $updateCategoryInput) {
      id
      name
      slug
      description
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation RemoveCategory($removeCategoryId: Int!) {
    removeCategory(id: $removeCategoryId)
  }
`;
export function useCategories() {
  const $q = useQuasar();

  // Reactive data
  const loading = ref(false);
  const categories = ref<Category[]>([]);

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
    result: categoriesResult,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery<CategoriesData>(
    GET_CATEGORIES,
    {},
    {
      fetchPolicy: 'network-only',
    },
  );

  const { mutate: createCategoryMutation } = useMutation(CREATE_CATEGORY);
  const { mutate: updateCategoryMutation } = useMutation(UPDATE_CATEGORY);
  const { mutate: deleteCategoryMutation } = useMutation(DELETE_CATEGORY);

  // Watch for query results
  watch(categoriesResult, (newResult) => {
    if (newResult?.categories) {
      categories.value = newResult.categories;
      pagination.value.rowsNumber = newResult.categories.length;
    }
  });

  watch(categoriesLoading, (newLoading) => {
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
  const deleteCategory = (category: Category) => {
    $q.dialog({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          await deleteCategoryMutation({
            removeCategoryId: Number(category.id),
          });
          await refetchCategories();
          $q.notify({
            type: 'positive',
            message: `Đã xóa danh mục ${category.name}`,
            position: 'top',
          });
        } catch (err) {
          console.error('Error deleting category:', err);
          $q.notify({
            type: 'negative',
            message: 'Có lỗi xảy ra khi xóa danh mục',
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
    categories,
    pagination,

    // Methods
    generateSlug,
    deleteCategory,
    onRequest,
    refetchCategories,

    // Mutations
    createCategoryMutation,
    updateCategoryMutation,
  };
}
