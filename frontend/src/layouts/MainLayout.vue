<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          User Management
        </q-toolbar-title>

        <q-btn flat dense round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode" />
        <div class="q-ml-sm">Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';
import type { EssentialLinkProps } from 'components/EssentialLink.vue';

const $q = useQuasar();

const linksList: EssentialLinkProps[] = [
  {
    title: 'Users List',
    caption: 'View all users',
    icon: 'list',
    link: '#/users/list'
  },
  {
    title: 'Add User',
    caption: 'Create new user',
    icon: 'person_add',
    link: '#/users/add'
  }
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
</script>
