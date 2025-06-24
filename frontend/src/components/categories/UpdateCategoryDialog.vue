<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px" v-if="editingCategory">
      <q-card-section>
        <div class="text-h6">Cập nhật danh mục</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="editingCategory.name" label="Tên danh mục" />
        <div class="row q-gutter-sm q-mt-sm">
          <div class="col">
            <q-input v-model="editingCategory.slug" label="Slug" />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              icon="refresh"
              @click="editingCategory.slug = generateSlug(editingCategory.name)"
              :disable="!editingCategory.name"
            >
              <q-tooltip>Tạo slug từ tên</q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-input v-model="editingCategory.description" label="Mô tả" type="textarea" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Cập nhật" @click="submitUpdateCategory" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Props {
  modelValue: boolean;
  category: Category | null;
  generateSlug: (name: string) => string;
  onSubmit: (category: Category) => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();

const editingCategory = ref<Category | null>(null);

// Watch for category changes
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      editingCategory.value = { ...newCategory };
    }
  },
  { immediate: true },
);

const closeDialog = () => {
  editingCategory.value = null;
  emit('update:modelValue', false);
};

const submitUpdateCategory = async () => {
  if (!editingCategory.value) return;
  try {
    await props.onSubmit(editingCategory.value);
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi cập nhật danh mục',
      position: 'top',
    });
  }
};
</script>
