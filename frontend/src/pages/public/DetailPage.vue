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
    <div class="q-mt-md q-gutter-y-md">
      <h5>Comments ({{ commentsByPost.length }})</h5>

      <!-- Comments List -->
      <div v-if="commentsByPost.length > 0">
        <div v-for="comment in commentsByPost" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user?.username || 'Ẩn danh' }}</span>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div class="comment-content" v-html="comment.content"></div>
        </div>
      </div>

      <div v-else class="no-comments">
        <p>Chưa có comment nào. Hãy là người đầu tiên bình luận!</p>
      </div>

      <!-- Comment Form -->
      <div class="comment-form q-mt-lg">
        <h6>Thêm comment</h6>

        <!-- Check if user is logged in -->
        <div v-if="!currentUser" class="login-prompt">
          <q-banner class="bg-warning text-black">
            Vui lòng <router-link to="/login">đăng nhập</router-link> để bình luận
          </q-banner>
        </div>

        <div v-else>
          <q-form>
            <q-editor
              v-model="commentText"
              label="Nhập nội dung comment"
              :definitions="{}"
              :toolbar="toolbar"
              :error="!!commentError"
              :error-message="commentError"
              placeholder="Viết comment của bạn..."
            />

            <div class="q-mt-sm">
              <q-btn
                @click="handleCreateComment"
                :disable="!commentText.trim()"
                color="primary"
                icon="send"
                label="Thêm comment"
              />
              <q-btn @click="clearComment" flat label="Xóa" class="q-ml-sm" />
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePostById } from 'src/composables/usePosts';
import { useComments, useCommentsByPost } from 'src/composables/useComments';
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { createComment } = useComments();

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user.value);
const commentText = ref('');
const commentError = ref('');

const route = useRoute();
const id = route.params.id;
const { post } = usePostById(Number(id));
const { commentsByPost, refetch } = useCommentsByPost(Number(id));

const handleCreateComment = async () => {
  if (!commentText.value.trim()) {
    commentError.value = 'Vui lòng nhập nội dung comment';
    return;
  }

  if (!currentUser.value?.id) {
    commentError.value = 'Vui lòng đăng nhập để bình luận';
    return;
  }

  try {
    commentError.value = '';

    // Create the comment
    await createComment(commentText.value, Number(id), Number(currentUser.value.id));

    // Refetch comments to get the updated list
    await refetch();

    // Clear form and show success message
    commentText.value = '';
    $q.notify({
      type: 'positive',
      message: 'Comment đã được thêm thành công!',
      position: 'top',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    commentError.value = 'Có lỗi xảy ra khi tạo comment. Vui lòng thử lại.';
    $q.notify({
      type: 'negative',
      message: 'Không thể tạo comment. Vui lòng thử lại.',
      position: 'top',
    });
  }
};

const clearComment = () => {
  commentText.value = '';
  commentError.value = '';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['quote', 'unordered', 'ordered'],
  ['link', 'image'],
  ['undo', 'redo'],
  [{ label: 'Kích thước', icon: 'format_size', options: ['size-1', 'size-2', 'size-3'] }],
];
</script>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

h5 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

h6 {
  font-size: 1.25rem;
  font-weight: 600;
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

.comment-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #2c3e50;
}

.comment-date {
  font-size: 0.875rem;
  color: #666;
}

.comment-content {
  color: #333;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.comment-form {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-prompt {
  margin-bottom: 1rem;
}

.login-prompt a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 600;
}

.login-prompt a:hover {
  text-decoration: underline;
}
</style>
