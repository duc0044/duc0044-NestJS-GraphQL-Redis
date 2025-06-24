<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Quản lý thẻ</h4>
        <p class="text-grey-6 q-mt-sm">Quản lý cơ sở dữ liệu thẻ</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Thêm thẻ" @click="openAddTagDialog" />
      </div>
    </div>

    <q-table
      title="Danh sách thẻ"
      :rows="tags"
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
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editTag(props.row)">
              <q-tooltip>Sửa thẻ</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteTag(props.row)"
            >
              <q-tooltip>Xóa thẻ</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Add Tag Dialog -->
    <AddTagDialog v-model="addTagDialog" :generate-slug="generateSlug" :on-submit="submitAddTag" />

    <!-- Update Tag Dialog -->
    <UpdateTagDialog
      v-model="updateTagDialog"
      :tag="editingTag"
      :generate-slug="generateSlug"
      :on-submit="submitUpdateTag"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'quasar';
import { useQuasar } from 'quasar';
import { useTags } from 'src/composables/useTags';
import AddTagDialog from 'src/components/tags/AddTagDialog.vue';
import UpdateTagDialog from 'src/components/tags/UpdateTagDialog.vue';

useMeta({
  title: 'Danh sách thẻ',
  titleTemplate: (title) => `${title}`,
});

const $q = useQuasar();

// TypeScript interface
interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Use tags composable
const {
  loading,
  tags,
  pagination,
  generateSlug,
  deleteTag,
  onRequest,
  refetchTags,
  createTagMutation,
  updateTagMutation,
} = useTags();

// Table columns
const columns = ref([
  {
    name: 'name',
    required: true,
    label: 'Tên thẻ',
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
    name: 'actions',
    required: true,
    label: 'Hành động',
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
]);

// Dialog states
const addTagDialog = ref(false);
const updateTagDialog = ref(false);
const editingTag = ref<Tag | null>(null);

// Actions
const editTag = (tag: Tag) => {
  editingTag.value = tag;
  updateTagDialog.value = true;
};

const openAddTagDialog = () => {
  addTagDialog.value = true;
};

const submitAddTag = async (tagData: { name: string; slug: string }) => {
  try {
    await createTagMutation({
      createTagInput: tagData,
    });
    await refetchTags();
    $q.notify({
      type: 'positive',
      message: 'Thêm thẻ thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const submitUpdateTag = async (tag: Tag) => {
  try {
    await updateTagMutation({
      updateTagId: Number(tag.id),
      updateTagInput: {
        name: tag.name,
        slug: tag.slug,
      },
    });
    await refetchTags();
    $q.notify({
      type: 'positive',
      message: 'Cập nhật thẻ thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
</script>
