<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Thêm danh mục</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="newCategory.name" label="Tên danh mục" />
        <div class="row q-gutter-sm q-mt-sm">
          <div class="col">
            <q-input v-model="newCategory.slug" label="Slug" />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              icon="refresh"
              @click="newCategory.slug = generateSlug(newCategory.name)"
              :disable="!newCategory.name"
            >
              <q-tooltip>Tạo slug từ tên</q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-input v-model="newCategory.description" label="Mô tả" type="textarea" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Thêm" @click="submitAddCategory" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  generateSlug: (name: string) => string;
  onSubmit: (category: { name: string; slug: string; description: string }) => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();

const newCategory = ref({
  name: '',
  slug: '',
  description: '',
});

// Watch for name changes
watch(
  () => newCategory.value.name,
  (newName) => {
    if (newName && !newCategory.value.slug) {
      newCategory.value.slug = props.generateSlug(newName);
    }
  },
);

const closeDialog = () => {
  newCategory.value = { name: '', slug: '', description: '' };
  emit('update:modelValue', false);
};

const submitAddCategory = async () => {
  try {
    await props.onSubmit({ ...newCategory.value });
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi thêm danh mục',
      position: 'top',
    });
  }
};
</script>
