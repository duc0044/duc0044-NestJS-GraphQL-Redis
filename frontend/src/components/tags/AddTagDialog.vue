<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Thêm thẻ</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="newTag.name" label="Tên thẻ" />
        <div class="row q-gutter-sm q-mt-sm">
          <div class="col">
            <q-input v-model="newTag.slug" label="Slug" />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              icon="refresh"
              @click="newTag.slug = generateSlug(newTag.name)"
              :disable="!newTag.name"
            >
              <q-tooltip>Tạo slug từ tên</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Thêm" @click="submitAddTag" />
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
  onSubmit: (tag: { name: string; slug: string }) => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();

const newTag = ref({
  name: '',
  slug: '',
});

// Watch for name changes
watch(
  () => newTag.value.name,
  (newName) => {
    if (newName && !newTag.value.slug) {
      newTag.value.slug = props.generateSlug(newName);
    }
  },
);

const closeDialog = () => {
  newTag.value = { name: '', slug: '' };
  emit('update:modelValue', false);
};

const submitAddTag = async () => {
  try {
    await props.onSubmit({ ...newTag.value });
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi thêm thẻ',
      position: 'top',
    });
  }
};
</script>
