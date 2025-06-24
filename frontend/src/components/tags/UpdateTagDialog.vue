<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px" v-if="editingTag">
      <q-card-section>
        <div class="text-h6">Cập nhật thẻ</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="editingTag.name" label="Tên thẻ" />
        <div class="row q-gutter-sm q-mt-sm">
          <div class="col">
            <q-input v-model="editingTag.slug" label="Slug" />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              icon="refresh"
              @click="editingTag.slug = generateSlug(editingTag.name)"
              :disable="!editingTag.name"
            >
              <q-tooltip>Tạo slug từ tên</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Cập nhật" @click="submitUpdateTag" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  modelValue: boolean;
  tag: Tag | null;
  generateSlug: (name: string) => string;
  onSubmit: (tag: Tag) => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();

const editingTag = ref<Tag | null>(null);

// Watch for tag changes
watch(
  () => props.tag,
  (newTag) => {
    if (newTag) {
      editingTag.value = { ...newTag };
    }
  },
  { immediate: true },
);

const closeDialog = () => {
  editingTag.value = null;
  emit('update:modelValue', false);
};

const submitUpdateTag = async () => {
  if (!editingTag.value) return;
  try {
    await props.onSubmit(editingTag.value);
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi cập nhật thẻ',
      position: 'top',
    });
  }
};
</script>
