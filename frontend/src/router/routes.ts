import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/users/list' },
      { path: 'users/list', component: () => import('pages/admin/users/ListPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
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
