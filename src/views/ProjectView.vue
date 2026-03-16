<template>
  <div class="app-layout">
    <!-- Titlebar (macOS-style) -->
    <div class="titlebar" data-tauri-drag-region>
      <div class="wc">
        <span class="wc-dot r" @click="appWindow.close()" />
        <span class="wc-dot y" @click="appWindow.minimize()" />
        <span class="wc-dot g" @click="toggleMaximize()" />
      </div>
      <div class="titlebar-center">
        <span class="titlebar-ws">{{ wsName }}</span>
        <span v-if="projectStore.currentProject" class="titlebar-sep">/</span>
        <span v-if="projectStore.currentProject" class="titlebar-proj">
          {{ projectStore.currentProject.name }}
        </span>
      </div>
      <div class="titlebar-right">
        <button class="tb-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6C2 3.8 3.8 2 6 2C8.2 2 10 3.8 10 6"
              stroke="#6E7781"
              stroke-width="1"
            />
            <path d="M10 4L10 6L8 6" stroke="#6E7781" stroke-width="1" />
          </svg>
          同步
        </button>
      </div>
    </div>

    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sb-head">
          <div class="sb-logo">
            <div class="logo-mark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z"
                  stroke="white"
                  stroke-width="1"
                  fill="none"
                />
              </svg>
            </div>
            <span class="logo-name">AI Workflow</span>
          </div>
          <div v-if="projectStore.currentProject" class="sb-project">
            <div class="sb-project-label">当前项目</div>
            <div class="sb-project-name">
              {{ projectStore.currentProject.name }}
              <span class="sb-project-badge">{{ currentPhaseLabel }}</span>
            </div>
          </div>
        </div>

        <nav class="sb-nav">
          <RouterLink
            :to="{ name: 'project-overview', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'overview' }"
            @click="projectStore.setActivePhase('overview')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 7L8 2.5L14 7V14H10.5V10H5.5V14H2V7Z" stroke="currentColor" stroke-width="1" />
            </svg>
            概览
          </RouterLink>

          <RouterLink
            :to="{ name: 'requirements', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'requirements' }"
            @click="projectStore.setActivePhase('requirements')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" stroke-width="1" />
              <path d="M10 2V5H13" stroke="currentColor" stroke-width="1" />
              <path d="M6.5 8H10.5M6.5 11H9" stroke="currentColor" stroke-width="1" />
            </svg>
            需求分析
          </RouterLink>

          <RouterLink
            :to="{ name: 'prototype', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'prototype' }"
            @click="projectStore.setActivePhase('prototype')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1" />
              <path d="M2 6.5H14" stroke="currentColor" stroke-width="1" />
              <circle cx="4.5" cy="4.75" r="0.75" fill="currentColor" />
              <circle cx="7" cy="4.75" r="0.75" fill="currentColor" />
            </svg>
            原型设计
          </RouterLink>

          <RouterLink
            :to="{ name: 'tech', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'tech' }"
            @click="projectStore.setActivePhase('tech')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 4L6 8L2 12" stroke="currentColor" stroke-width="1" />
              <path d="M8 12H14" stroke="currentColor" stroke-width="1" />
            </svg>
            技术选型
          </RouterLink>

          <RouterLink
            :to="{ name: 'tasks', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'tasks' }"
            @click="projectStore.setActivePhase('tasks')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="3.5" height="12" rx="1" stroke="currentColor" stroke-width="1" />
              <rect x="6.5" y="2" width="3.5" height="8" rx="1" stroke="currentColor" stroke-width="1" />
              <rect x="11" y="2" width="3.5" height="10" rx="1" stroke="currentColor" stroke-width="1" />
            </svg>
            任务看板
          </RouterLink>

          <RouterLink
            :to="{ name: 'retrospective', params: { id: projectId } }"
            class="nav-item"
            :class="{ active: activePhase === 'retrospective' }"
            @click="projectStore.setActivePhase('retrospective')"
          >
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L6 8.5L9 10.5L13 5" stroke="currentColor" stroke-width="1" />
              <path d="M2 14H14" stroke="currentColor" stroke-width="1" />
            </svg>
            复盘总结
          </RouterLink>
        </nav>

        <div class="sb-footer">
          <RouterLink :to="{ name: 'settings' }" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1" />
              <path
                d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.5 3.5L4.5 4.5M11.5 11.5L12.5 12.5M3.5 12.5L4.5 11.5M11.5 4.5L12.5 3.5"
                stroke="currentColor"
                stroke-width="1"
              />
            </svg>
            设置
          </RouterLink>
        </div>
      </aside>

      <!-- Main work area -->
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'
import { readProjectConfig } from '@/api/workspace'
import { getCurrentWindow } from '@tauri-apps/api/window'

const route = useRoute()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const appWindow = getCurrentWindow()
const projectId = computed(() => route.params.id as string)
const activePhase = computed(() => projectStore.activePhase)

const wsName = computed(() => {
  const ws = workspaceStore.currentWorkspace
  if (!ws) return ''
  return ws.path.split(/[/\\]/).filter(Boolean).slice(-2, -1)[0] ?? ''
})

const currentPhaseLabel = computed(() => {
  const phase = activePhase.value
  const labels: Record<string, string> = {
    overview: '概览',
    requirements: '需求分析',
    prototype: '原型设计',
    tech: '技术选型',
    tasks: '任务开发',
    retrospective: '复盘总结',
  }
  return labels[phase] ?? '进行中'
})

async function toggleMaximize() {
  const maximized = await appWindow.isMaximized()
  if (maximized) {
    await appWindow.unmaximize()
  } else {
    await appWindow.maximize()
  }
}

onMounted(async () => {
  // Load project config if not already loaded
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
</script>

<style scoped>
.app-layout {
  width: 100%;
  height: 100%;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
}

/* Titlebar */
.titlebar {
  height: var(--titlebar-height);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  user-select: none;
}
.wc {
  display: flex;
  gap: 8px;
}
.wc-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  display: block;
  transition: opacity 0.1s;
}
.wc-dot:hover {
  opacity: 0.8;
}
.wc-dot.r {
  background: #ff5f57;
}
.wc-dot.y {
  background: #febc2e;
}
.wc-dot.g {
  background: #28c840;
}
.titlebar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.titlebar-ws {
  font-size: 13px;
  color: var(--text-2);
}
.titlebar-sep {
  font-size: 13px;
  color: var(--text-3);
}
.titlebar-proj {
  font-size: 13px;
  color: var(--text-1);
  font-weight: 500;
}
.titlebar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tb-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-2);
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  font-family: var(--font);
  transition: all 0.1s;
}
.tb-btn:hover {
  background: var(--hover);
  color: var(--text-1);
}

/* Layout */
.layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sb-head {
  padding: 18px 14px 14px;
  border-bottom: 1px solid var(--border);
}
.sb-logo {
  display: flex;
  align-items: center;
  gap: 9px;
}
.logo-mark {
  width: 26px;
  height: 26px;
  background: var(--accent);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-1);
}
.sb-project {
  margin-top: 10px;
}
.sb-project-label {
  font-size: 10px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 3px;
}
.sb-project-name {
  font-size: 12.5px;
  color: var(--text-1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.sb-project-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 100px;
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}
.sb-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: var(--r-xs);
  cursor: pointer;
  transition: background 0.1s;
  text-decoration: none;
  color: var(--text-2);
  font-size: 13px;
  margin-bottom: 2px;
}
.nav-item:hover {
  background: var(--hover);
  color: var(--text-1);
}
.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent);
}
.nav-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}
.sb-footer {
  padding: 8px;
  border-top: 1px solid var(--border);
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
