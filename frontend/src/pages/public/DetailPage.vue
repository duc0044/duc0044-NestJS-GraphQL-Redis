<template>
  <q-page class="q-pa-md">
    <div v-if="post">
      <h1>{{ post.title }}</h1>
      <p v-html="post.content"></p>
      <div class="post-meta">
        <p>Chuyên mục: {{ post.category.name }}</p>
        <p>Tags: {{ post.tags.map((tag) => tag.name).join(', ') }}</p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePostById } from 'src/composables/usePosts';

const route = useRoute();
const id = route.params.id;
const { post } = usePostById(Number(id));
</script>
<style scoped>
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

p {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
}

p:last-of-type {
  margin-bottom: 0;
}

.q-page {
  background-color: #f9f9f9;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  margin: auto;
}

.post-meta {
  font-size: 0.875rem;
  color: #666;
  margin-top: 1rem;
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
}
</style>
