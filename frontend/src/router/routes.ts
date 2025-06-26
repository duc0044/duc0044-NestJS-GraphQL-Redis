import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/users/list' },
      { path: 'users/list', component: () => import('pages/admin/users/ListPage.vue') },
      { path: 'categories/list', component: () => import('pages/admin/categories/ListPage.vue') },
      { path: 'tags/list', component: () => import('pages/admin/tag/ListPage.vue') },
      { path: 'blog/list', component: () => import('pages/admin/blog/ListPage.vue') },
      { path: 'blog/add', component: () => import('pages/admin/blog/AddPage.vue') },
      { path: 'blog/update/:id', component: () => import('pages/admin/blog/updatePage.vue') },
      { path: 'comments/list', component: () => import('pages/admin/comments/ListPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      { path: '', component: () => import('pages/public/HomePage.vue') },
      { path: 'blog/:id', component: () => import('pages/public/DetailPage.vue') },
      { path: 'blog', component: () => import('pages/public/BlogPage.vue') },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/public/auth/LoginPage.vue') },
      { path: 'register', component: () => import('pages/public/auth/RegisterPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
