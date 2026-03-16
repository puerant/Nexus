import { createRouter, createWebHistory } from 'vue-router'
import WorkspaceView from '@/views/WorkspaceView.vue'

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
      component: () => import('@/views/SyncView.vue'),
    },
    {
      path: '/project/:id',
      name: 'project',
      component: () => import('@/views/ProjectView.vue'),
      children: [
        {
          path: '',
          name: 'project-overview',
          component: () => import('@/views/project/OverviewView.vue'),
        },
        {
          path: 'requirements',
          name: 'requirements',
          component: () => import('@/views/project/RequirementsView.vue'),
        },
        {
          path: 'prototype',
          name: 'prototype',
          component: () => import('@/views/project/PrototypeView.vue'),
        },
        {
          path: 'tech',
          name: 'tech',
          component: () => import('@/views/project/TechView.vue'),
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/views/project/TasksView.vue'),
        },
        {
          path: 'retrospective',
          name: 'retrospective',
          component: () => import('@/views/project/RetrospectiveView.vue'),
        },
      ],
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
})

export default router
