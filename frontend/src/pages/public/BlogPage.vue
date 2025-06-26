<template>
  <div class="page">
    <div class="filter">
      <q-select
        v-model="selectedCategory"
        :options="categories"
        label="Chọn chuyên mục"
        option-label="name"
        option-value="id"
        class="filter-item"
        outlined
        @update:model-value="handleCategoryChange"
      />
      <q-select
        v-model="selectedTag"
        :options="tags"
        label="Chọn tag"
        option-label="name"
        option-value="id"
        class="filter-item"
        outlined
      />
    </div>
    <div class="grid">
      <div v-for="post in posts" :key="post.id" class="card" @click="handleClick(post.id)">
        <img v-if="post.thumbnail" :src="post.thumbnail" alt="Thumbnail" class="thumbnail" />

        <div class="content">
          <h3 class="title">{{ post.title }}</h3>
          <p class="meta">Tác giả: {{ post.user?.username || 'Ẩn danh' }}</p>
          <p class="meta">Chuyên mục: {{ post.category?.name || 'Không có' }}</p>

          <div class="tags">
            <span class="tag" v-for="tag in post.tags" :key="tag.id">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { usePosts, usePostsByCategory } from 'src/composables/usePosts';
import { useCategories } from 'src/composables/useCategories';
import { useTags } from 'src/composables/useTags';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { posts } = usePosts();
const { categories } = useCategories();
const { tags } = useTags();

const selectedCategory = ref<string | null>(null);
const selectedTag = ref<string | null>(null);

const handleClick = async (id: string) => {
  await router.push(`/blog/${id}`);
};
const handleCategoryChange = (categoryId: string) => {
  const { posts } = usePostsByCategory(Number(categoryId));
  console.log(posts);
};
</script>
<style scoped>
.page {
  padding: 16px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-item {
  flex: 1 1 200px;
  min-width: 200px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.content {
  padding: 16px;
}

.title {
  color: #1976d2;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.meta {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.tags {
  margin-top: 8px;
}

.tag {
  display: inline-block;
  font-size: 12px;
  background: #1976d2;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  margin: 4px 4px 0 0;
}
</style>
