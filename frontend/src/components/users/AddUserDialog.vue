<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Thêm người dùng</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="newUser.email" label="Email" type="email" />
        <q-input v-model="newUser.username" label="Tên người dùng" />
        <q-input v-model="newUser.password" label="Mật khẩu" type="password" />
        <q-select v-model="newUser.role" :options="['USER', 'ADMIN']" label="Vai trò" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Hủy" @click="closeDialog" />
        <q-btn color="primary" label="Thêm" @click="submitAddUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  onSubmit: (user: {
    email: string;
    username: string;
    password: string;
    role: string;
  }) => Promise<void>;
}
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const $q = useQuasar();
const newUser = ref({
  email: '',
  username: '',
  password: '',
  role: 'USER',
});

const closeDialog = () => {
  newUser.value = { email: '', username: '', password: '', role: 'USER' };
  emit('update:modelValue', false);
};

const submitAddUser = async () => {
  try {
    await props.onSubmit({ ...newUser.value });
    closeDialog();
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi thêm người dùng',
      position: 'top',
    });
  }
};
</script>
