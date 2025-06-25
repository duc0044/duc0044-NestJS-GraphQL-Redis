<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="q-pa-lg q-mx-auto shadow-3 rounded-borders" style="max-width: 1100px">
      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="text-h5 text-primary text-weight-bold flex items-center gap-2">
          <q-icon name="edit" size="28px" class="q-mr-sm" />
          Cập nhật bài viết
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">Chỉnh sửa thông tin bài viết bên dưới.</div>
      </q-card-section>

      <q-separator spaced />

      <!-- Loading state -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-grey-6 q-mt-md">Đang tải dữ liệu...</div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error" color="negative" size="50px" />
        <div class="text-negative q-mt-md">Có lỗi xảy ra khi tải dữ liệu</div>
      </div>

      <!-- Form -->
      <q-form v-else @submit.prevent="submitUpdatePost" class="q-mt-md">
        <div class="row q-col-gutter-lg">
          <!-- Title & Slug -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="postData.title"
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
              v-model="postData.slug"
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
                  :disable="!postData.title"
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
              v-model="postData.category_id"
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
            >
              <template v-slot:selected>
                <span v-if="postData.category_id">
                  {{
                    categories.find((cat) => cat.id === String(postData.category_id))?.name ||
                    'Chọn danh mục'
                  }}
                </span>
                <span v-else class="text-grey-5">Chọn danh mục</span>
              </template>
            </q-select>
            <q-select
              v-model="postData.tag_ids"
              :options="tags"
              option-label="name"
              option-value="id"
              multiple
              emit-value
              map-options
              label="Tags liên quan"
              use-input
              clearable
              dense
              outlined
              color="primary"
            />
          </div>

          <!-- Thumbnail + Preview -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="postData.thumbnail"
              label="Ảnh Thumbnail (URL)"
              outlined
              dense
              color="primary"
              class="q-mb-sm"
            />
            <q-img
              v-if="postData.thumbnail"
              :src="postData.thumbnail"
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
              v-model="postData.content"
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
        <div class="q-mt-xl">
          <div class="flex justify-center justify-md-end gap-2">
            <q-btn
              color="grey-7"
              label="Hủy"
              icon="cancel"
              unelevated
              rounded
              size="md"
              class="q-px-xl shadow-2 q-mr-sm"
              @click="$router.back()"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Cập nhật bài viết"
              :loading="updateLoading"
              icon="save"
              unelevated
              rounded
              size="md"
              class="q-px-xl shadow-2"
            />
          </div>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePosts, usePostById } from 'src/composables/usePosts';
import { useCategories } from 'src/composables/useCategories';
import { useTags } from 'src/composables/useTags';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const postId = Number(route.params.id);

const { updatePost } = usePosts();
const { post, loading, error } = usePostById(postId);
const { categories } = useCategories();
const { tags } = useTags();

const updateLoading = ref(false);

// Reactive form data
const postData = reactive({
  title: '',
  slug: '',
  content: '',
  thumbnail: '',
  category_id: null as number | null,
  tag_ids: [] as string[],
});

// Editor toolbar
const toolbar = [
  [
    {
      label: $q.lang.editor.align,
      icon: $q.iconSet.editor.align,
      fixedLabel: true,
      list: 'only-icons',
      options: ['left', 'center', 'right', 'justify'],
    },
  ],
  ['bold', 'italic', 'strike', 'underline'],
  ['hr', 'link'],
  ['undo', 'redo'],
  ['viewsource'],
];

// Watch for post data changes and update form
const updateFormData = () => {
  if (post.value) {
    postData.title = post.value.title;
    postData.slug = post.value.slug;
    postData.content = post.value.content;
    postData.thumbnail = post.value.thumbnail;
    postData.category_id = Number(post.value.category?.id) || null;
    postData.tag_ids = post.value.tags?.map((tag: { id: string }) => tag.id) || [];
  }
};

// Watch for post changes
watch(post, updateFormData, { immediate: true });

// Generate slug from title
const generateSlugFromTitle = () => {
  if (postData.title) {
    postData.slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
};

// Submit update
const submitUpdatePost = async () => {
  updateLoading.value = true;
  try {
    await updatePost({
      id: postId.toString(),
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      thumbnail: postData.thumbnail,
      category: {
        id: postData.category_id?.toString() || '',
        name:
          categories.value.find(
            (cat: { id: string; name: string }) => cat.id === String(postData.category_id),
          )?.name || '',
      },
      tags: postData.tag_ids.map((id) => ({
        id: id,
        name: tags.value.find((tag: { id: string; name: string }) => tag.id === id)?.name || '',
      })),
    });

    $q.notify({
      type: 'positive',
      message: 'Cập nhật bài viết thành công!',
      position: 'top',
    });

    // Navigate back to list
    void router.push('/admin/blog/list');
  } catch (error) {
    console.error('Error updating post:', error);
    $q.notify({
      type: 'negative',
      message: 'Có lỗi xảy ra khi cập nhật bài viết',
      position: 'top',
    });
  } finally {
    updateLoading.value = false;
  }
};
</script>

<style scoped>
.q-editor {
  border: 1px solid #ddd;
}
</style>
