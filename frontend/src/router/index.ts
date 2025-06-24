import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guards
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated.value) {
      next('/auth/login')
      return
    }
    
    // Check if route requires admin privileges
    if (to.meta.requiresAdmin && authStore.user.value && authStore.user.value.role !== 'ADMIN') {
      next('/')
      return
    }
    
    // Redirect authenticated users away from auth pages
    if (to.path.startsWith('/auth') && authStore.isAuthenticated.value) {
      next('/')
      return
    }
    
    next()
  })

  return Router;
});
