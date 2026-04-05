<template>
  <AppLayout :title="projectTitle" :subtitle="workspaceSubtitle">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" :to="{ name: 'sync' }">同步</UiButton>
      <UiButton variant="ghost" size="sm" :to="{ name: 'settings' }">设置</UiButton>
    </template>

    <div class="project-shell">
      <ProjectSidebar
        :active-phase="activePhase"
        :items="navItems"
        @select="projectStore.setActivePhase"
      />

      <section class="project-main">
        <RouterView />
      </section>
    </div>

    <template #toolbar>
      <ProjectToolbar :hint="workspaceSubtitle" :working-dir="workspaceStore.currentWorkspace?.path" />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppLayout from '@/components/Layout/components/AppLayout.vue'
import ProjectSidebar from '@/components/Layout/components/ProjectSidebar.vue'
import ProjectToolbar from '@/components/Layout/components/ProjectToolbar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useProjectStore } from '@/stores/project.ts'
import { useWorkspaceStore } from '@/stores/workspace.ts'
import { readProjectConfig } from '@/api/workspace.ts'

const route = useRoute()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const projectId = computed(() => route.params.id as string)
const activePhase = computed(() => projectStore.activePhase)

const navItems = computed(() => [
  { phase: 'overview', routeName: 'project-overview', label: '概览', icon: 'lucide:home', to: { name: 'project-overview', params: { id: projectId.value } } },
  { phase: 'requirements', routeName: 'requirements', label: '需求分析', icon: 'lucide:file-text', to: { name: 'requirements', params: { id: projectId.value } } },
  { phase: 'tech', routeName: 'tech', label: '技术选型', icon: 'lucide:code', to: { name: 'tech', params: { id: projectId.value } } },
  { phase: 'prototype', routeName: 'prototype', label: '原型设计', icon: 'lucide:layout', to: { name: 'prototype', params: { id: projectId.value } } },
  { phase: 'tasks', routeName: 'tasks', label: '任务看板', icon: 'lucide:kanban', to: { name: 'tasks', params: { id: projectId.value } } },
  { phase: 'retrospective', routeName: 'retrospective', label: '复盘总结', icon: 'lucide:line-chart', to: { name: 'retrospective', params: { id: projectId.value } } },
])

const projectTitle = computed(() => projectStore.currentProject?.name || 'AI Workflow')
const workspaceSubtitle = computed(() => workspaceStore.currentWorkspace?.path || '当前未选择工作区')

onMounted(async () => {
  if (!projectStore.currentProject && workspaceStore.currentWorkspace) {
    try {
      const config = await readProjectConfig(workspaceStore.currentWorkspace.path)
      if (config) projectStore.setCurrentProject(config as unknown as Parameters<typeof projectStore.setCurrentProject>[0])
    } catch (e) {
      console.error('Failed to load project config:', e)
    }
  }
})
</script>

<style scoped>
.project-shell {
  height: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  overflow: hidden;
}

.project-main {
  min-width: 0;
  min-height: 0;
  padding: clamp(1rem, 2vw, 1.5rem);
  overflow: auto;
}

@media (max-width: 960px) {
  .project-shell {
    grid-template-columns: 1fr;
  }

  .project-main {
    padding: 1rem;
  }
}
</style>
