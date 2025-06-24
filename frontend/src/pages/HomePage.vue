<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <h4 class="text-h4 q-mb-md">Chào mừng!</h4>
      
      <div v-if="currentUser" class="q-mb-lg">
        <q-avatar size="100px" class="q-mb-md">
          <q-icon name="person" size="60px" />
        </q-avatar>
        
        <h5 class="text-h5 q-mb-sm">{{ currentUser.username }}</h5>
        <p class="text-grey-6">{{ currentUser.email }}</p>
        <q-chip 
          :color="isAdmin ? 'red' : 'blue'"
          text-color="white"
          :label="isAdmin ? 'Quản trị viên' : 'Người dùng'"
        />
      </div>

      <div class="q-gutter-md">
        <q-btn
          v-if="isAdmin"
          color="primary"
          label="Quản lý người dùng"
          icon="people"
          to="/admin/users/list"
        />
        
        <q-btn
          color="secondary"
          label="Đăng xuất"
          icon="logout"
          @click="handleLogout"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth'
import { computed } from 'vue'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Create computed properties for reactive access
const currentUser = computed(() => authStore.user.value)
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')

const handleLogout = async () => {
  authStore.logout()
  
  $q.notify({
    type: 'positive',
    message: 'Đăng xuất thành công!',
    position: 'top'
  })
  
  await router.push('/auth/login')
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style> 