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
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="editUser(props.row)"
              :disable="props.row.id === currentUser?.id"
            >
              <q-tooltip>Sửa người dùng</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="secondary"
              icon="admin_panel_settings"
              size="sm"
              v-if="props.row.role === 'USER'"
              @click="promoteToAdmin(props.row)"
              :disable="props.row.id === currentUser?.id"
            >
              <q-tooltip>Thăng cấp thành Admin</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="orange"
              icon="person"
              size="sm"
              v-if="props.row.role === 'ADMIN'"
              @click="demoteToUser(props.row)"
              :disable="props.row.id === currentUser?.id"
            >
              <q-tooltip>Hạ cấp thành User</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteUser(props.row)"
              :disable="props.row.id === currentUser?.id"
            >
              <q-tooltip>Xóa người dùng</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="addUserDialog">
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
          <q-btn flat label="Hủy" v-close-popup />
          <q-btn color="primary" label="Thêm" @click="submitAddUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="updateUserDialog">
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
          <q-btn flat label="Hủy" v-close-popup />
          <q-btn color="primary" label="Cập nhật" @click="submitUpdateUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onActivated } from 'vue';
import { useMeta } from 'quasar';
import { useQuasar } from 'quasar';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useAuthStore } from '../../../stores/auth';

useMeta({
  title: 'Danh sách người dùng',
  titleTemplate: (title) => `${title}`,
});

const $q = useQuasar();
const authStore = useAuthStore();

// Get current user
const currentUser = computed(() => authStore.user.value);

// GraphQL queries and mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      role
    }
  }
`;

const PROMOTE_TO_ADMIN = gql`
  mutation UpdateUser($updateUserId: Int!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateUserInput: $updateUserInput) {
      id
      username
      email
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation RemoveUser($removeUserId: Int!) {
    removeUser(id: $removeUserId)
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      username
      email
      role
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($updateUserId: Int!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateUserInput: $updateUserInput) {
      id
      username
      email
      role
      __typename
    }
  }
`;

// Reactive data
const loading = ref(false);
const users = ref([]);

// Pagination
const pagination = ref({
  sortBy: 'username',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Table columns
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

// GraphQL operations
const {
  result: usersResult,
  loading: usersLoading,
  refetch: refetchUsers,
} = useQuery(
  GET_USERS,
  {},
  {
    fetchPolicy: 'network-only',
  },
);

const { mutate: promoteToAdminMutation } = useMutation(PROMOTE_TO_ADMIN);
const { mutate: deleteUserMutation } = useMutation(DELETE_USER);
const { mutate: createUserMutation } = useMutation(CREATE_USER);
const { mutate: updateUserMutation } = useMutation(UPDATE_USER);

// Watch for query results
import { watch } from 'vue';
watch(usersResult, (newResult) => {
  if (newResult?.users) {
    users.value = newResult.users;
    pagination.value.rowsNumber = newResult.users.length;
  }
});

watch(usersLoading, (newLoading) => {
  loading.value = newLoading;
});

// Actions
const editUser = (user: { id: number; username: string; email: string; role: string }) => {
  openUpdateUserDialog(user);
};

const promoteToAdmin = async (user: { id: number; username: string }) => {
  try {
    await promoteToAdminMutation({
      updateUserId: Number(user.id),
      updateUserInput: { role: 'ADMIN' },
    });
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: `Đã thăng cấp ${user.username} thành Admin`,
      position: 'top',
    });
  } catch (err) {
    console.error('Error promoting user:', err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi xảy ra khi thăng cấp người dùng',
      position: 'top',
    });
  }
};

const demoteToUser = async (user: { id: number; username: string }) => {
  try {
    await promoteToAdminMutation({
      updateUserId: Number(user.id),
      updateUserInput: { role: 'USER' },
    });
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: `Đã hạ cấp ${user.username} thành User`,
      position: 'top',
    });
  } catch (err) {
    console.error('Error demoting user:', err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi xảy ra khi hạ cấp người dùng',
      position: 'top',
    });
  }
};

const deleteUser = (user: { id: number; username: string }) => {
  $q.dialog({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await deleteUserMutation({
          removeUserId: Number(user.id),
        });
        await refetchUsers();
        $q.notify({
          type: 'positive',
          message: `Đã xóa người dùng ${user.username}`,
          position: 'top',
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        $q.notify({
          type: 'negative',
          message: 'Có lỗi xảy ra khi xóa người dùng',
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

const addUserDialog = ref(false);
const newUser = ref({
  email: '',
  username: '',
  password: '',
  role: 'USER',
});

const openAddUserDialog = () => {
  newUser.value = { email: '', username: '', password: '', role: 'USER' };
  addUserDialog.value = true;
};

const submitAddUser = async () => {
  try {
    await createUserMutation({
      createUserInput: { ...newUser.value },
    });
    addUserDialog.value = false;
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: 'Thêm người dùng thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi thêm người dùng',
      position: 'top',
    });
  }
};

const updateUserDialog = ref(false);
type User = {
  id: number;
  email: string;
  username: string;
  role: string;
};

const editingUser = ref<User | null>(null);

const openUpdateUserDialog = (user: User) => {
  editingUser.value = { ...user };
  updateUserDialog.value = true;
};

const submitUpdateUser = async () => {
  if (!editingUser.value) return;
  try {
    await updateUserMutation({
      updateUserId: Number(editingUser.value.id),
      updateUserInput: {
        email: editingUser.value.email,
        username: editingUser.value.username,
        role: editingUser.value.role,
      },
    });
    updateUserDialog.value = false;
    await refetchUsers();
    $q.notify({
      type: 'positive',
      message: 'Cập nhật người dùng thành công!',
      position: 'top',
    });
  } catch (err) {
    console.error(err);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi cập nhật người dùng',
      position: 'top',
    });
  }
};

onActivated(() => {
  void refetchUsers();
});
</script>

<style scoped>
.q-table {
  background: white;
}
</style>
