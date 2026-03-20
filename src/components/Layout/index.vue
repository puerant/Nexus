<template>
  <AppLayout :title="projectTitle" :subtitle="workspaceSubtitle">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" :to="{ name: 'sync' }">同步</UiButton>
      <UiButton variant="ghost" size="sm" :to="{ name: 'settings' }">设置</UiButton>
    </template>

    <div class="project-shell">
      <ProjectSidebar
        :title="projectStore.currentProject?.name || '未命名项目'"
        :phase-label="currentPhaseLabel"
        :active-phase="activePhase"
        :items="navItems"
        @select="projectStore.setActivePhase"
      />

      <section class="project-main">
        <ProjectHero
          :title="currentPhaseLabel"
          :description="projectDescription"
          :status="projectStore.currentProject?.sync?.type === 'github' ? 'GitHub 已连接' : '本地模式'"
        />

        <div class="project-content">
          <RouterView />
        </div>
      </section>
    </div>

    <template #toolbar>
      <ProjectToolbar :hint="workspaceSubtitle" @powershell="openPowerShell" @explorer="openWorkspaceFolder" />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { open } from '@tauri-apps/plugin-shell'
import AppLayout from '@/components/Layout/components/AppLayout.vue'
import ProjectHero from '@/components/Layout/components/ProjectHero.vue'
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
  { phase: 'overview', routeName: 'project-overview', label: '概览', icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 7L8 2.5L14 7V14H10.5V10H5.5V14H2V7Z" stroke="currentColor" stroke-width="1"/></svg>', to: { name: 'project-overview', params: { id: projectId.value } } },
  { phase: 'requirements', routeName: 'requirements', label: '需求分析', icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" stroke-width="1"/><path d="M10 2V5H13" stroke="currentColor" stroke-width="1"/><path d="M6.5 8H10.5M6.5 11H9" stroke="currentColor" stroke-width="1"/></svg>', to: { name: 'requirements', params: { id: projectId.value } } },
  { phase: 'prototype', routeName: 'prototype', label: '原型设计', icon: '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1"/><path d="M2 6.5H14" stroke="currentColor" stroke-width="1"/><circle cx="4.5" cy="4.75" r="0.75" fill="currentColor"/><circle cx="7" cy="4.75" r="0.75" fill="currentColor"/></svg>', to: { name: 'prototype', params: { id: projectId.value } } },
  { phase: 'tech', routeName: 'tech', label: '技术选型', icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 4L6 8L2 12" stroke="currentColor" stroke-width="1"/><path d="M8 12H14" stroke="currentColor" stroke-width="1"/></svg>', to: { name: 'tech', params: { id: projectId.value } } },
  { phase: 'tasks', routeName: 'tasks', label: '任务看板', icon: '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="3.5" height="12" rx="1" stroke="currentColor" stroke-width="1"/><rect x="6.5" y="2" width="3.5" height="8" rx="1" stroke="currentColor" stroke-width="1"/><rect x="11" y="2" width="3.5" height="10" rx="1" stroke="currentColor" stroke-width="1"/></svg>', to: { name: 'tasks', params: { id: projectId.value } } },
  { phase: 'retrospective', routeName: 'retrospective', label: '复盘总结', icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 12L6 8.5L9 10.5L13 5" stroke="currentColor" stroke-width="1"/><path d="M2 14H14" stroke="currentColor" stroke-width="1"/></svg>', to: { name: 'retrospective', params: { id: projectId.value } } },
])

const currentPhaseLabel = computed(() => {
  const labels: Record<string, string> = {
    overview: '概览', requirements: '需求分析', prototype: '原型设计', tech: '技术选型', tasks: '任务看板', retrospective: '复盘总结',
  }
  return labels[activePhase.value] ?? '进行中'
})

const projectTitle = computed(() => projectStore.currentProject?.name || 'AI Workflow')
const workspaceSubtitle = computed(() => workspaceStore.currentWorkspace?.path || '当前未选择工作区')
const projectDescription = computed(() => projectStore.currentProject?.description || '围绕当前阶段推进需求、原型、技术方案和任务协作。')

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

async function openPowerShell() {
  await open('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe')
}

async function openWorkspaceFolder() {
  const path = workspaceStore.currentWorkspace?.path ?? 'C:/'
  await open(path, 'explorer.exe')
}
</script>

<style scoped>
.project-shell {
  min-height: 100%;
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
}

.project-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(1.25rem, 2.8vw, 2rem);
}

.project-content {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

@media (max-width: 960px) {
  .project-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .project-main {
    padding: 1rem;
  }
}
</style>
