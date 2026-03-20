<template>
  <AppLayout :title="projectTitle" :subtitle="workspaceSubtitle">
    <template #topbar-actions>
      <button class="topbar-chip" type="button" @click="router.push({ name: 'sync' })">同步</button>
      <button class="topbar-chip" type="button" @click="router.push({ name: 'settings' })">设置</button>
    </template>

    <div class="project-shell">
      <aside class="sidebar">
        <div class="sidebar-head">
          <div class="sidebar-label">当前项目</div>
          <div class="sidebar-title">{{ projectStore.currentProject?.name || '未命名项目' }}</div>
          <div class="sidebar-caption">{{ currentPhaseLabel }}</div>
        </div>

        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.phase"
            :to="{ name: item.routeName, params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === item.phase }"
            @click="projectStore.setActivePhase(item.phase)"
          >
            <span class="nav-icon" v-html="item.icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>

      <section class="project-main">
        <header class="project-header">
          <div>
            <div class="eyebrow">Project Workspace</div>
            <h1>{{ currentPhaseLabel }}</h1>
            <p class="project-subtitle">{{ projectStore.currentProject?.description || '围绕当前阶段推进需求、原型、技术方案和任务协作。' }}</p>
          </div>
          <div class="project-status">
            <span class="status-dot" />
            <span>{{ projectStore.currentProject?.sync?.type === 'github' ? 'GitHub 已连接' : '本地模式' }}</span>
          </div>
        </header>

        <div class="project-content">
          <RouterView />
        </div>
      </section>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <button class="toolbar-btn" type="button" @click="openPowerShell">PowerShell</button>
        <button class="toolbar-btn" type="button" @click="openWorkspaceFolder">打开项目目录</button>
      </div>
      <div class="toolbar-group toolbar-meta">
        <span class="toolbar-hint">{{ workspaceSubtitle }}</span>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { open } from '@tauri-apps/plugin-shell'
import AppLayout from '@/components/AppLayout.vue'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'
import { readProjectConfig } from '@/api/workspace'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const projectId = computed(() => route.params.id as string)
const activePhase = computed(() => projectStore.activePhase)

const navItems = [
  {
    phase: 'overview',
    routeName: 'project-overview',
    label: '概览',
    icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 7L8 2.5L14 7V14H10.5V10H5.5V14H2V7Z" stroke="currentColor" stroke-width="1"/></svg>',
  },
  {
    phase: 'requirements',
    routeName: 'requirements',
    label: '需求分析',
    icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" stroke-width="1"/><path d="M10 2V5H13" stroke="currentColor" stroke-width="1"/><path d="M6.5 8H10.5M6.5 11H9" stroke="currentColor" stroke-width="1"/></svg>',
  },
  {
    phase: 'prototype',
    routeName: 'prototype',
    label: '原型设计',
    icon: '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1"/><path d="M2 6.5H14" stroke="currentColor" stroke-width="1"/><circle cx="4.5" cy="4.75" r="0.75" fill="currentColor"/><circle cx="7" cy="4.75" r="0.75" fill="currentColor"/></svg>',
  },
  {
    phase: 'tech',
    routeName: 'tech',
    label: '技术选型',
    icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 4L6 8L2 12" stroke="currentColor" stroke-width="1"/><path d="M8 12H14" stroke="currentColor" stroke-width="1"/></svg>',
  },
  {
    phase: 'tasks',
    routeName: 'tasks',
    label: '任务看板',
    icon: '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="3.5" height="12" rx="1" stroke="currentColor" stroke-width="1"/><rect x="6.5" y="2" width="3.5" height="8" rx="1" stroke="currentColor" stroke-width="1"/><rect x="11" y="2" width="3.5" height="10" rx="1" stroke="currentColor" stroke-width="1"/></svg>',
  },
  {
    phase: 'retrospective',
    routeName: 'retrospective',
    label: '复盘总结',
    icon: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 12L6 8.5L9 10.5L13 5" stroke="currentColor" stroke-width="1"/><path d="M2 14H14" stroke="currentColor" stroke-width="1"/></svg>',
  },
] as const

const currentPhaseLabel = computed(() => {
  const phase = activePhase.value
  const labels: Record<string, string> = {
    overview: '概览',
    requirements: '需求分析',
    prototype: '原型设计',
    tech: '技术选型',
    tasks: '任务看板',
    retrospective: '复盘总结',
  }
  return labels[phase] ?? '进行中'
})

const projectTitle = computed(() => projectStore.currentProject?.name || 'AI Workflow')
const workspaceSubtitle = computed(() => workspaceStore.currentWorkspace?.path || '当前未选择工作区')

onMounted(async () => {
  if (!projectStore.currentProject && workspaceStore.currentWorkspace) {
    try {
      const config = await readProjectConfig(workspaceStore.currentWorkspace.path)
      if (config) {
        projectStore.setCurrentProject(config as unknown as Parameters<typeof projectStore.setCurrentProject>[0])
      }
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
  grid-template-columns: 240px minmax(0, 1fr);
}

.sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 22px 14px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(13, 17, 23, 0.08);
}

.sidebar-head {
  padding: 10px 8px 18px;
}

.sidebar-label {
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.sidebar-caption {
  margin-top: 8px;
  font-size: 12px;
  color: var(--accent);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-2);
  transition:
    transform 0.14s ease,
    background 0.14s ease,
    color 0.14s ease;
}

.nav-item:hover,
.nav-item.active {
  transform: translateX(2px);
  background: white;
  color: var(--text-1);
}

.nav-item.active {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.nav-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.project-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(22px, 3vw, 32px);
  gap: 20px;
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

h1 {
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 10px;
}

.project-subtitle {
  max-width: 700px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-2);
}

.project-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(13, 17, 23, 0.08);
  color: var(--text-2);
  font-size: 12px;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
}

.project-content {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.topbar-chip,
.toolbar-btn {
  padding: 8px 14px;
  font-size: 12px;
  border: 1px solid rgba(13, 17, 23, 0.08);
  background: white;
  color: var(--text-1);
  border-radius: 999px;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    background 0.14s ease;
}

.topbar-chip:hover,
.toolbar-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.22);
  background: var(--accent-bg);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-meta {
  color: var(--text-2);
}

.toolbar-hint {
  font-size: 12px;
}

@media (max-width: 960px) {
  .project-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(13, 17, 23, 0.08);
  }
}

@media (max-width: 720px) {
  .project-main {
    padding: 16px;
  }

  .project-header {
    flex-direction: column;
  }
}
</style>
