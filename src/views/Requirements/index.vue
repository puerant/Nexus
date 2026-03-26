<template>
  <section class="requirements-page">
    <!-- 工具栏 -->
    <div class="requirements-toolbar">
      <div class="toolbar-left">
        <UiStatusBadge :tone="isLocked ? 'success' : 'warning'">
          {{ isLocked ? '已锁定' : '编辑中' }}
        </UiStatusBadge>
        <span class="toolbar-hint">{{ prdPath }}</span>
      </div>
      <div class="toolbar-actions">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: drawerOpen }"
          :disabled="isLocked"
          @click="drawerOpen = !drawerOpen"
        >
          <UiIcon icon="lucide:sparkles" size="sm" />
          <span>AI 助手</span>
          <span v-if="!isLocked && completedAnswers < questionFlow.length" class="btn-badge">
            {{ questionFlow.length - completedAnswers }}
          </span>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :disabled="isLocked || isSaving"
          @click="saveDraft"
        >
          <UiIcon :icon="isSaving ? 'lucide:loader-2' : 'lucide:save'" size="sm" :class="{ 'is-spinning': isSaving }" />
          <span>{{ isSaving ? '保存中' : '保存' }}</span>
        </button>
        <button
          type="button"
          class="toolbar-btn toolbar-btn--primary"
          :disabled="isLocked || !canLock || isLocking"
          @click="lockRequirements"
        >
          <UiIcon :icon="isLocking ? 'lucide:loader-2' : 'lucide:lock'" size="sm" :class="{ 'is-spinning': isLocking }" />
          <span>{{ isLocking ? '锁定中' : '锁定' }}</span>
        </button>
      </div>
    </div>

    <!-- 主编辑区 -->
    <div class="editor-main">
      <UiMarkdownEditor
        v-model="editorContent"
        :readonly="isLocked"
        :placeholder="editorPlaceholder"
        height="100%"
      />
    </div>

    <!-- 右侧抽屉 -->
    <Transition name="drawer">
      <aside v-if="drawerOpen" class="ai-drawer">
        <header class="drawer-header">
          <div class="drawer-title">
            <UiIcon icon="lucide:sparkles" size="sm" />
            <span>AI 需求助手</span>
          </div>
          <button class="drawer-close" type="button" @click="drawerOpen = false">
            <UiIcon icon="lucide:x" size="sm" />
          </button>
        </header>

        <!-- 进度指示 -->
        <div class="drawer-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(completedAnswers / questionFlow.length) * 100}%` }" />
          </div>
          <span class="progress-text">{{ completedAnswers }}/{{ questionFlow.length }} 已完成</span>
        </div>

        <!-- 对话区域 -->
        <div class="drawer-messages" ref="messagesRef">
          <article
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <UiIcon :icon="message.role === 'assistant' ? 'lucide:bot' : 'lucide:user'" size="sm" />
            </div>
            <div class="message-content">{{ message.content }}</div>
          </article>
        </div>

        <!-- 快捷提示 -->
        <div v-if="!isLocked" class="drawer-quick">
          <button
            v-for="prompt in quickPrompts.slice(0, 2)"
            :key="prompt"
            class="quick-btn"
            type="button"
            @click="applyPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- 输入区 -->
        <div class="drawer-input">
          <textarea
            v-model="draftMessage"
            class="input-area"
            rows="2"
            :readonly="isLocked"
            placeholder="回复 AI 的问题..."
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="input-actions">
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="isLocked || isGeneratingPrd"
              @click="generatePrd"
            >
              生成 PRD
            </UiButton>
            <UiButton
              variant="primary"
              size="sm"
              :disabled="isLocked || !draftMessage.trim()"
              @click="sendMessage"
            >
              发送
            </UiButton>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false" />
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import { UiMarkdownEditor } from '@/components/ui/MarkdownEditor'
import { readFile, readProjectConfig, writeFile, writeProjectConfig } from '@/api/workspace'
import { useProjectStore, type ProjectConfig } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'

interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
}

interface QuestionItem {
  key: keyof typeof requirementForm
  label: string
  question: string
}

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const prdPath = '.ai-workflow/requirements/PRD.md'
const editorPlaceholder = `# PRD

在这里整理需求文档...

## 项目背景

## 目标用户

## 核心功能

## 验收标准
`

const drawerOpen = ref(false)
const draftMessage = ref('')
const editorContent = ref('')
const messages = ref<ChatMessage[]>([])
const messagesRef = ref<HTMLElement | null>(null)
const isGeneratingPrd = ref(false)
const isSaving = ref(false)
const isLocking = ref(false)
const isLocked = ref(false)
let messageId = 0

const requirementForm = reactive({
  background: '',
  goals: '',
  users: '',
  scenarios: '',
  features: '',
  constraints: '',
  acceptance: '',
})

const questionFlow: QuestionItem[] = [
  { key: 'background', label: '业务背景', question: '请介绍一下这个需求的背景，目前遇到了什么问题？' },
  { key: 'goals', label: '核心目标', question: '这个阶段最想达成的结果是什么？' },
  { key: 'users', label: '目标用户', question: '这个产品主要给谁使用？他们的核心痛点是什么？' },
  { key: 'scenarios', label: '核心场景', question: '请列出最重要的使用场景。' },
  { key: 'features', label: '功能范围', question: '这次交付需要覆盖哪些核心功能？' },
  { key: 'constraints', label: '约束条件', question: '是否有时间、技术或资源方面的限制？' },
  { key: 'acceptance', label: '验收标准', question: '如何判断需求已满足预期？' },
]

const quickPrompts = [
  '帮我梳理核心业务问题',
  '列出需要确认的限制条件',
  '生成 PRD.md',
]

const completedAnswers = computed(
  () => questionFlow.filter((item) => requirementForm[item.key].trim().length > 0).length,
)

const canLock = computed(() => editorContent.value.trim().length > 0)

onMounted(async () => {
  bootstrapMessages()
  await loadExistingState()
})

function bootstrapMessages() {
  if (messages.value.length > 0) return
  pushAssistant('你好！我会帮你整理需求文档。')
  pushAssistant(questionFlow[0].question)
}

async function loadExistingState() {
  const workspacePath =
    workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath
  if (!workspacePath) return

  try {
    const [config, prd] = await Promise.all([
      readProjectConfig(workspacePath),
      readFile(workspacePath, prdPath).catch(() => ''),
    ])

    if (typeof prd === 'string' && prd.trim()) {
      editorContent.value = prd
    }

    const phase = (
      config?.phases as Record<string, { status?: string; lockedAt?: string }> | undefined
    )?.requirements
    if (phase?.status === 'locked') {
      isLocked.value = true
    }
  } catch (error) {
    console.error('Failed to load requirements state:', error)
  }
}

function pushAssistant(content: string) {
  messages.value.push({ id: ++messageId, role: 'assistant', content })
  scrollToBottom()
}

function pushUser(content: string) {
  messages.value.push({ id: ++messageId, role: 'user', content })
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function currentQuestion(): QuestionItem | undefined {
  return questionFlow.find((item) => !requirementForm[item.key].trim())
}

function sendMessage() {
  const content = draftMessage.value.trim()
  if (!content || isLocked.value) return

  pushUser(content)
  captureAnswer(content)
  draftMessage.value = ''

  const next = currentQuestion()
  if (next) {
    const answered = questionFlow.filter((item) => requirementForm[item.key].trim())
    const lastLabel = answered[answered.length - 1]?.label ?? '当前问题'
    pushAssistant(`收到，已记录「${lastLabel}」。接下来：${next.question}`)
    return
  }

  pushAssistant('信息收集完成！你可以点击「生成 PRD」或直接在编辑器中完善内容。')
}

function captureAnswer(content: string) {
  const next = currentQuestion()
  if (!next) return
  requirementForm[next.key] = content
}

function applyPrompt(prompt: string) {
  if (isLocked.value) return
  draftMessage.value = prompt
}

function buildPrdMarkdown() {
  const mustHave = splitBullets(requirementForm.features).slice(0, 3)
  const stretch = splitBullets(requirementForm.features).slice(3)
  const acceptanceItems = splitBullets(requirementForm.acceptance)

  return [
    '# PRD',
    '',
    '## 1. 项目背景',
    requirementForm.background || '待补充',
    '',
    '## 2. 目标与成功标准',
    requirementForm.goals || '待补充',
    '',
    '## 3. 目标用户',
    bulletize(requirementForm.users),
    '',
    '## 4. 核心场景',
    bulletize(requirementForm.scenarios),
    '',
    '## 5. 功能范围',
    '### Must Have',
    bulletizeArray(mustHave),
    '',
    '### Nice to Have',
    bulletizeArray(stretch),
    '',
    '## 6. 约束条件',
    bulletize(requirementForm.constraints),
    '',
    '## 7. 验收标准',
    checklistize(acceptanceItems),
  ].join('\n')
}

function splitBullets(value: string) {
  return value
    .split(/\n|；|;/)
    .map((item) => item.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)
}

function bulletize(value: string) {
  return bulletizeArray(splitBullets(value))
}

function bulletizeArray(items: string[]) {
  if (!items.length) return '- 待补充'
  return items.map((item) => `- ${item}`).join('\n')
}

function checklistize(items: string[]) {
  if (!items.length) return '- [ ] 待补充'
  return items.map((item) => `- [ ] ${item}`).join('\n')
}

async function persistProjectConfig(status: 'in_progress' | 'locked') {
  const workspacePath =
    workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath
  if (!workspacePath) return

  const existing = await readProjectConfig(workspacePath)
  const project = {
    ...(existing ?? (projectStore.currentProject as unknown as Record<string, unknown>) ?? {}),
  } as Record<string, any>

  project.updatedAt = new Date().toISOString()
  project.phases = {
    ...(project.phases ?? {}),
    requirements: {
      ...(project.phases?.requirements ?? {}),
      status,
      model: project.phases?.requirements?.model ?? project.defaultModel ?? 'claude-sonnet-4-6',
      ...(status === 'locked' ? { lockedAt: new Date().toISOString() } : {}),
    },
  }

  await writeProjectConfig(workspacePath, project)

  const currentProject = (projectStore.currentProject ?? project) as ProjectConfig
  projectStore.setCurrentProject({
    ...currentProject,
    ...project,
    phases: {
      ...currentProject.phases,
      ...project.phases,
    },
  })
}

async function saveDraft() {
  const workspacePath =
    workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath
  if (!workspacePath || isLocked.value) return

  isSaving.value = true
  try {
    await writeFile(workspacePath, prdPath, editorContent.value)
    await persistProjectConfig('in_progress')
  } catch (error) {
    console.error('Failed to save PRD draft:', error)
    alert(`保存失败：${error}`)
  } finally {
    isSaving.value = false
  }
}

async function generatePrd() {
  if (isLocked.value) return

  isGeneratingPrd.value = true
  try {
    editorContent.value = buildPrdMarkdown()
    await saveDraft()
    pushAssistant('PRD.md 已生成！你可以在左侧编辑器中查看和修改。')
  } finally {
    isGeneratingPrd.value = false
  }
}

async function lockRequirements() {
  const workspacePath =
    workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath
  if (!workspacePath || isLocked.value || !canLock.value) return

  isLocking.value = true
  try {
    await writeFile(workspacePath, prdPath, editorContent.value)
    await persistProjectConfig('locked')
    isLocked.value = true
    projectStore.setActivePhase('prototype')
    await router.push({ name: 'prototype', params: { id: route.params.id as string } })
  } catch (error) {
    console.error('Failed to lock requirements:', error)
    alert(`锁定失败：${error}`)
  } finally {
    isLocking.value = false
  }
}
</script>

<style scoped>
.requirements-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

/* 工具栏 */
.requirements-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-soft);
  background: var(--color-surface);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* 统一工具栏按钮样式 */
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 6%, var(--color-surface));
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 10%, var(--color-surface));
}

/* 主操作按钮 - 锁定 */
.toolbar-btn--primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.toolbar-btn--primary:hover:not(:disabled) {
  background: color-mix(in oklab, var(--color-accent) 85%, black);
  border-color: color-mix(in oklab, var(--color-accent) 85%, black);
  color: white;
}

.toolbar-btn--primary:disabled {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

/* 按钮内的加载动画 */
.toolbar-btn .is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 主编辑区 */
.editor-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-main :deep(.ui-markdown-editor) {
  border-radius: 0;
  height: 100%;
}

.editor-main :deep(.md-editor) {
  border-radius: 0;
  border: none;
}

/* 按钮徽章 */
.btn-badge {
  min-width: 1.125rem;
  height: 1.125rem;
  border-radius: 0.5rem;
  background: var(--color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  margin-left: 0.125rem;
}

/* 右侧抽屉 */
.ai-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 24rem;
  height: 100%;
  background: var(--color-surface-raised);
  border-left: 1px solid var(--color-border-soft);
  display: flex;
  flex-direction: column;
  z-index: 200;
  box-shadow: var(--shadow-xl);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-accent);
}

.drawer-close {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.drawer-close:hover {
  background: var(--color-surface-soft);
}

/* 进度条 */
.drawer-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 0.375rem;
  border-radius: 1rem;
  background: var(--color-surface-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 1rem;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

/* 消息区域 */
.drawer-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.assistant .message-avatar {
  background: color-mix(in oklab, var(--color-accent) 15%, white);
  color: var(--color-accent);
}

.message.user .message-avatar {
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
}

.message-content {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  padding-top: 0.125rem;
}

/* 快捷提示 */
.drawer-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.quick-btn {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* 输入区 */
.drawer-input {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.input-area {
  width: 100%;
  min-height: 3.5rem;
  resize: none;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s;
}

.input-area:focus {
  border-color: var(--color-accent);
}

.input-area::placeholder {
  color: var(--color-text-tertiary);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

/* 遮罩层 */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, black 40%, transparent);
  z-index: 150;
}

/* 动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .ai-drawer {
    width: 100%;
  }
}
</style>
