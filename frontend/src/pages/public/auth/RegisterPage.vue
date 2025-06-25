<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="row full-width justify-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <q-card class="q-pa-lg shadow-2">
          <q-card-section class="text-center">
            <h4 class="text-h4 q-mb-md">Đăng ký tài khoản</h4>
            <p class="text-grey-6">Tạo tài khoản mới để bắt đầu</p>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="form.username"
                label="Tên đăng nhập"
                outlined
                :rules="[(val) => !!val || 'Tên đăng nhập là bắt buộc']"
                :error="!!errors.username"
                :error-message="errors.username"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  (val) => !!val || 'Email là bắt buộc',
                  (val) => validateEmail(val) || 'Email không hợp lệ',
                ]"
                :error="!!errors.email"
                :error-message="errors.email"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="form.password"
                label="Mật khẩu"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[
                  (val) => !!val || 'Mật khẩu là bắt buộc',
                  (val) => val.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
                ]"
                :error="!!errors.password"
                :error-message="errors.password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-input
                v-model="form.confirmPassword"
                label="Xác nhận mật khẩu"
                :type="isConfirmPwd ? 'password' : 'text'"
                outlined
                :rules="[
                  (val) => !!val || 'Xác nhận mật khẩu là bắt buộc',
                  (val) => val === form.password || 'Mật khẩu không khớp',
                ]"
                :error="!!errors.confirmPassword"
                :error-message="errors.confirmPassword"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isConfirmPwd = !isConfirmPwd"
                  />
                </template>
              </q-input>

              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Đăng ký"
                  class="full-width"
                  :loading="loading"
                  :disable="loading"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center">
            <p class="text-grey-6">
              Đã có tài khoản?
              <router-link to="/login" class="text-primary text-weight-medium">
                Đăng nhập ngay
              </router-link>
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const router = useRouter();
const $q = useQuasar();

// Form data
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// Form state
const loading = ref(false);
const isPwd = ref(true);
const isConfirmPwd = ref(true);
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// Validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const clearErrors = () => {
  errors.username = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
};

const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      email
      username
    }
  }
`;

// Đặt useMutation ở ngoài hàm onSubmit
const { mutate: createUser, onError } = useMutation(CREATE_USER);

onError((error) => {
  loading.value = false;
  $q.notify({
    type: 'negative',
    message: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
    position: 'top',
  });
});

const onSubmit = async () => {
  clearErrors();
  loading.value = true;

  // Validate form
  if (!form.username.trim()) {
    errors.username = 'Tên đăng nhập là bắt buộc';
    loading.value = false;
    return;
  }
  if (!form.email.trim()) {
    errors.email = 'Email là bắt buộc';
    loading.value = false;
    return;
  }
  if (!validateEmail(form.email)) {
    errors.email = 'Email không hợp lệ';
    loading.value = false;
    return;
  }
  if (!form.password) {
    errors.password = 'Mật khẩu là bắt buộc';
    loading.value = false;
    return;
  }
  if (form.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    loading.value = false;
    return;
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu không khớp';
    loading.value = false;
    return;
  }

  // Gọi mutation
  try {
    await createUser({
      createUserInput: {
        email: form.email,
        password: form.password,
        username: form.username,
      },
    });

    $q.notify({
      type: 'positive',
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      position: 'top',
    });

    await router.push('/auth/login');
  } catch (error: unknown) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}

.q-card {
  border-radius: 12px;
}

.text-h4 {
  font-weight: 600;
}

.router-link {
  text-decoration: none;
}

.router-link:hover {
  text-decoration: underline;
}
</style>
