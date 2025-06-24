<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Quản lý người dùng</h4>
        <p class="text-grey-6 q-mt-sm">Quản lý cơ sở dữ liệu người dùng</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Thêm người dùng" @click="openAddUserDialog" />
      </div>
    </div>

    <q-table
      title="Danh sách người dùng"
      :rows="users"
      :columns="columns"
      row-key="id"
      class="q-mb-md"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <!-- Custom role column -->
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
          <q-chip
            :color="props.value === 'ADMIN' ? 'red' : 'blue'"
            text-color="white"
            :label="props.value === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'"
          />
        </q-td>
      </template>

      <!-- Custom actions column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editUser(props.row)">
              <q-tooltip>Sửa người dùng</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteUser(props.row)"
            >
              <q-tooltip>Xóa người dùng</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Add User Dialog -->
    <AddUserDialog v-model="addUserDialog" :on-submit="submitAddUser" />

    <!-- Update User Dialog -->
    <UpdateUserDialog
      v-model="updateUserDialog"
      :user="editingUser"
      :on-submit="submitUpdateUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'quasar';
import { useQuasar } from 'quasar';
import { useUsers } from 'src/composables/useUsers';
import type { User } from 'src/composables/useUsers';
import AddUserDialog from 'src/components/users/AddUserDialog.vue';
import UpdateUserDialog from 'src/components/users/UpdateUserDialog.vue';

useMeta({
  title: 'Danh sách người dùng',
  titleTemplate: (title) => `${title}`,
});

const $q = useQuasar();

const {
  loading,
  users,
  pagination,
  deleteUser,
  onRequest,
  refetchUsers,
  createUserMutation,
  updateUserMutation,
} = useUsers();

const columns = ref([
  {
    name: 'username',
    required: true,
    label: 'Tên người dùng',
    align: 'left' as const,
    field: 'username',
    sortable: true,
  },
  {
    name: 'email',
    required: true,
    label: 'Email',
    align: 'left' as const,
    field: 'email',
    sortable: true,
  },
  {
    name: 'role',
    required: true,
    label: 'Vai trò',
    align: 'left' as const,
    field: 'role',
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

const addUserDialog = ref(false);
const updateUserDialog = ref(false);
const editingUser = ref<User | null>(null);

const editUser = (user: User) => {
  editingUser.value = user;
  updateUserDialog.value = true;
};

const openAddUserDialog = () => {
  addUserDialog.value = true;
};

const submitAddUser = async (userData: {
  email: string;
  username: string;
  password: string;
  role: string;
}) => {
  try {
    await createUserMutation({
      createUserInput: userData,
    });
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: 'Thêm người dùng thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const submitUpdateUser = async (user: User) => {
  try {
    await updateUserMutation({
      updateUserId: Number(user.id),
      updateUserInput: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: 'Cập nhật người dùng thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
</script>

<style scoped>
.q-table {
  background: white;
}
</style>
