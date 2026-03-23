<template>
  <section class="requirements-page">
    <div class="requirements-toolbar">
      <div class="toolbar-left">
        <UiStatusBadge :tone="isLocked ? 'success' : 'warning'">
          {{ isLocked ? '已锁定' : '编辑中' }}
        </UiStatusBadge>
        <span class="toolbar-hint">{{ prdPath }}</span>
      </div>
      <div class="toolbar-actions">
        <UiButton variant="secondary" size="sm" :disabled="isLocked || isSaving" @click="saveDraft">
          {{ isSaving ? '保存中...' : '保存草稿' }}
        </UiButton>
        <UiButton
          variant="primary"
          size="sm"
          :disabled="isLocked || !canLock || isLocking"
          @click="lockRequirements"
        >
          <template #icon>
            <UiIcon icon="lucide:lock" size="sm" />
          </template>
          {{ isLocking ? '锁定中...' : '锁定' }}
        </UiButton>
      </div>
    </div>

    <div class="requirements-grid">
      <RequirementsEditorPane
        v-model="editorContent"
        :locked="isLocked"
        :prd-path="prdPath"
        @insert-snippet="insertSnippet"
      />

      <RequirementsAssistantPane
        mode="askuserquestion"
        :mode-label="modeLabel"
        :draft="draftMessage"
        :drawer-open="drawerOpen"
        :generating="isGeneratingPrd"
        :locked="isLocked"
        :total-questions="questionFlow.length"
        :collected-count="completedAnswers"
        :coverage="coverageItems"
        :messages="messages"
        :quick-prompts="quickPrompts"
        @update:draft="draftMessage = $event"
        @toggle-drawer="drawerOpen = !drawerOpen"
        @generate-prd="generatePrd"
        @send="sendMessage"
        @use-prompt="applyPrompt"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import RequirementsAssistantPane from '@/views/Requirements/components/RequirementsAssistantPane.vue'
import RequirementsEditorPane from '@/views/Requirements/components/RequirementsEditorPane.vue'
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
const modeLabel = 'askUserQuestion'
const drawerOpen = ref(true)
const draftMessage = ref('')
const editorContent = ref('')
const messages = ref<ChatMessage[]>([])
const isGeneratingPrd = ref(false)
const isSaving = ref(false)
const isLocking = ref(false)
const lockedAt = ref('')
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
  {
    key: 'background',
    label: '业务背景',
    question:
      '请先介绍一下这个需求或产品为什么要做，目前遇到了什么问题，希望带来什么变化？',
  },
  {
    key: 'goals',
    label: '核心目标',
    question:
      '这个阶段最想达成的结果是什么？有哪些关键指标、业务价值或用户收益需要被验证？',
  },
  {
    key: 'users',
    label: '目标用户',
    question:
      '这个产品或功能主要给谁使用？他们的角色、使用频率、核心痛点分别是什么？',
  },
  {
    key: 'scenarios',
    label: '核心场景',
    question:
      '请列出 1 到 3 个最重要的使用场景，说明用户会在什么情况下使用它，以及希望完成什么任务？',
  },
  {
    key: 'features',
    label: '功能范围',
    question:
      '请整理这次交付需要覆盖的核心功能，哪些必须优先上线，哪些可以延后处理？',
  },
  {
    key: 'constraints',
    label: '约束条件',
    question:
      '是否存在时间、预算、技术依赖、设备环境或资源方面的限制，需要在需求阶段提前说明？',
  },
  {
    key: 'acceptance',
    label: '验收标准',
    question:
      '你会如何判断这个需求已经满足预期？请列出可验证、可检查的验收标准。',
  },
]

const quickPrompts = [
  '帮我梳理这个需求要解决的核心业务问题',
  '给我一份适合继续追问的用户场景清单',
  '有哪些容易遗漏但需要提前确认的限制条件',
]

const completedAnswers = computed(
  () => questionFlow.filter((item) => requirementForm[item.key].trim().length > 0).length,
)

const coverageItems = computed(() =>
  questionFlow.map((item) => ({
    label: item.label,
    done: requirementForm[item.key].trim().length > 0,
  })),
)

const canLock = computed(() => editorContent.value.trim().length > 0)

onMounted(async () => {
  bootstrapMessages()
  await loadExistingState()
})

function bootstrapMessages() {
  if (messages.value.length > 0) return
  pushAssistant(
    '已进入需求分析终端。默认模式为 askUserQuestion，我会逐轮追问并帮助你整理 PRD。',
  )
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
      lockedAt.value = phase.lockedAt ?? ''
    }
  } catch (error) {
    console.error('Failed to load requirements state:', error)
  }
}

function pushAssistant(content: string) {
  messages.value.push({ id: ++messageId, role: 'assistant', content })
}

function pushUser(content: string) {
  messages.value.push({ id: ++messageId, role: 'user', content })
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
    pushAssistant(`收到，我先把这部分归档到「${mappedLabel()}」。接下来请继续回答：${next.question}`)
    return
  }

  pushAssistant(
    '关键信息已经整理得差不多了。你可以现在生成 PRD.md，也可以继续补充 Markdown 细节后再保存。',
  )
}

function captureAnswer(content: string) {
  const next = currentQuestion()
  if (!next) return
  requirementForm[next.key] = content
}

function mappedLabel(): string {
  const answered = questionFlow.filter((item) => requirementForm[item.key].trim())
  return answered.at(-1)?.label ?? '当前问题'
}

function applyPrompt(prompt: string) {
  if (isLocked.value) return
  draftMessage.value = prompt
}

function insertSnippet(snippet: string) {
  if (isLocked.value) return
  editorContent.value = `${editorContent.value.trimEnd()}${editorContent.value ? '\n\n' : ''}${snippet}`
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
    '',
    '## 8. 协作记录',
    `- 当前模式：${modeLabel}`,
    `- 最近更新时间：${formatDateTime(new Date().toISOString())}`,
  ].join('\n')
}

function splitBullets(value: string) {
  return value
    .split(/\n|；|;/)
    .map((item) => item.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)
}

function bulletize(value: string) {
  const items = splitBullets(value)
  return bulletizeArray(items)
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
    const content = editorContent.value.trim() ? editorContent.value : buildPrdMarkdown()
    editorContent.value = content
    await writeFile(workspacePath, prdPath, content)
    await persistProjectConfig('in_progress')
  } catch (error) {
    console.error('Failed to save PRD draft:', error)
    alert(`保存草稿失败：${error}`)
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
    pushAssistant('PRD.md 已生成并写入工作区。你可以继续微调内容，确认无误后再锁定需求。')
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
    lockedAt.value = new Date().toISOString()
    isLocked.value = true
    projectStore.setActivePhase('prototype')
    await router.push({ name: 'prototype', params: { id: route.params.id as string } })
  } catch (error) {
    console.error('Failed to lock requirements:', error)
    alert(`锁定需求失败：${error}`)
  } finally {
    isLocking.value = false
  }
}

function formatDateTime(value?: string) {
  if (!value) return '暂未锁定'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style scoped>
.requirements-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.requirements-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.25rem;
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
  gap: 0.5rem;
}

.requirements-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(20rem, 0.8fr);
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

@media (max-width: 1080px) {
  .requirements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
