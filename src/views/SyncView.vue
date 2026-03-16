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
        <button class="titlebar-back" @click="router.back()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="#007AFF" stroke-width="1" />
          </svg>
          返回
        </button>
        <span class="titlebar-title">配置同步</span>
        <span class="titlebar-spacer" />
      </div>

      <div class="content">
        <!-- Step indicator -->
        <div class="step-indicator">
          <div class="step-dot done" />
          <div class="step-line done" />
          <div class="step-dot active" />
          <div class="step-line" />
          <div class="step-dot" />
        </div>

        <h2>配置同步方式</h2>
        <p class="subtitle">选择如何同步你的工作区。可以随时在设置中更改。</p>

        <div class="options">
          <!-- GitHub option -->
          <div
            class="option-card"
            :class="{ selected: syncType === 'github' }"
            @click="syncType = 'github'"
          >
            <div class="option-radio" />
            <div class="option-head">
              <div class="option-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    stroke="#6E7781"
                    stroke-width="0.5"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <div class="option-label">连接 GitHub 仓库</div>
                <div class="option-desc">将文档同步到 GitHub，支持版本控制和团队协作</div>
              </div>
            </div>

            <!-- GitHub form -->
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
                  <button class="connect-btn" @click.stop="verifyRepo">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M9 1H12V4M12 1L7 6M2 3H4.5V10.5H12" stroke="#6E7781" stroke-width="1" />
                    </svg>
                    验证
                  </button>
                </div>
                <div class="field-hint">支持 HTTPS 或 SSH 格式</div>
              </div>
              <div>
                <label class="field-label">Personal Access Token（可选）</label>
                <input
                  v-model="githubToken"
                  class="field-input"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <div class="field-hint">用于私有仓库访问。令牌仅存储在本地。</div>
              </div>
            </div>
          </div>

          <!-- No sync option -->
          <div
            class="option-card"
            :class="{ selected: syncType === 'none' }"
            @click="syncType = 'none'"
          >
            <div class="option-radio" />
            <div class="option-head">
              <div class="option-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="#6E7781" stroke-width="1" />
                  <path d="M4.5 4.5L15.5 15.5" stroke="#6E7781" stroke-width="1" />
                </svg>
              </div>
              <div>
                <div class="option-label">暂不同步</div>
                <div class="option-desc">
                  仅保存在本地文件夹，不连接任何远程仓库，可以随时在设置中开启
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" @click="router.back()">返回</button>
          <button class="btn btn-primary" :disabled="isLoading" @click="proceed">
            {{ isLoading ? '初始化中...' : '进入工作区' }}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="white" stroke-width="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
  // TODO: Implement GitHub repo verification in M7
  alert('仓库验证功能将在后续版本中实现')
}

async function proceed() {
  const ws = workspaceStore.currentWorkspace
  if (!ws) {
    router.push({ name: 'workspace' })
    return
  }

  isLoading.value = true
  try {
    // Initialize .ai-workflow/ structure
    await initProjectStructure(ws.path, ws.name)

    // Update project config with sync settings
    const syncConfig =
      syncType.value === 'github'
        ? { type: 'github', repoUrl: githubRepo.value }
        : { type: 'none' }

    await writeProjectConfig(ws.path, {
      sync: syncConfig,
      updatedAt: new Date().toISOString(),
    } as Record<string, unknown>)

    // Set up project store - create minimal project object
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
  width: 560px;
  background: var(--bg);
  border-radius: 14px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

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
.titlebar-back {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 8px;
  margin-left: 8px;
  font-family: var(--font);
}
.titlebar-title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--text-2);
}
.titlebar-spacer {
  width: 80px;
}

.content {
  padding: 36px 40px 40px;
}

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
}
.step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border);
  flex-shrink: 0;
}
.step-dot.done,
.step-dot.active {
  background: var(--accent);
}
.step-dot.active {
  width: 18px;
  border-radius: 3px;
}
.step-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}
.step-line.done {
  background: rgba(0, 122, 255, 0.3);
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

/* Options */
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.option-card {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.option-card:hover {
  border-color: #c0d8f5;
  background: #fafcff;
}
.option-card.selected {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.option-radio {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 16px;
  height: 16px;
  border: 1px solid var(--border);
  border-radius: 50%;
}
.option-card.selected .option-radio {
  border-color: var(--accent);
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.option-card.selected .option-radio::after {
  content: '';
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}
.option-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.option-icon {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
}
.option-card.selected .option-icon {
  border-color: #c0d8f5;
  background: #dff0ff;
}
.option-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}
.option-desc {
  font-size: 12.5px;
  color: var(--text-2);
  margin-top: 3px;
  line-height: 1.5;
}

/* GitHub form */
.github-form {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #d0e8ff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 6px;
  display: block;
}
.field-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  font-size: 13px;
  font-family: var(--font);
  color: var(--text-1);
  background: white;
  outline: none;
  transition: border-color 0.1s;
}
.field-input:focus {
  border-color: var(--accent);
}
.field-input::placeholder {
  color: var(--text-3);
}
.field-hint {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 5px;
}
.input-row {
  display: flex;
  gap: 8px;
}
.input-row .field-input {
  flex: 1;
}
.connect-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  font-size: 13px;
  font-family: var(--font);
  background: white;
  cursor: pointer;
  white-space: nowrap;
  color: var(--text-1);
  transition: all 0.1s;
}
.connect-btn:hover {
  background: var(--hover);
  border-color: #c0d8f5;
}

/* Buttons */
.btn-row {
  display: flex;
  gap: 10px;
}
.btn-row .btn-ghost {
  flex: 0 0 auto;
  padding: 10px 18px;
}
.btn-row .btn-primary {
  flex: 1;
  padding: 10px 20px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
