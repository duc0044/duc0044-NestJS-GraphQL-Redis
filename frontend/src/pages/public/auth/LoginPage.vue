<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="row full-width justify-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        <q-card class="q-pa-lg shadow-2">
          <q-card-section class="text-center">
            <h4 class="text-h4 q-mb-md text-primary">Đăng nhập</h4>
            <p class="text-grey-6">Vui lòng đăng nhập để tiếp tục</p>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Email Field -->
              <q-input
                v-model="form.email"
                type="email"
                label="Email"
                outlined
                :rules="[
                  (val) => !!val || 'Email là bắt buộc',
                  (val) => validateEmail(val) || 'Email không hợp lệ',
                ]"
                :error="!!errors.email"
                :error-message="errors.email"
                @update:model-value="clearError('email')"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <!-- Password Field -->
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Mật khẩu"
                outlined
                :rules="[
                  (val) => !!val || 'Mật khẩu là bắt buộc',
                  (val) => val.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
                ]"
                :error="!!errors.password"
                :error-message="errors.password"
                @update:model-value="clearError('password')"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <!-- Remember Me Checkbox -->
              <q-checkbox v-model="form.rememberMe" label="Ghi nhớ đăng nhập" color="primary" />

              <!-- Submit Button -->
              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  size="lg"
                  class="full-width"
                  :loading="loading"
                  :disable="loading"
                >
                  <q-spinner-dots v-if="loading" color="white" size="20px" />
                  <span v-else>Đăng nhập</span>
                </q-btn>
              </div>

              <!-- Error Message -->
              <div v-if="generalError" class="text-center">
                <q-banner class="bg-negative text-white">
                  {{ generalError }}
                </q-banner>
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <p class="text-grey-6">
              Chưa có tài khoản?
              <router-link to="/auth/register" class="text-primary text-weight-medium">
                Đăng ký ngay
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
import { useAuthStore } from 'src/stores/auth';

// Types for error handling
interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface ApolloError {
  graphQLErrors?: GraphQLError[];
  networkError?: Error;
}

// GraphQL mutation for login
const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      user {
        id
        username
        email
        role
      }
      token
    }
  }
`;

// Router and Quasar
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Form data
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

// UI state
const loading = ref(false);
const showPassword = ref(false);
const errors = reactive({
  email: '',
  password: '',
});
const generalError = ref('');

// GraphQL mutation
const { mutate: loginMutation } = useMutation(LOGIN_MUTATION);

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const clearError = (field: 'email' | 'password') => {
  errors[field] = '';
  generalError.value = '';
};

const clearAllErrors = () => {
  errors.email = '';
  errors.password = '';
  generalError.value = '';
};

// Handle form submission
const onSubmit = async () => {
  clearAllErrors();
  loading.value = true;

  try {
    const result = await loginMutation({
      loginInput: {
        email: form.email,
        password: form.password,
      },
    });

    if (result?.data?.login) {
      const { user, token } = result.data.login;

      // Use auth store to manage authentication
      authStore.login(user, token, form.rememberMe);

      // Show success message
      $q.notify({
        type: 'positive',
        message: `Chào mừng trở lại, ${user.username}!`,
        position: 'top',
      });

      // Redirect based on user role
      if (user.role === 'ADMIN') {
        await router.push('/admin/users/list');
      } else {
        await router.push('/');
      }
    }
  } catch (error: unknown) {
    console.error('Login error:', error);

    // Handle specific GraphQL errors
    if (error && typeof error === 'object' && 'graphQLErrors' in error) {
      const apolloError = error as ApolloError;
      const graphQLError = apolloError.graphQLErrors?.[0];

      if (graphQLError?.extensions?.code === 'UNAUTHORIZED') {
        generalError.value = 'Email hoặc mật khẩu không đúng';
      } else if (graphQLError?.message) {
        generalError.value = graphQLError.message;
      } else {
        generalError.value = 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    } else if (error && typeof error === 'object' && 'networkError' in error) {
      generalError.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else {
      generalError.value = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
    }
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

.text-primary {
  color: #1976d2;
}

.bg-grey-2 {
  background-color: #f5f5f5;
}
</style>
