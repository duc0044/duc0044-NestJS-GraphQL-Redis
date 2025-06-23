import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/users/list' },
      { path: 'users/list', component: () => import('pages/users/ListPage.vue') },
      { path: 'users/add', component: () => import('pages/users/AddPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/public',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/users/ListPage.vue') },
    ],
  },
];

export default routes;
