<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-px-md">
        <q-avatar>
          <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
        </q-avatar>
        <q-toolbar-title class="q-ml-sm">User Management</q-toolbar-title>

        <div class="q-gutter-sm row items-center">
          <q-btn
            flat
            dense
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
            class="q-mr-sm"
            aria-label="Toggle Dark Mode"
          />
          <q-btn flat round class="m-3">
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/avatar.png" />
            </q-avatar>

            <q-menu>
              <q-list style="min-width: 200px">
                <!-- User info section -->
                <q-item v-if="currentUser">
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ currentUser.username }}</q-item-label>
                    <q-item-label caption>{{ currentUser.email }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip
                      :color="currentUser.role === 'ADMIN' ? 'red' : 'blue'"
                      text-color="white"
                      size="sm"
                      :label="currentUser.role === 'ADMIN' ? 'Admin' : 'User'"
                    />
                  </q-item-section>
                </q-item>

                <q-separator />
                <!-- Logout button -->
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Đăng xuất</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>

      <!-- NAVIGATION TABS -->
      <q-tabs align="center" class="bg-primary text-white" indicator-color="white">
        <q-route-tab to="/" label="Home" icon="home" />
        <q-route-tab to="/blog" label="Blog" icon="article" />
        <q-route-tab v-if="!currentUser" to="/auth/login" label="Login" icon="login" />
        <q-route-tab v-if="!currentUser" to="/auth/register" label="Register" icon="person_add" />
        <q-route-tab
          v-if="currentUser?.role === 'ADMIN'"
          to="/admin"
          label="Admin"
          icon="dashboard"
        />
      </q-tabs>
    </q-header>

    <!-- MAIN VIEW -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- FOOTER -->
    <q-footer elevated class="bg-grey-9 text-white">
      <q-toolbar class="q-px-md">
        <q-avatar>
          <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
        </q-avatar>
        <q-toolbar-title class="q-ml-sm"> User Management System </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

const currentUser = computed(() => authStore.user.value);

const $q = useQuasar();
const darkMode = ref(localStorage.getItem('darkMode') === 'dark');

watch(darkMode, (newVal) => {
  $q.dark.set(newVal);
});

onMounted(() => {
  $q.dark.set(darkMode.value);
});

function toggleDarkMode() {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', darkMode.value ? 'dark' : 'light');
}

function handleLogout() {
  authStore.logout();
}
</script>
