<template>
  <AppLayout title="AI Workflow" subtitle="工作台布局">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" :to="{ name: 'settings' }">设置</UiButton>
    </template>

    <div class="workspace-screen">
      <div class="workspace-stack">
        <UiPageIntro
          eyebrow="Workspace"
          title="选择工作区"
          description="工作区对应本地的一个项目文件夹，相关文档和配置都会保存在其中。"
        >
          <template #aside>
            <UiSurface class="brand-panel" tone="accent">
              <div class="brand-mark">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z" stroke="white" stroke-width="1" fill="none" />
                  <path d="M10 2V18M2 6.5L18 13.5M18 6.5L2 13.5" stroke="white" stroke-width="1" opacity="0.5" />
                </svg>
              </div>
              <div>
                <div class="brand-name">AI Workflow</div>
                <div class="brand-tagline">智能开发工作流助手</div>
              </div>
            </UiSurface>
          </template>
        </UiPageIntro>

        <div class="workspace-grid">
          <UiSurface class="surface-column">
            <div class="section-head">
              <span class="section-label">最近使用</span>
              <span class="section-meta">{{ recentWorkspaces.length }} 个</span>
            </div>

            <div v-if="recentWorkspaces.length > 0" class="ws-list">
              <button v-for="ws in recentWorkspaces" :key="ws.path" class="ws-item" type="button" @click="selectWorkspace(ws)">
                <UiIcon class="ws-icon" icon="lucide:folder" />
                <div class="ws-info">
                  <div class="ws-name">{{ ws.name }}</div>
                  <div class="ws-path">{{ ws.path }}</div>
                </div>
                <div class="ws-time">{{ formatTime(ws.lastOpened) }}</div>
              </button>
            </div>
            <div v-else class="ws-empty">暂无最近工作区，先打开一个文件夹开始吧。</div>
          </UiSurface>

          <UiSurface class="surface-column action-column" tone="muted">
            <div class="section-head">
              <span class="section-label">打开方式</span>
            </div>

            <button
              class="drop-zone"
              :class="{ 'drop-active': isDragOver }"
              type="button"
              @click="browseFolder"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="handleDrop"
            >
              <UiIcon class="drop-icon" icon="lucide:plus" size="lg" />
              <div class="drop-text">拖入文件夹，或者点击浏览</div>
              <div class="drop-hint">支持直接把本地项目文件夹拖拽到这里</div>
            </button>

            <UiButton variant="primary" size="lg" block :disabled="isLoading" @click="browseFolder">
              <template #icon>
                <UiIcon icon="lucide:folder-open" />
              </template>
              {{ isLoading ? '打开中…' : '浏览文件夹' }}
            </UiButton>
          </UiSurface>
        </div>

        <div class="footer">AI Workflow v{{ version }}</div>
      </div>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <UiButton variant="ghost" size="sm" @click="openPowerShell">PowerShell</UiButton>
        <UiButton variant="ghost" size="sm" @click="openCommandPrompt">命令提示符</UiButton>
        <UiButton variant="ghost" size="sm" @click="openExplorer">打开文件夹</UiButton>
      </div>
      <div class="toolbar-group toolbar-meta">
        <span class="toolbar-hint">底部工具栏</span>
        <UiButton variant="link" size="sm" :to="{ name: 'sync' }">进入同步配置</UiButton>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { openTerminal, openFileExplorer } from '@/api/system'
import AppLayout from '@/components/Layout/components/AppLayout.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiPageIntro from '@/components/ui/UiPageIntro.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { openWorkspace } from '@/api/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const recentWorkspaces = ref(workspaceStore.recentWorkspaces)
const isLoading = ref(false)
const isDragOver = ref(false)
const version = '0.1.0'

async function browseFolder() {
  if (isLoading.value) return
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
  void router.push({ name: 'sync' })
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
  try {
    await openTerminal('powershell', workspaceStore.currentWorkspace?.path)
  } catch (e) {
    console.error('Failed to open PowerShell:', e)
  }
}

async function openCommandPrompt() {
  try {
    await openTerminal('cmd', workspaceStore.currentWorkspace?.path)
  } catch (e) {
    console.error('Failed to open Command Prompt:', e)
  }
}

async function openExplorer() {
  try {
    await openFileExplorer(workspaceStore.currentWorkspace?.path)
  } catch (e) {
    console.error('Failed to open file explorer:', e)
  }
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
  padding: clamp(1.25rem, 2.8vw, 2rem);
}

.workspace-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100%;
}

.brand-panel {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 16rem;
}

.brand-mark {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  background: var(--color-accent);
  box-shadow: var(--shadow-accent);
}

.brand-name {
  font-weight: 700;
  color: var(--color-text-primary);
}

.brand-tagline {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.workspace-grid {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(20rem, 0.8fr);
  gap: 1.125rem;
  min-height: 0;
}

.surface-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.action-column {
  gap: 1rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.section-label {
  font-size: var(--type-label);
  font-weight: 700;
  color: var(--color-text-tertiary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-meta,
.footer,
.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.ws-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: auto;
}

.ws-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.95rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition: transform var(--motion-fast), border-color var(--motion-fast), box-shadow var(--motion-fast);
}

.ws-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--color-accent) 22%, white 78%);
  box-shadow: var(--shadow-soft);
}

.ws-icon {
  color: var(--color-text-tertiary);
}

.ws-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.ws-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.ws-path {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-time {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.ws-empty {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 14rem;
  text-align: center;
  border: 1px dashed var(--color-border-soft);
  border-radius: var(--radius-xl);
  color: var(--color-text-tertiary);
}

.drop-zone {
  flex: 1;
  min-height: 18rem;
  border: 1px dashed color-mix(in oklab, var(--color-accent) 14%, var(--color-border-soft));
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: linear-gradient(180deg, var(--color-surface-raised), var(--color-surface-soft));
  color: var(--color-text-secondary);
  transition: transform var(--motion-fast), border-color var(--motion-fast), background var(--motion-fast);
}

.drop-zone:hover,
.drop-zone.drop-active {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--color-accent) 34%, white 66%);
  background: linear-gradient(180deg, var(--color-accent-soft), var(--color-surface-raised));
}

.drop-icon {
  color: var(--color-accent);
}

.drop-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.drop-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-meta {
  color: var(--color-text-secondary);
}

@media (max-width: 960px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .workspace-screen {
    padding: 1rem;
  }
}
</style>
