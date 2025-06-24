<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px" v-if="editingUser">
      <q-card-section>
        <div class="text-h6">Cập nhật người dùng</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="editingUser.email" label="Email" type="email" />
        <q-input v-model="editingUser.username" label="Tên người dùng" />
        <q-select v-model="editingUser.role" :options="['USER', 'ADMIN']" label="Vai trò" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Cập nhật" @click="submitUpdateUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}
interface Props {
  modelValue: boolean;
  user: User | null;
  onSubmit: (user: User) => Promise<void>;
}
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const $q = useQuasar();
const editingUser = ref<User | null>(null);

watch(
  () => props.user,
  (newUser) => {
    if (newUser) editingUser.value = { ...newUser };
  },
  { immediate: true },
);

const closeDialog = () => {
  editingUser.value = null;
  emit('update:modelValue', false);
};

const submitUpdateUser = async () => {
  if (!editingUser.value) return;
  try {
    await props.onSubmit(editingUser.value);
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi cập nhật người dùng',
      position: 'top',
    });
  }
};
</script>
