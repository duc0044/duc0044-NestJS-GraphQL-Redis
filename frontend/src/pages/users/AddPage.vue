<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Add New User</h4>
        <p class="text-grey-6 q-mt-sm">Create a new user account</p>
      </div>
    </div>

    <q-card class="q-pa-md">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.name" label="Full Name" outlined :rules="[val => !!val || 'Name is required']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.email" label="Email" type="email" outlined :rules="[
              val => !!val || 'Email is required',
              val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
            ]" />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.phone" label="Phone Number" outlined mask="(###) ### - ####" />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="form.role" :options="roleOptions" label="Role" outlined
              :rules="[val => !!val || 'Role is required']" />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12">
            <q-input v-model="form.bio" label="Bio" type="textarea" outlined rows="3" />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12">
            <q-toggle v-model="form.isActive" label="Active Account" color="positive" />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12">
            <q-btn type="submit" color="primary" icon="save" label="Save User" size="lg" />
            <q-btn type="reset" color="secondary" icon="clear" label="Reset" size="lg" class="q-ml-md" />
            <q-btn color="grey" icon="arrow_back" label="Back to List" size="lg" class="q-ml-md"
              @click="$router.push('/users/list')" />
          </div>
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'quasar';

useMeta({
  title: 'Add User',
  titleTemplate: (title) => `${title}`,
});

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  bio: '',
  isActive: true
});

const roleOptions = [
  'Admin',
  'User',
  'Manager',
  'Editor',
  'Viewer'
];

const onSubmit = () => {
  console.log('Form submitted:', form.value);
  // Here you would typically send the data to your backend
};
</script>
