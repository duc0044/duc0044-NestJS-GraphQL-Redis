<template>

  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Users Management</h4>
        <p class="text-grey-6 q-mt-sm">Manage your user database</p>
      </div>
    </div>

    <q-table title="Users" :rows="rows" :columns="columns" row-key="name" class="q-mb-md" />

    <div class="row q-gutter-sm">
      <q-btn color="primary" icon="add" label="Add User" @click="addUser" />
      <q-btn color="secondary" icon="edit" label="Edit User" @click="editUser" />
      <q-btn color="negative" icon="delete" label="Delete User" @click="deleteUser" />
      <q-btn color="info" icon="refresh" label="Refresh" @click="refresh" />
      <q-btn color="accent" icon="download" label="Export" @click="exportData" />
      <q-btn color="warning" icon="upload" label="Import" @click="importData" />
      <q-btn color="purple" icon="print" label="Print" @click="printData" />
      <q-btn color="teal" icon="share" label="Share" @click="shareData" />
    </div>

    <div class="row q-gutter-sm q-mt-md">
      <q-btn color="blue" icon="email" label="Email" @click="emailData" />
      <q-btn color="green" icon="sms" label="SMS" @click="smsData" />
      <q-btn color="green-7" icon="chat" label="WhatsApp" @click="whatsappData" />
      <q-btn color="blue-7" icon="send" label="Telegram" @click="telegramData" />
      <q-btn color="blue-8" icon="facebook" label="Facebook" @click="facebookData" />
      <q-btn color="blue-5" icon="twitter" label="Twitter" @click="twitterData" />
      <q-btn color="blue-9" icon="work" label="LinkedIn" @click="linkedinData" />
      <q-btn color="pink" icon="camera_alt" label="Instagram" @click="instagramData" />
      <q-btn color="red" icon="play_arrow" label="YouTube" @click="youtubeData" />
      <q-btn color="black" icon="music_note" label="TikTok" @click="tiktokData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'quasar';

useMeta({
  title: 'Users List',
  titleTemplate: (title) => `${title}`,
});

const rows = ref([
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Smith', email: 'jane.smith@example.com' },
]);

const columns = ref([
  { name: 'name', label: 'Name', field: 'name' },
  { name: 'email', label: 'Email', field: 'email' },
]);

const addUser = () => {
  console.log('addUser');
};

const editUser = () => {
  console.log('editUser');
};

const deleteUser = () => {
  console.log('deleteUser');
};

const refresh = () => {
  console.log('refresh');
};

const exportData = () => {
  console.log('exportData');
};

const importData = () => {
  console.log('importData');
};

const printData = () => {
  console.log('printData');
};

const shareData = () => {
  console.log('shareData');
};

const emailData = () => {
  console.log('emailData');
};

const smsData = () => {
  console.log('smsData');
};

const whatsappData = () => {
  console.log('whatsappData');
};

const telegramData = () => {
  console.log('telegramData');
};

const facebookData = () => {
  console.log('facebookData');
};

const twitterData = () => {
  console.log('twitterData');
};

const linkedinData = () => {
  console.log('linkedinData');
};

const instagramData = () => {
  console.log('instagramData');
};

const youtubeData = () => {
  console.log('youtubeData');
};

const tiktokData = () => {
  console.log('tiktokData');
};

</script>
