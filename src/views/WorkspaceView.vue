<template>
  <div class="workspace-screen">
    <div class="app-card">
      <!-- Title bar -->
      <div class="titlebar">
        <div class="wc">
          <span class="wc-dot r" />
          <span class="wc-dot y" />
          <span class="wc-dot g" />
        </div>
        <span class="titlebar-title">AI Workflow</span>
        <span class="titlebar-spacer" />
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Logo -->
        <div class="logo-row">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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

        <h2>选择工作区</h2>
        <p class="subtitle">工作区对应本地的一个项目文件夹，所有文档和配置将保存在其中。</p>

        <!-- Recent workspaces -->
        <div class="section-label">最近使用</div>
        <div v-if="recentWorkspaces.length > 0" class="ws-list">
          <div
            v-for="ws in recentWorkspaces"
            :key="ws.path"
            class="ws-item"
            @click="selectWorkspace(ws)"
          >
            <svg class="ws-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
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
        <div v-else class="ws-empty">暂无最近工作区</div>

        <!-- Drop zone -->
        <div
          class="drop-zone"
          :class="{ 'drop-active': isDragOver }"
          @click="browseFolder"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="drop-icon">
            <path d="M11 4V18M4 11H18" stroke="#B1BAC4" stroke-width="1" />
          </svg>
          <div class="drop-text">拖入文件夹，或点击浏览</div>
          <div class="drop-hint">支持将本地文件夹拖放到此区域</div>
        </div>

        <button class="btn btn-primary" :disabled="isLoading" @click="browseFolder">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1.5 4.5H13.5V12.5H1.5V4.5Z" stroke="white" stroke-width="1" />
            <path d="M1.5 4.5L3 2.5H6.5L7.5 4.5" stroke="white" stroke-width="1" />
          </svg>
          {{ isLoading ? '打开中...' : '浏览文件夹' }}
        </button>

        <div class="footer">AI Workflow v{{ version }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore, type Workspace } from '@/stores/workspace'
import { openWorkspace } from '@/api/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const isLoading = ref(false)
const isDragOver = ref(false)
const version = '0.1.0'

const { recentWorkspaces } = workspaceStore

async function browseFolder() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const path = await openWorkspace()
    if (path) {
      await openPath(path)
    }
  } catch (e) {
    console.error('Failed to open workspace:', e)
  } finally {
    isLoading.value = false
  }
}

async function openPath(path: string) {
  const name = path.split(/[/\\]/).filter(Boolean).at(-1) ?? path
  const workspace: Workspace = {
    path,
    name,
    lastOpened: new Date().toISOString(),
  }
  workspaceStore.setCurrentWorkspace(workspace)
  await router.push({ name: 'sync' })
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
      // In Tauri, we get the path from the DataTransfer files
      const file = e.dataTransfer?.files[0]
      if (file) {
        // Note: In Tauri, file.path is available
        const path = (file as unknown as { path: string }).path
        if (path) {
          openPath(path)
          return
        }
      }
    }
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}
</script>

<style scoped>
.workspace-screen {
  width: 100%;
  height: 100%;
  background: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-card {
  width: 520px;
  background: var(--bg);
  border-radius: 14px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* Title bar */
.titlebar {
  height: var(--titlebar-height);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
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
  display: block;
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
.titlebar-title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--text-2);
}
.titlebar-spacer {
  width: 52px;
}

.content {
  padding: 36px 40px 40px;
}

/* Logo */
.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.logo-mark {
  width: 38px;
  height: 38px;
  background: var(--accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.4px;
}
.logo-tagline {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 2px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.4px;
  margin-bottom: 6px;
}
.subtitle {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.5;
  margin-bottom: 28px;
}

.section-label {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

/* Workspace list */
.ws-list {
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  margin-bottom: 16px;
}
.ws-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--border);
}
.ws-item:last-child {
  border-bottom: none;
}
.ws-item:hover {
  background: var(--hover);
}
.ws-icon {
  color: var(--text-3);
  flex-shrink: 0;
}
.ws-info {
  flex: 1;
  min-width: 0;
}
.ws-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-1);
}
.ws-path {
  font-size: 11.5px;
  color: var(--text-2);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ws-time {
  font-size: 11.5px;
  color: var(--text-3);
  flex-shrink: 0;
}
.ws-empty {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
  padding: 20px 0;
  margin-bottom: 16px;
}

/* Drop zone */
.drop-zone {
  border: 1px dashed var(--border);
  border-radius: var(--r);
  padding: 22px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 16px;
}
.drop-zone:hover,
.drop-zone.drop-active {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.drop-icon {
  margin: 0 auto 8px;
  color: var(--text-3);
  display: block;
}
.drop-text {
  font-size: 13px;
  color: var(--text-2);
}
.drop-hint {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 3px;
}

.btn {
  width: 100%;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  text-align: center;
  margin-top: 20px;
  font-size: 11.5px;
  color: var(--text-3);
}
</style>
