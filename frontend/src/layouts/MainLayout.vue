<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> User Management </q-toolbar-title>

        <div class="darkMode-btn">
          <q-btn
            flat
            dense
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
          />
        </div>

        <!-- Avatar with dropdown menu -->
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
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';
import type { EssentialLinkProps } from 'components/EssentialLink.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const router = useRouter();

// Create computed property for user data
const currentUser = computed(() => authStore.user.value);

const linksList: EssentialLinkProps[] = [
  {
    title: 'Users List',
    caption: 'View all users',
    icon: 'list',
    link: '#/admin/users/list',
  },
  {
    title: 'Categories',
    caption: 'View all categories',
    icon: 'list',
    link: '#/admin/categories/list',
  },
  {
    title: 'Tags',
    caption: 'View all tags',
    icon: 'list',
    link: '#/admin/tags/list',
  },
  {
    title: 'Blog',
    caption: 'View all blog',
    icon: 'list',
    link: '#/admin/blog/list',
  },
];

const leftDrawerOpen = ref(false);
const darkMode = ref(localStorage.getItem('darkMode') === 'dark');

watch(darkMode, (newVal) => {
  $q.dark.set(newVal);
});

onMounted(() => {
  // Set initial dark mode from localStorage
  $q.dark.set(darkMode.value);
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value;
  localStorage.setItem('darkMode', darkMode.value ? 'dark' : 'light');
}

async function handleLogout() {
  authStore.logout();

  $q.notify({
    type: 'positive',
    message: 'Đăng xuất thành công!',
    position: 'top',
  });

  await router.push('/auth/login');
}
</script>

<style scoped>
.darkMode-btn {
  /* margin-left: 10px; */
  margin-right: 10px;
}
</style>
