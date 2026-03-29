import { createRouter, createWebHistory } from 'vue-router'
import WorkspaceView from '@/views/Workspace/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'workspace',
      component: WorkspaceView,
    },
    {
      path: '/sync',
      name: 'sync',
      component: () => import('@/views/Sync/index.vue'),
    },
    {
      path: '/project/:id',
      name: 'project',
      component: () => import('@/components/Layout/index.vue'),
      children: [
        {
          path: '',
          name: 'project-overview',
          component: () => import('@/views/Overview/index.vue'),
        },
        {
          path: 'requirements',
          name: 'requirements',
          component: () => import('@/views/Requirements/index.vue'),
        },
        {
          path: 'tech',
          name: 'tech',
          component: () => import('@/views/Tech/index.vue'),
        },
        {
          path: 'prototype',
          name: 'prototype',
          component: () => import('@/views/Prototype/index.vue'),
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/views/Tasks/index.vue'),
        },
        {
          path: 'retrospective',
          name: 'retrospective',
          component: () => import('@/views/Retrospective/index.vue'),
        },
      ],
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings/index.vue'),
    }
  ],
})

export default router
