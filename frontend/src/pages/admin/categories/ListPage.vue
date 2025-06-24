<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Quản lý danh mục</h4>
        <p class="text-grey-6 q-mt-sm">Quản lý cơ sở dữ liệu danh mục</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Thêm danh mục" @click="openAddCategoryDialog" />
      </div>
    </div>

    <q-table
      title="Danh sách danh mục"
      :rows="categories"
      :columns="columns"
      row-key="id"
      class="q-mb-md"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- Custom actions column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="editCategory(props.row)"
            >
              <q-tooltip>Sửa danh mục</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteCategory(props.row)"
            >
              <q-tooltip>Xóa danh mục</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Add Category Dialog -->
    <AddCategoryDialog
      v-model="addCategoryDialog"
      :generate-slug="generateSlug"
      :on-submit="submitAddCategory"
    />

    <!-- Update Category Dialog -->
    <UpdateCategoryDialog
      v-model="updateCategoryDialog"
      :category="editingCategory"
      :generate-slug="generateSlug"
      :on-submit="submitUpdateCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'quasar';
import { useQuasar } from 'quasar';
import { useCategories } from 'src/composables/useCategories';
import AddCategoryDialog from 'src/components/categories/AddCategoryDialog.vue';
import UpdateCategoryDialog from 'src/components/categories/UpdateCategoryDialog.vue';

useMeta({
  title: 'Danh sách danh mục',
  titleTemplate: (title) => `${title}`,
});

const $q = useQuasar();

// TypeScript interface
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// Use categories composable
const {
  loading,
  categories,
  pagination,
  generateSlug,
  deleteCategory,
  onRequest,
  refetchCategories,
  createCategoryMutation,
  updateCategoryMutation,
} = useCategories();

// Table columns
const columns = ref([
  {
    name: 'name',
    required: true,
    label: 'Tên danh mục',
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'slug',
    required: true,
    label: 'Slug',
    align: 'left' as const,
    field: 'slug',
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Mô tả',
    align: 'left' as const,
    field: 'description',
    sortable: true,
  },
  {
    name: 'actions',
    required: true,
    label: 'Hành động',
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
]);

// Dialog states
const addCategoryDialog = ref(false);
const updateCategoryDialog = ref(false);
const editingCategory = ref<Category | null>(null);

// Actions
const editCategory = (category: Category) => {
  editingCategory.value = category;
  updateCategoryDialog.value = true;
};

const openAddCategoryDialog = () => {
  addCategoryDialog.value = true;
};

const submitAddCategory = async (categoryData: {
  name: string;
  slug: string;
  description: string;
}) => {
  try {
    await createCategoryMutation({
      createCategoryInput: categoryData,
    });
    await refetchCategories();
    $q.notify({
      type: 'positive',
      message: 'Thêm danh mục thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const submitUpdateCategory = async (category: Category) => {
  try {
    await updateCategoryMutation({
      updateCategoryId: Number(category.id),
      updateCategoryInput: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
    await refetchCategories();
    $q.notify({
      type: 'positive',
      message: 'Cập nhật danh mục thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
</script>

<style scoped>
.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
