<template>
  <AppLayout title="同步配置" subtitle="选择工作区的同步方式">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" @click="router.back()">返回</UiButton>
    </template>

    <div class="sync-screen">
      <div class="sync-stack">
        <UiPageIntro
          eyebrow="Step 2"
          title="配置同步方式"
          description="选择如何同步你的工作区。你可以先不配置，稍后再在设置中补充。"
        >
          <template #aside>
            <UiSurface class="step-panel" padding="md">
              <div class="step-indicator" aria-label="步骤进度">
                <div class="step-dot done" />
                <div class="step-line done" />
                <div class="step-dot active" />
                <div class="step-line" />
                <div class="step-dot" />
              </div>
            </UiSurface>
          </template>
        </UiPageIntro>

        <div class="options-grid">
          <UiSurface class="option-card" :class="{ selected: syncType === 'github' }">
            <button class="option-hit" type="button" @click="syncType = 'github'">
              <div class="option-head">
                <UiStatusBadge tone="info">推荐</UiStatusBadge>
                <div class="option-radio" />
              </div>
              <div class="option-body">
                <UiIcon class="option-icon" icon="mdi:github" size="lg" />
                <div>
                  <h2>连接 GitHub 仓库</h2>
                  <p class="option-desc">把工作区配置同步到 GitHub，便于版本管理、团队协作和跨设备使用。</p>
                </div>
              </div>
            </button>

            <div v-if="syncType === 'github'" class="github-form">
              <div>
                <label class="field-label">仓库地址</label>
                <div class="input-row">
                  <input v-model="githubRepo" class="field-input" type="text" placeholder="https://github.com/username/repo" />
                  <UiButton size="sm" @click.stop="verifyRepo">验证</UiButton>
                </div>
                <div class="field-hint">支持 HTTPS 或 SSH 格式。</div>
              </div>
              <div>
                <label class="field-label">Personal Access Token（可选）</label>
                <input v-model="githubToken" class="field-input" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                <div class="field-hint">仅在访问私有仓库时需要，本地保存。</div>
              </div>
            </div>
          </UiSurface>

          <UiSurface class="option-card" :class="{ selected: syncType === 'none' }" tone="muted">
            <button class="option-hit" type="button" @click="syncType = 'none'">
              <div class="option-head">
                <UiStatusBadge>稍后配置</UiStatusBadge>
                <div class="option-radio" />
              </div>
              <div class="option-body">
                <UiIcon class="option-icon" icon="lucide:folder-x" size="lg" />
                <div>
                  <h2>暂不同步</h2>
                  <p class="option-desc">先在本地创建项目结构，之后可以再接入 GitHub 或其他同步方式。</p>
                </div>
              </div>
            </button>
          </UiSurface>
        </div>

        <div class="actions">
          <UiButton variant="secondary" @click="router.back()">返回上一步</UiButton>
          <UiButton variant="primary" :disabled="isLoading" @click="proceed">{{ isLoading ? '初始化中…' : '继续进入项目' }}</UiButton>
        </div>
      </div>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <UiButton variant="ghost" size="sm" @click="openPowerShell">PowerShell</UiButton>
        <UiButton variant="ghost" size="sm" @click="openWorkspaceFolder">打开工作区</UiButton>
      </div>
      <div class="toolbar-group toolbar-meta">
        <span class="toolbar-hint">同步准备阶段</span>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-shell'
import AppLayout from '@/components/Layout/components/AppLayout.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiPageIntro from '@/components/ui/UiPageIntro.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { initProjectStructure, writeProjectConfig } from '@/api/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()

const syncType = ref<'github' | 'none'>('none')
const githubRepo = ref('')
const githubToken = ref('')
const isLoading = ref(false)

function verifyRepo() {
  alert('仓库验证功能将在后续版本提供。')
}

async function proceed() {
  const ws = workspaceStore.currentWorkspace
  if (!ws) {
    await router.push({ name: 'workspace' })
    return
  }
  isLoading.value = true
  try {
    await initProjectStructure(ws.path, ws.name)
    const syncConfig = syncType.value === 'github' ? { type: 'github', repoUrl: githubRepo.value } : { type: 'none' }
    await writeProjectConfig(ws.path, { sync: syncConfig, updatedAt: new Date().toISOString() } as Record<string, unknown>)
    projectStore.setCurrentProject({
      id: ws.path,
      name: ws.name,
      description: '',
      workspacePath: ws.path,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defaultModel: 'claude-sonnet-4-6',
      phases: {
        requirements: { status: 'not_started' },
        prototype: { status: 'not_started' },
        tech: { status: 'not_started' },
        tasks: { status: 'not_started' },
        retrospective: { status: 'not_started' },
      },
      sync: syncConfig as { type: 'github' | 'none'; repoUrl?: string },
    })
    await router.push({ name: 'project-overview', params: { id: encodeURIComponent(ws.path) } })
  } catch (e) {
    console.error('Failed to initialize workspace:', e)
    alert(`初始化失败: ${e}`)
  } finally {
    isLoading.value = false
  }
}

async function openPowerShell() {
  await open('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe')
}

async function openWorkspaceFolder() {
  const path = workspaceStore.currentWorkspace?.path ?? 'C:/'
  await open(path, 'explorer.exe')
}
</script>

<style scoped>
.sync-screen {
  min-height: 100%;
  padding: clamp(1.25rem, 2.8vw, 2rem);
}

.sync-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.step-panel {
  min-width: 10rem;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: color-mix(in oklab, var(--color-text-tertiary) 35%, white 65%);
}

.step-dot.done,
.step-dot.active { background: var(--color-accent); }
.step-dot.active { box-shadow: 0 0 0 0.35rem color-mix(in oklab, var(--color-accent) 18%, transparent); }
.step-line { width: 2rem; height: 1px; background: var(--color-border-soft); }
.step-line.done { background: var(--color-accent); }

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.125rem;
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-card.selected {
  border-color: color-mix(in oklab, var(--color-accent) 25%, white 75%);
  box-shadow: var(--shadow-accent);
}

.option-hit {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
}

.option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.option-radio {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-border-strong);
  background: var(--color-surface-raised);
  box-shadow: inset 0 0 0 4px var(--color-surface-raised);
}

.option-card.selected .option-radio {
  border-color: var(--color-accent);
  background: var(--color-accent);
}

.option-body {
  display: flex;
  gap: 0.9rem;
}

.option-icon {
  color: var(--color-accent);
}

.option-body h2 {
  font-size: var(--type-heading-md);
  margin-bottom: 0.45rem;
}

.option-desc {
  font-size: var(--type-body-sm);
  line-height: 1.6;
}

.github-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-soft);
}

.field-label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.input-row {
  display: flex;
  gap: 0.65rem;
}

.field-input {
  flex: 1;
  min-height: 2.35rem;
  padding: 0 0.85rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  outline: none;
}

.field-input:focus {
  border-color: color-mix(in oklab, var(--color-accent) 28%, white 72%);
}

.field-hint,
.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.actions,
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.actions {
  justify-content: flex-end;
}

.toolbar-meta {
  color: var(--color-text-secondary);
}

@media (max-width: 960px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .sync-screen {
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
