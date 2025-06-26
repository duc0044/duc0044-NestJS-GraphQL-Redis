<template>
  <q-page>
    <h1>Comments</h1>
    <q-table
      title="Danh sách bình luận"
      :rows="comments"
      :columns="columns"
      row-key="id"
      class="q-mb-md"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn flat dense icon="delete" color="negative" @click="deleteById(props?.row?.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { useComment, useComments, type Comment } from 'src/composables/useComments';
import { useQuasar } from 'quasar';

const { comments, loading, onRequest } = useComment();
const { deleteComment } = useComments();
const $q = useQuasar();
const columns = [
  {
    name: 'post',
    label: 'Bài viết',
    field: (row: Comment) => row.post?.title,
    align: 'left' as const,
  },
  {
    name: 'content',
    label: 'Nội dung',
    field: 'content',
    align: 'left' as const,
  },
  {
    name: 'user',
    label: 'Người tạo',
    field: (row: Comment) => row.user?.username,
    align: 'left' as const,
  },
  {
    name: 'actions',
    label: 'Hành động',
    field: 'actions',
    align: 'right' as const,
  },
];

const pagination = {
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
};

const deleteById = (id: number) => {
  $q.dialog({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa bình luận "${id}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await deleteComment(id);
        $q.notify({ type: 'positive', message: 'Đã xóa bình luận', position: 'top' });
      } catch (error) {
        console.error('Error deleting comment:', error);
        $q.notify({ type: 'negative', message: 'Lỗi khi xóa bình luận', position: 'top' });
      }
    })();
  });
};
</script>

<style scoped></style>
