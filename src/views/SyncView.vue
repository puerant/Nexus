<template>
  <AppLayout title="同步配置" subtitle="选择工作区的同步方式">
    <template #topbar-actions>
      <button class="topbar-chip" type="button" @click="router.back()">返回</button>
    </template>

    <div class="sync-screen">
      <section class="sync-panel">
        <div class="hero-row">
          <div>
            <div class="eyebrow">Step 2</div>
            <h1>配置同步方式</h1>
            <p class="subtitle">选择如何同步你的工作区。你可以先不配置，稍后再在设置中补充。</p>
          </div>

          <div class="step-indicator" aria-label="步骤进度">
            <div class="step-dot done" />
            <div class="step-line done" />
            <div class="step-dot active" />
            <div class="step-line" />
            <div class="step-dot" />
          </div>
        </div>

        <div class="options-grid">
          <article class="option-card" :class="{ selected: syncType === 'github' }" @click="syncType = 'github'">
            <div class="option-head">
              <div class="option-badge">推荐</div>
              <div class="option-radio" />
            </div>
            <div class="option-body">
              <div class="option-icon github-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    stroke="currentColor"
                    stroke-width="0.6"
                  />
                </svg>
              </div>
              <div>
                <h2>连接 GitHub 仓库</h2>
                <p class="option-desc">把工作区配置同步到 GitHub，便于版本管理、团队协作和跨设备使用。</p>
              </div>
            </div>

            <div v-if="syncType === 'github'" class="github-form">
              <div>
                <label class="field-label">仓库地址</label>
                <div class="input-row">
                  <input
                    v-model="githubRepo"
                    class="field-input"
                    type="text"
                    placeholder="https://github.com/username/repo"
                  />
                  <button class="connect-btn" type="button" @click.stop="verifyRepo">验证</button>
                </div>
                <div class="field-hint">支持 HTTPS 或 SSH 格式。</div>
              </div>
              <div>
                <label class="field-label">Personal Access Token（可选）</label>
                <input
                  v-model="githubToken"
                  class="field-input"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <div class="field-hint">仅在访问私有仓库时需要，本地保存。</div>
              </div>
            </div>
          </article>

          <article class="option-card muted" :class="{ selected: syncType === 'none' }" @click="syncType = 'none'">
            <div class="option-head">
              <div class="option-badge neutral">稍后配置</div>
              <div class="option-radio" />
            </div>
            <div class="option-body">
              <div class="option-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1" />
                  <path d="M4.5 4.5L15.5 15.5" stroke="currentColor" stroke-width="1" />
                </svg>
              </div>
              <div>
                <h2>暂不同步</h2>
                <p class="option-desc">先在本地创建项目结构，之后可以再接入 GitHub 或其他同步方式。</p>
              </div>
            </div>
          </article>
        </div>

        <div class="actions">
          <button class="btn btn-ghost" type="button" @click="router.back()">返回上一步</button>
          <button class="btn btn-primary" type="button" :disabled="isLoading" @click="proceed">
            {{ isLoading ? '初始化中…' : '继续进入项目' }}
          </button>
        </div>
      </section>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <button class="toolbar-btn" type="button" @click="openPowerShell">PowerShell</button>
        <button class="toolbar-btn" type="button" @click="openWorkspaceFolder">打开工作区</button>
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
import AppLayout from '@/components/AppLayout.vue'
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

    const syncConfig =
      syncType.value === 'github'
        ? { type: 'github', repoUrl: githubRepo.value }
        : { type: 'none' }

    await writeProjectConfig(ws.path, {
      sync: syncConfig,
      updatedAt: new Date().toISOString(),
    } as Record<string, unknown>)

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
  padding: clamp(22px, 3vw, 32px);
}

.sync-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 100%;
}

.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
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

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(13, 17, 23, 0.12);
}

.step-dot.done,
.step-dot.active {
  background: var(--accent);
}

.step-dot.active {
  box-shadow: 0 0 0 6px rgba(0, 122, 255, 0.12);
}

.step-line {
  width: 32px;
  height: 1px;
  background: rgba(13, 17, 23, 0.12);
}

.step-line.done {
  background: var(--accent);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.option-card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease;
}

.option-card:hover,
.option-card.selected {
  transform: translateY(-2px);
  border-color: rgba(0, 122, 255, 0.22);
  box-shadow: 0 26px 60px rgba(0, 122, 255, 0.1);
}

.option-card.muted.selected {
  border-color: rgba(13, 17, 23, 0.14);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.option-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
}

.option-badge.neutral {
  background: rgba(13, 17, 23, 0.06);
  color: var(--text-2);
}

.option-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(13, 17, 23, 0.18);
  background: white;
  box-shadow: inset 0 0 0 4px white;
}

.option-card.selected .option-radio {
  border-color: var(--accent);
  background: var(--accent);
}

.option-body {
  display: flex;
  gap: 14px;
}

.option-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--text-2);
  background: rgba(13, 17, 23, 0.05);
}

.github-icon {
  color: var(--accent);
  background: rgba(0, 122, 255, 0.08);
}

h2 {
  font-size: 20px;
  line-height: 1.15;
  margin-bottom: 8px;
}

.option-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-2);
}

.github-form {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(13, 17, 23, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 7px;
  color: var(--text-1);
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(13, 17, 23, 0.12);
  border-radius: 12px;
  font-size: 13px;
  font-family: var(--font);
  background: white;
  outline: none;
  transition: border-color 0.14s ease;
}

.field-input:focus {
  border-color: rgba(0, 122, 255, 0.3);
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-3);
}

.input-row {
  display: flex;
  gap: 10px;
}

.input-row .field-input {
  flex: 1;
}

.connect-btn,
.topbar-chip,
.toolbar-btn {
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

.connect-btn {
  padding: 0 14px;
  font-size: 12px;
  white-space: nowrap;
}

.topbar-chip,
.toolbar-btn {
  padding: 8px 14px;
  font-size: 12px;
}

.connect-btn:hover,
.topbar-chip:hover,
.toolbar-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.22);
  background: var(--accent-bg);
}

.actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  .hero-row,
  .options-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}

@media (max-width: 720px) {
  .sync-screen {
    padding: 16px;
  }

  .option-card {
    padding: 16px;
    border-radius: 18px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
