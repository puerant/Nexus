<template>
  <AppLayout title="AI Workflow" subtitle="工作台布局">
    <template #topbar-actions>
      <button class="topbar-chip" type="button" @click="router.push({ name: 'settings' })">设置</button>
    </template>

    <div class="workspace-screen">
      <section class="workspace-panel">
        <div class="hero-row">
          <div class="hero-copy">
            <div class="eyebrow">Workspace</div>
            <h1>选择工作区</h1>
            <p class="subtitle">工作区对应本地的一个项目文件夹，相关文档和配置都会保存在其中。</p>
          </div>

          <div class="hero-brand">
            <div class="logo-mark">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z"
                  stroke="white"
                  stroke-width="1"
                  fill="none"
                />
                <path
                  d="M10 2V18M2 6.5L18 13.5M18 6.5L2 13.5"
                  stroke="white"
                  stroke-width="1"
                  opacity="0.5"
                />
              </svg>
            </div>
            <div>
              <div class="logo-name">AI Workflow</div>
              <div class="logo-tagline">智能开发工作流助手</div>
            </div>
          </div>
        </div>

        <div class="workspace-grid">
          <div class="surface-card recent-card">
            <div class="section-head">
              <span class="section-label">最近使用</span>
              <span class="section-meta">{{ recentWorkspaces.length }} 个</span>
            </div>

            <div v-if="recentWorkspaces.length > 0" class="ws-list">
              <div v-for="ws in recentWorkspaces" :key="ws.path" class="ws-item" @click="selectWorkspace(ws)">
                <svg class="ws-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1.5 5H14.5V13.5H1.5V5Z" stroke="#B1BAC4" stroke-width="1" />
                  <path d="M1.5 5L3 3H7L8 5" stroke="#B1BAC4" stroke-width="1" />
                </svg>
                <div class="ws-info">
                  <div class="ws-name">{{ ws.name }}</div>
                  <div class="ws-path">{{ ws.path }}</div>
                </div>
                <div class="ws-time">{{ formatTime(ws.lastOpened) }}</div>
              </div>
            </div>
            <div v-else class="ws-empty">暂无最近工作区，先打开一个文件夹开始吧。</div>
          </div>

          <div class="surface-card action-card">
            <div class="section-head">
              <span class="section-label">打开方式</span>
            </div>

            <div
              class="drop-zone"
              :class="{ 'drop-active': isDragOver }"
              @click="browseFolder"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="handleDrop"
            >
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none" class="drop-icon" aria-hidden="true">
                <path d="M11 4V18M4 11H18" stroke="currentColor" stroke-width="1.2" />
              </svg>
              <div class="drop-text">拖入文件夹，或者点击浏览</div>
              <div class="drop-hint">支持直接把本地项目文件夹拖拽到这里</div>
            </div>

            <button class="btn btn-primary primary-action" :disabled="isLoading" @click="browseFolder">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M1.5 4.5H13.5V12.5H1.5V4.5Z" stroke="white" stroke-width="1" />
                <path d="M1.5 4.5L3 2.5H6.5L7.5 4.5" stroke="white" stroke-width="1" />
              </svg>
              {{ isLoading ? '打开中…' : '浏览文件夹' }}
            </button>
          </div>
        </div>

        <div class="footer">AI Workflow v{{ version }}</div>
      </section>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <button class="toolbar-btn" type="button" @click="openPowerShell">PowerShell</button>
        <button class="toolbar-btn" type="button" @click="openCommandPrompt">命令提示符</button>
        <button class="toolbar-btn" type="button" @click="openExplorer">打开文件夹</button>
      </div>
      <div class="toolbar-group toolbar-meta">
        <span class="toolbar-hint">底部工具栏</span>
        <button class="toolbar-link" type="button" @click="router.push({ name: 'sync' })">进入同步配置</button>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-shell'
import AppLayout from '@/components/AppLayout.vue'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { openWorkspace } from '@/api/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const recentWorkspaces = ref(workspaceStore.recentWorkspaces)
const isLoading = ref(false)
const isDragOver = ref(false)
const version = '0.1.0'

async function browseFolder() {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  try {
    const path = await openWorkspace()
    if (path) {
      const workspace = createWorkspace(path)
      workspaceStore.setCurrentWorkspace(workspace)
      recentWorkspaces.value = workspaceStore.recentWorkspaces
      await router.push({ name: 'sync' })
    }
  } finally {
    isLoading.value = false
  }
}

async function openPath(path: string) {
  const workspace = createWorkspace(path)
  workspaceStore.setCurrentWorkspace(workspace)
  recentWorkspaces.value = workspaceStore.recentWorkspaces
  await router.push({ name: 'sync' })
}

function createWorkspace(path: string): Workspace {
  return {
    path,
    name: path.split(/[\\/]/).pop() || path,
    lastOpened: new Date().toISOString(),
  }
}

function selectWorkspace(ws: Workspace) {
  workspaceStore.setCurrentWorkspace({ ...ws, lastOpened: new Date().toISOString() })
  router.push({ name: 'sync' })
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const items = e.dataTransfer?.items
  if (!items) return

  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.()
    if (entry?.isDirectory) {
      const file = e.dataTransfer?.files[0]
      if (file) {
        const path = (file as unknown as { path: string }).path
        if (path) {
          void openPath(path)
          return
        }
      }
    }
  }
}

async function openPowerShell() {
  await open('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe')
}

async function openCommandPrompt() {
  await open('C:/Windows/System32/cmd.exe')
}

async function openExplorer() {
  const path = workspaceStore.currentWorkspace?.path ?? 'C:/'
  await open(path, 'explorer.exe')
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return `${Math.floor(days / 30)} 个月前`
}
</script>

<style scoped>
.workspace-screen {
  min-height: 100%;
  padding: clamp(22px, 3vw, 32px);
}

.workspace-panel {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.hero-copy {
  max-width: 620px;
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

.subtitle {
  max-width: 560px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-2);
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #007aff 0%, #7a8cff 100%);
}

.logo-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.logo-tagline {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-2);
}

.workspace-grid {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
  gap: 18px;
  min-height: 0;
}

.surface-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-meta {
  font-size: 12px;
  color: var(--text-3);
}

.ws-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.ws-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid rgba(13, 17, 23, 0.06);
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease;
}

.ws-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.18);
  box-shadow: 0 12px 30px rgba(0, 122, 255, 0.08);
}

.ws-icon {
  flex-shrink: 0;
}

.ws-info {
  flex: 1;
  min-width: 0;
}

.ws-name {
  font-size: 14px;
  font-weight: 600;
}

.ws-path {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-time {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
}

.ws-empty {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 220px;
  color: var(--text-3);
  text-align: center;
  border: 1px dashed rgba(13, 17, 23, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.5);
}

.action-card {
  justify-content: space-between;
  gap: 18px;
}

.drop-zone {
  flex: 1;
  min-height: 280px;
  border: 1px dashed rgba(13, 17, 23, 0.14);
  border-radius: 22px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(244, 248, 253, 0.92));
  color: var(--text-2);
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.drop-zone:hover,
.drop-zone.drop-active {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.32);
  background: linear-gradient(180deg, rgba(235, 245, 255, 0.86), rgba(245, 249, 255, 0.98));
}

.drop-icon {
  color: var(--accent);
}

.drop-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}

.drop-hint {
  font-size: 12px;
  color: var(--text-2);
}

.primary-action {
  width: 100%;
  min-height: 44px;
}

.topbar-chip,
.toolbar-btn,
.toolbar-link {
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

.topbar-chip {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-btn,
.toolbar-link {
  padding: 8px 14px;
  font-size: 12px;
}

.topbar-chip:hover,
.toolbar-btn:hover,
.toolbar-link:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.22);
  background: var(--accent-bg);
}

.toolbar-meta {
  color: var(--text-2);
}

.toolbar-hint {
  font-size: 12px;
}

.toolbar-link {
  color: var(--accent);
}

.footer {
  font-size: 12px;
  color: var(--text-3);
}

@media (max-width: 960px) {
  .hero-row,
  .workspace-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-row {
    gap: 16px;
  }

  .hero-brand {
    justify-self: start;
  }
}

@media (max-width: 720px) {
  .workspace-screen {
    padding: 16px;
  }

  .surface-card {
    padding: 16px;
    border-radius: 18px;
  }

  .toolbar-group {
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
