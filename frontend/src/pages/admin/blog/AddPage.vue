<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="q-pa-lg q-mx-auto shadow-3 rounded-borders" style="max-width: 1100px">
      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="text-h5 text-primary text-weight-bold flex items-center gap-2">
          <q-icon name="article" size="28px" class="q-mr-sm" />
          Thêm bài viết mới
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Vui lòng điền đầy đủ thông tin bên dưới để đăng bài viết.
        </div>
      </q-card-section>

      <q-separator spaced />

      <!-- Form -->
      <q-form @submit.prevent="submitAddPost" class="q-mt-md">
        <div class="row q-col-gutter-lg">
          <!-- Title & Slug -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="post.title"
              label="Tiêu đề bài viết"
              :rules="[(val) => !!val || 'Tiêu đề là bắt buộc']"
              outlined
              dense
              color="primary"
              class="q-mb-md"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="post.slug"
              label="Slug (đường dẫn)"
              outlined
              dense
              color="primary"
              class="q-mb-md"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  icon="autorenew"
                  @click="generateSlugFromTitle"
                  :disable="!post.title"
                  size="sm"
                >
                  <q-tooltip>Tạo lại slug từ tiêu đề</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>

          <!-- Danh mục, Tags -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="post.category"
              :options="categories"
              option-label="name"
              option-value="id"
              label="Danh mục bài viết"
              emit-value
              map-options
              outlined
              dense
              color="primary"
              use-input
              input-debounce="0"
              clearable
              :rules="[(val) => !!val || 'Chọn danh mục']"
              class="q-mb-md"
            />
            <q-select
              v-model="post.tags"
              :options="tags"
              option-label="name"
              option-value="id"
              label="Tags liên quan"
              multiple
              emit-value
              map-options
              outlined
              dense
              color="primary"
              use-input
              input-debounce="0"
              clearable
              class="q-mb-md"
            />
          </div>

          <!-- Thumbnail + Preview -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="post.thumbnail"
              label="Ảnh Thumbnail (URL)"
              outlined
              dense
              color="primary"
              class="q-mb-sm"
            />
            <q-img
              v-if="post.thumbnail"
              :src="post.thumbnail"
              spinner-color="primary"
              contain
              class="rounded-borders shadow-1"
              style="height: 150px; max-width: 100%"
              :ratio="16 / 9"
            />
          </div>

          <!-- Nội dung bài viết -->
          <div class="col-12">
            <q-editor
              v-model="post.content"
              label="Nội dung bài viết"
              :definitions="{}"
              :toolbar="toolbar"
              :rules="[(val: string) => !!val || 'Nội dung là bắt buộc']"
              class="bg-white rounded-borders shadow-1"
              style="min-height: 300px"
            />
          </div>
        </div>

        <!-- Submit button -->
        <div class="row q-mt-xl">
          <div class="col-12 flex justify-center justify-md-end">
            <q-btn
              type="submit"
              color="primary"
              label="Đăng bài viết"
              :loading="loading"
              icon="send"
              unelevated
              rounded
              size="lg"
              class="q-px-xl shadow-2 full-width full-width-md-auto"
            />
          </div>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar, useMeta } from 'quasar';
import { type CreatePostInput, type Post, usePosts } from 'src/composables/usePosts';
import { useCategories } from 'src/composables/useCategories';
import { useTags } from 'src/composables/useTags';

const $q = useQuasar();
const { categories } = useCategories();
const { tags } = useTags();
const { createPost, loading, refetchPosts } = usePosts();

const post = ref<Post>({
  id: '',
  title: '',
  slug: '',
  content: '',
  thumbnail: '',
  category: { id: '', name: '' },
  tags: [],
});

const slugManuallyEdited = ref(false);

watch(
  () => post.value.title,
  (newTitle) => {
    if (newTitle && !slugManuallyEdited.value) {
      post.value.slug = newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
    }
  },
);

watch(
  () => post.value.slug,
  (newSlug, oldSlug) => {
    if (oldSlug !== undefined && newSlug !== oldSlug) {
      slugManuallyEdited.value = true;
    }
    if (!newSlug) {
      slugManuallyEdited.value = false;
    }
  },
);

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['quote', 'unordered', 'ordered'],
  ['link', 'image'],
  ['undo', 'redo'],
  [{ label: 'Kích thước', icon: 'format_size', options: ['size-1', 'size-2', 'size-3'] }],
];

useMeta({ title: 'Thêm bài viết' });

const submitAddPost = async () => {
  try {
    // Chuẩn hóa dữ liệu gửi lên backend
    const postData = {
      title: post.value.title,
      slug: post.value.slug,
      content: post.value.content,
      thumbnail: post.value.thumbnail,
      category_id: Number(post.value.category),
      tag_ids: Array.isArray(post.value.tags) ? post.value.tags.map((tag) => Number(tag)) : [],
    };

    await createPost(postData as CreatePostInput);
    await refetchPosts();
    $q.notify({
      type: 'positive',
      message: 'Thêm bài viết thành công!',
      position: 'top',
    });
    post.value = {
      id: '',
      title: '',
      slug: '',
      content: '',
      thumbnail: '',
      category: { id: '', name: '' },
      tags: [],
    };
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Có lỗi khi thêm bài viết',
      position: 'top',
    });
  }
};

function generateSlugFromTitle() {
  post.value.slug = post.value.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}
</script>
