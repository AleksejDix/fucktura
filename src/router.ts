import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DocumentView.vue'),
    },
    {
      path: '/:id(\\d+)',
      name: 'document',
      component: () => import('@/views/DocumentView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientsView.vue'),
    },
    {
      path: '/positions',
      name: 'positions',
      component: () => import('@/views/PositionsView.vue'),
    },
  ],
});

export { router };
