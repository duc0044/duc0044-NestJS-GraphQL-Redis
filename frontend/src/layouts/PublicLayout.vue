<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          User Management
        </q-toolbar-title>

        <q-btn flat dense round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode" />
      </q-toolbar>

      <q-tabs align="center">
        <q-route-tab to="/users/list" label="Users List" />
        <q-route-tab to="/users/add" label="Add User" />
        <q-route-tab to="/auth/login" label="Login" />
        <q-route-tab to="/auth/register" label="Register" />
        <q-avatar square class=" text-end">
          <img src="https://cdn.quasar.dev/img/avatar.png">
        </q-avatar>
      </q-tabs>

    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          <div>User Management System</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';

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
</script>
