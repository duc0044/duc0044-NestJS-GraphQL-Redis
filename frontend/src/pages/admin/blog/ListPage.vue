<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4>Quản lý bài viết</h4>
      </div>
      <div class="col-auto">
        <q-btn label="Thêm bài viết" to="/admin/blog/add" color="primary" icon="add" />
      </div>
    </div>

    <q-table
      title="Danh sách bài viết"
      :rows="paginatedPosts"
      :columns="columns as any"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      @request="onRequest"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn flat dense icon="edit" @click="updatePost(props.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="deletePost(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { type Post, usePosts } from 'src/composables/usePosts';
import { onMounted } from 'vue';

const { posts, pagination, loading, deletePost, refetchPosts, onRequest } = usePosts();

const router = useRouter();

const columns = [
  { name: 'title', label: 'Tiêu đề', field: 'title', sortable: true, align: 'left' },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  {
    name: 'category',
    label: 'Danh mục',
    field: (row: Post) => row.category?.name || '',
    align: 'left',
  },
  {
    name: 'tags',
    label: 'Thẻ',
    field: (row: Post) => row.tags?.map((t: { name: string }) => t.name).join(', '),
    align: 'left',
  },
  {
    name: 'user',
    label: 'Người viết',
    field: (row: Post) => row.user?.username || '',
    align: 'left',
  },
  { name: 'actions', label: 'Hành động', field: 'actions', align: 'right' },
];

const paginatedPosts = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return posts.value.slice(start, start + pagination.value.rowsPerPage);
});

const updatePost = async (post: Post) => {
  await router.push(`/admin/blog/update/${post.id}`);
};

onMounted(async () => {
  await refetchPosts();
});
</script>
