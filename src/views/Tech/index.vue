<template>
  <section class="tech-page">
    <!-- 工具栏（welcome 之外始终显示）-->
    <div v-if="pageView !== 'welcome'" class="tech-toolbar">
      <div class="toolbar-left">
        <UiStatusBadge :tone="isLocked ? 'success' : pageView === 'guided' ? 'info' : 'warning'">
          {{ isLocked ? '已锁定' : pageView === 'guided' ? '引导中' : '编辑中' }}
        </UiStatusBadge>
        <span class="toolbar-hint">{{ DOC_PATH }}</span>
      </div>
      <div class="toolbar-actions">
        <button
          v-if="pageView === 'guided'"
          type="button"
          class="toolbar-btn"
          @click="goToWelcome"
        >
          <UiIcon icon="lucide:arrow-left" size="sm" />
          <span>返回</span>
        </button>
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
          @click="lockDocument"
        >
          <UiIcon :icon="isLocking ? 'lucide:loader-2' : 'lucide:lock'" size="sm" :class="{ 'is-spinning': isLocking }" />
          <span>{{ isLocking ? '锁定中' : '锁定' }}</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="tech-main">
      <!-- Welcome: 3个入口选项卡片 -->
      <div v-if="pageView === 'welcome'" class="welcome-section">
        <div class="welcome-header">
          <div class="welcome-icon">
            <UiIcon icon="lucide:layers" size="lg" />
          </div>
          <h2 class="welcome-title">技术选型</h2>
          <p class="welcome-desc">
            选择前端和后端技术栈，确定项目的技术方案。
          </p>
        </div>
        <div class="welcome-options">
          <button class="option-card" type="button" @click="showTemplateBrowser = true">
            <div class="option-card__icon">
              <UiIcon icon="lucide:copy" size="lg" />
            </div>
            <div class="option-card__body">
              <h3>从模板创建</h3>
              <p>浏览工作区中其他项目的技术选型文档</p>
            </div>
            <UiIcon icon="lucide:chevron-right" size="sm" class="option-card__arrow" />
          </button>

          <button class="option-card" type="button" @click="startGuidedFlow">
            <div class="option-card__icon option-card__icon--accent">
              <UiIcon icon="lucide:plus" size="lg" />
            </div>
            <div class="option-card__body">
              <h3>新建文档</h3>
              <p>通过分步引导选择前端和后端技术栈</p>
            </div>
            <UiIcon icon="lucide:chevron-right" size="sm" class="option-card__arrow" />
          </button>

          <button class="option-card" type="button" @click="startAiFlow">
            <div class="option-card__icon option-card__icon--ai">
              <UiIcon icon="lucide:sparkles" size="lg" />
            </div>
            <div class="option-card__body">
              <h3>AI 协作</h3>
              <p>AI 通过问答帮你做出技术决策</p>
            </div>
            <UiIcon icon="lucide:chevron-right" size="sm" class="option-card__arrow" />
          </button>
        </div>
      </div>

      <!-- Guided: 4步向导 -->
      <div v-else-if="pageView === 'guided'" class="guided-section">
        <!-- 阶段进度 -->
        <div class="guided-phases">
          <button
            v-for="(phase, idx) in guidedPhases"
            :key="phase.key"
            class="phase-step"
            :class="{
              'phase-step--active': guidedStepIndex >= idx * stepGroupSize,
              'phase-step--current': getCurrentPhaseIndex() === idx,
            }"
            type="button"
            @click="jumpToPhase(idx)"
          >
            <span class="phase-step__dot" />
            <span class="phase-step__label">{{ phase.label }}</span>
          </button>
        </div>

        <!-- 步骤标题 -->
        <div class="guided-step-header">
          <h2>{{ currentStep.title }}</h2>
          <p>{{ currentStep.subtitle }}</p>
        </div>

        <!-- 步骤内容 -->
        <div v-if="currentStep.key !== 'overview'" class="guided-step-content">
          <div v-for="cat in currentStep.categories" :key="cat.key" class="category-block">
            <div class="category-header">
              <UiIcon :icon="cat.icon" size="sm" />
              <span class="category-label">{{ cat.label }}</span>
              <span v-if="cat.allowMultiple" class="category-hint">可多选</span>
            </div>
            <div class="tech-grid">
              <button
                v-for="opt in cat.options"
                :key="opt.id"
                class="tech-card"
                :class="{ 'tech-card--selected': techSelections[cat.key]?.includes(opt.id) }"
                type="button"
                @click="toggleOption(cat.key, opt.id, cat.allowMultiple)"
              >
                <span v-if="opt.recommended" class="tech-card__badge">推荐</span>
                <span class="tech-card__name">{{ opt.name }}</span>
                <span class="tech-card__desc">{{ opt.description }}</span>
                <UiIcon
                  v-if="techSelections[cat.key]?.includes(opt.id)"
                  icon="lucide:check-circle"
                  size="sm"
                  class="tech-card__check"
                />
              </button>
              <!-- 自定义输入 -->
              <div v-if="cat.allowCustom" class="tech-card tech-card--custom">
                <input
                  class="custom-input"
                  placeholder="自定义..."
                  @keydown.enter.prevent="addCustomOption(cat.key, ($event.target as HTMLInputElement).value, cat.allowMultiple)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 汇总预览 -->
        <div v-else class="guided-overview">
          <UiMarkdownEditor
            :model-value="overviewMarkdown"
            :preview-only="true"
            height="auto"
          />
        </div>

        <!-- 导航按钮 -->
        <div class="guided-nav">
          <UiButton
            variant="ghost"
            :disabled="guidedStepIndex === 0"
            @click="prevStep"
          >
            <template #icon><UiIcon icon="lucide:arrow-left" size="sm" /></template>
            上一步
          </UiButton>
          <UiButton
            variant="primary"
            @click="nextOrComplete"
          >
            {{ isLastStep ? '生成文档' : '下一步' }}
            <template v-if="!isLastStep" #icon><UiIcon icon="lucide:arrow-right" size="sm" /></template>
          </UiButton>
        </div>
      </div>

      <!-- Editor / Locked -->
      <div v-else class="editor-main">
        <UiMarkdownEditor
          v-model="editorContent"
          :readonly="isLocked"
          :preview-only="isLocked"
          :placeholder="editorPlaceholder"
          height="100%"
        />
      </div>
    </div>

    <!-- AI 抽屉 -->
    <Transition name="drawer">
      <AiChatDrawer
        v-if="drawerOpen"
        :messages="chatMessages"
        :is-sending="isSendingMessage"
        :completed-answers="completedAnswers"
        :total-questions="questionFlow.length"
        @send="handleAiSend"
        @close="drawerOpen = false"
        @generate="generateFromAi"
      />
    </Transition>

    <!-- 模板浏览弹窗 -->
    <TemplateBrowser
      v-if="showTemplateBrowser"
      :workspace-path="workspacePath"
      @select="handleTemplateSelect"
      @close="showTemplateBrowser = false"
    />

    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false" />
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiButton } from '@/components/ui/Button'
import { UiIcon } from '@/components/ui/Icon'
import { UiStatusBadge } from '@/components/ui/StatusBadge'
import { UiMarkdownEditor } from '@/components/ui/MarkdownEditor'
import { readFile, readProjectConfig, writeFile, writeProjectConfig } from '@/api/workspace'
import { useProjectStore, type ProjectConfig } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'
import AiChatDrawer from './components/AiChatDrawer.vue'
import type { ChatMessage } from './components/AiChatDrawer.vue'
import TemplateBrowser from './components/TemplateBrowser.vue'

// ─── Types ───────────────────────────────────────
interface TechOption {
  id: string
  name: string
  description: string
  recommended?: boolean
}

interface TechCategory {
  key: string
  label: string
  icon: string
  allowMultiple: boolean
  allowCustom: boolean
  options: TechOption[]
}

interface FlowStep {
  key: string
  title: string
  subtitle: string
  categories: TechCategory[]
}

interface QuestionItem {
  key: string
  label: string
  question: string
}

type PageView = 'welcome' | 'guided' | 'editor' | 'locked'

// ─── Dependencies ────────────────────────────────
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

// ─── Constants ───────────────────────────────────
const DOC_PATH = 'docs/技术选型.md'

const editorPlaceholder = `# 技术选型

在这里编写技术选型文档...

## 1. 前端技术栈

## 2. 后端技术栈

## 3. 技术风险评估
`

// ─── Tech Options Data ───────────────────────────
const frontendCategories: TechCategory[] = [
  {
    key: 'frontendFramework',
    label: '前端框架',
    icon: 'lucide:layout',
    allowMultiple: false,
    allowCustom: true,
    options: [
      { id: 'vue3', name: 'Vue 3', description: '渐进式框架，Composition API', recommended: true },
      { id: 'react', name: 'React', description: '声明式 UI 库，生态丰富' },
      { id: 'angular', name: 'Angular', description: '企业级全功能框架' },
      { id: 'svelte', name: 'Svelte', description: '编译时框架，无虚拟 DOM' },
      { id: 'nextjs', name: 'Next.js', description: 'React 全栈，支持 SSR/SSG' },
      { id: 'nuxt', name: 'Nuxt', description: 'Vue 全栈，支持 SSR/SSG' },
    ],
  },
  {
    key: 'frontendLanguage',
    label: '开发语言',
    icon: 'lucide:file-code',
    allowMultiple: false,
    allowCustom: false,
    options: [
      { id: 'typescript', name: 'TypeScript', description: '类型安全，提升代码质量', recommended: true },
      { id: 'javascript', name: 'JavaScript', description: '灵活动态，快速开发' },
    ],
  },
  {
    key: 'uiLibrary',
    label: 'UI 组件库',
    icon: 'lucide:palette',
    allowMultiple: false,
    allowCustom: true,
    options: [
      { id: 'element-plus', name: 'Element Plus', description: 'Vue 3 企业级组件库' },
      { id: 'ant-design-vue', name: 'Ant Design Vue', description: '蚂蚁设计体系 Vue 实现' },
      { id: 'naive-ui', name: 'Naive UI', description: 'TypeScript 编写的组件库' },
      { id: 'tailwind', name: 'Tailwind CSS', description: '实用优先 CSS 框架' },
      { id: 'vuetify', name: 'Vuetify', description: 'Material Design 组件' },
      { id: 'none', name: '不使用', description: '手写样式或 CSS Modules' },
    ],
  },
]

const backendCategories: TechCategory[] = [
  {
    key: 'backendFramework',
    label: '后端框架',
    icon: 'lucide:server',
    allowMultiple: false,
    allowCustom: true,
    options: [
      { id: 'actix', name: 'Actix Web', description: 'Rust 高性能 Web 框架' },
      { id: 'axum', name: 'Axum', description: 'Rust 异步 Web 框架' },
      { id: 'spring-boot', name: 'Spring Boot', description: 'Java 企业级快速开发' },
      { id: 'express', name: 'Express', description: 'Node.js 极简 Web 框架' },
      { id: 'fastapi', name: 'FastAPI', description: 'Python 高性能 API 框架' },
      { id: 'django', name: 'Django', description: 'Python 全功能 Web 框架' },
      { id: 'gin', name: 'Gin', description: 'Go 高性能 HTTP 框架' },
      { id: 'nestjs', name: 'NestJS', description: 'Node.js 企业级框架' },
    ],
  },
  {
    key: 'database',
    label: '数据库',
    icon: 'lucide:database',
    allowMultiple: true,
    allowCustom: true,
    options: [
      { id: 'postgresql', name: 'PostgreSQL', description: '功能强大的开源关系型数据库', recommended: true },
      { id: 'mysql', name: 'MySQL', description: '流行的开源关系型数据库' },
      { id: 'mongodb', name: 'MongoDB', description: '灵活的文档型数据库' },
      { id: 'sqlite', name: 'SQLite', description: '轻量级嵌入式数据库' },
      { id: 'redis', name: 'Redis', description: '高性能键值缓存' },
      { id: 'elasticsearch', name: 'Elasticsearch', description: '全文搜索引擎' },
    ],
  },
  {
    key: 'deployment',
    label: '部署方案',
    icon: 'lucide:cloud',
    allowMultiple: true,
    allowCustom: true,
    options: [
      { id: 'docker', name: 'Docker', description: '容器化部署', recommended: true },
      { id: 'k8s', name: 'Kubernetes', description: '容器编排平台' },
      { id: 'serverless', name: 'Serverless', description: '无服务器架构' },
      { id: 'vps', name: 'VPS/云服务器', description: '传统虚拟专用服务器' },
      { id: 'vercel', name: 'Vercel', description: '前端/全栈部署平台' },
    ],
  },
]

// ─── Guided Steps ────────────────────────────────
const guidedSteps: FlowStep[] = [
  {
    key: 'frontend',
    title: '前端技术栈',
    subtitle: '选择前端框架、开发语言和 UI 组件库',
    categories: frontendCategories,
  },
  {
    key: 'backend',
    title: '后端框架',
    subtitle: '选择后端 Web 框架',
    categories: [backendCategories[0]],
  },
  {
    key: 'infra',
    title: '数据与部署',
    subtitle: '选择数据库和部署方案',
    categories: backendCategories.slice(1),
  },
  {
    key: 'overview',
    title: '确认技术选型',
    subtitle: '检查你的选择并确认生成文档',
    categories: [],
  },
]

const guidedPhases = [
  { key: 'frontend', label: '前端' },
  { key: 'backend', label: '后端' },
  { key: 'infra', label: '数据/部署' },
  { key: 'overview', label: '确认' },
]

const stepGroupSize = 1 // each step is its own group

// ─── AI Question Flow ────────────────────────────
const questionFlow: QuestionItem[] = [
  { key: 'teamSize', label: '团队规模', question: '你的开发团队有多少人？技术背景如何？' },
  { key: 'performance', label: '性能要求', question: '对系统性能有什么特殊要求？（高并发、低延迟、大数据量等）' },
  { key: 'scale', label: '扩展预期', question: '预计的用户规模和数据增长速度如何？' },
  { key: 'deadline', label: '交付时间', question: '项目的交付时间表是怎样的？' },
  { key: 'existingTech', label: '技术储备', question: '团队在哪些技术栈上有经验？是否有必须使用的技术？' },
  { key: 'constraints', label: '约束条件', question: '是否有预算、合规或其他技术约束？' },
  { key: 'priorities', label: '优先级', question: '在开发速度、性能、可维护性之间，优先考虑什么？' },
]

// ─── State ───────────────────────────────────────
const pageView = ref<PageView>('welcome')
const editorContent = ref('')
const isLocked = ref(false)
const isSaving = ref(false)
const isLocking = ref(false)
const drawerOpen = ref(false)
const showTemplateBrowser = ref(false)
const guidedStepIndex = ref(0)

// Guided flow selections
const techSelections = reactive<Record<string, string[]>>({
  frontendFramework: [],
  frontendLanguage: [],
  uiLibrary: [],
  backendFramework: [],
  database: [],
  deployment: [],
})

// AI chat state
const chatMessages = ref<ChatMessage[]>([])
const aiAnswers = reactive<Record<string, string>>({})
const isSendingMessage = ref(false)
let messageId = 0

// ─── Computed ────────────────────────────────────
const workspacePath = computed(
  () => workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath || '',
)

const currentStep = computed(() => guidedSteps[guidedStepIndex.value])
const isLastStep = computed(() => guidedStepIndex.value === guidedSteps.length - 1)

const canLock = computed(() => editorContent.value.trim().length > 0)

const completedAnswers = computed(
  () => questionFlow.filter((q) => aiAnswers[q.key]?.trim().length > 0).length,
)

const overviewMarkdown = computed(() => generateMarkdown())

// ─── Lifecycle ───────────────────────────────────
onMounted(async () => {
  await loadExistingState()
})

// ─── Page State Functions ────────────────────────
function goToWelcome() {
  pageView.value = 'welcome'
}

function startGuidedFlow() {
  resetSelections()
  guidedStepIndex.value = 0
  pageView.value = 'guided'
}

function startAiFlow() {
  pageView.value = 'editor'
  bootstrapAiMessages()
  nextTick(() => {
    drawerOpen.value = true
  })
}

function resetSelections() {
  Object.keys(techSelections).forEach((key) => {
    techSelections[key] = []
  })
}

// ─── Load Existing ───────────────────────────────
async function loadExistingState() {
  const wsPath = workspacePath.value
  if (!wsPath) return

  try {
    const [config, content] = await Promise.all([
      readProjectConfig(wsPath),
      readFile(wsPath, DOC_PATH).catch(() => ''),
    ])

    const phase = (
      config?.phases as Record<string, { status?: string }> | undefined
    )?.tech

    if (phase?.status === 'locked') {
      isLocked.value = true
      pageView.value = 'locked'
    }

    if (typeof content === 'string' && content.trim()) {
      editorContent.value = content
      if (phase?.status !== 'locked') {
        pageView.value = 'editor'
      }
    }
  } catch (error) {
    console.error('Failed to load tech state:', error)
  }
}

// ─── Guided Flow ─────────────────────────────────
function getCurrentPhaseIndex(): number {
  const key = currentStep.value.key
  return guidedPhases.findIndex((p) => p.key === key)
}

function jumpToPhase(phaseIdx: number) {
  // Only allow jumping to completed or current phases
  if (phaseIdx * stepGroupSize <= guidedStepIndex.value) {
    guidedStepIndex.value = phaseIdx * stepGroupSize
  }
}

function toggleOption(categoryKey: string, optionId: string, allowMultiple: boolean) {
  const current = techSelections[categoryKey] || []
  if (allowMultiple) {
    if (current.includes(optionId)) {
      techSelections[categoryKey] = current.filter((id) => id !== optionId)
    } else {
      techSelections[categoryKey] = [...current, optionId]
    }
  } else {
    techSelections[categoryKey] = current.includes(optionId) ? [] : [optionId]
  }
}

function addCustomOption(categoryKey: string, value: string, allowMultiple: boolean) {
  if (!value.trim()) return
  const id = `custom_${value.trim()}`
  const current = techSelections[categoryKey] || []
  if (allowMultiple) {
    if (!current.includes(id)) {
      techSelections[categoryKey] = [...current, id]
    }
  } else {
    techSelections[categoryKey] = [id]
  }
}

function prevStep() {
  if (guidedStepIndex.value > 0) {
    guidedStepIndex.value--
  }
}

async function nextOrComplete() {
  if (!isLastStep.value) {
    guidedStepIndex.value++
    return
  }

  // Generate document from selections
  editorContent.value = generateMarkdown()
  pageView.value = 'editor'
  await saveDraft()
}

// ─── Markdown Generation ─────────────────────────
function getOptionName(_categoryKey: string, optionId: string): string {
  const allCategories = [...frontendCategories, ...backendCategories]
  for (const cat of allCategories) {
    const found = cat.options.find((o) => o.id === optionId)
    if (found) return found.name
  }
  // Custom option: strip custom_ prefix
  if (optionId.startsWith('custom_')) return optionId.slice(7)
  return optionId
}

function generateMarkdown(): string {
  const lines: string[] = ['# 技术选型', '']

  // Frontend
  lines.push('## 1. 前端技术栈', '')

  const feSections = [
    { key: 'frontendFramework', label: '框架', num: '1.1' },
    { key: 'frontendLanguage', label: '开发语言', num: '1.2' },
    { key: 'uiLibrary', label: 'UI 组件库', num: '1.3' },
  ]

  for (const sec of feSections) {
    const selected = techSelections[sec.key] || []
    const names = selected.map((id) => getOptionName(sec.key, id)).join(' + ')
    lines.push(`### ${sec.num} ${sec.label}`, '')
    lines.push(names || '待选择', '')
  }

  // Backend
  lines.push('## 2. 后端技术栈', '')

  const beSections = [
    { key: 'backendFramework', label: 'Web 框架', num: '2.1' },
    { key: 'database', label: '数据库', num: '2.2' },
    { key: 'deployment', label: '部署方案', num: '2.3' },
  ]

  for (const sec of beSections) {
    const selected = techSelections[sec.key] || []
    const names = selected.map((id) => getOptionName(sec.key, id)).join(' + ')
    lines.push(`### ${sec.num} ${sec.label}`, '')
    lines.push(names || '待选择', '')
  }

  // Risk assessment
  lines.push('## 3. 技术风险评估', '')
  lines.push('| 风险项 | 影响程度 | 缓解措施 |')
  lines.push('|--------|----------|----------|')
  lines.push('| 技术栈学习成本 | 中 | 团队培训、文档建设 |')
  lines.push('| 第三方依赖风险 | 低 | 版本锁定、备选方案 |')
  lines.push('| 性能瓶颈 | 中 | 性能测试、架构优化 |')
  lines.push('')

  // Summary
  lines.push('## 4. 选型理由总结', '')
  lines.push('（请根据项目实际情况补充选型理由）', '')

  return lines.join('\n')
}

// ─── AI Chat Functions ───────────────────────────
function bootstrapAiMessages() {
  if (chatMessages.value.length > 0) return
  pushChat('assistant', '你好！我会通过问答帮你确定技术方案。')
  pushChat('assistant', questionFlow[0].question)
}

function pushChat(role: 'assistant' | 'user', content: string) {
  chatMessages.value.push({ id: ++messageId, role, content })
}

function currentQuestion(): QuestionItem | undefined {
  return questionFlow.find((q) => !aiAnswers[q.key]?.trim())
}

function handleAiSend(content: string) {
  if (isSendingMessage.value) return
  pushChat('user', content)
  captureAiAnswer(content)

  const next = currentQuestion()
  if (next) {
    const answered = questionFlow.filter((q) => aiAnswers[q.key]?.trim())
    const lastLabel = answered[answered.length - 1]?.label ?? '当前问题'
    pushChat('assistant', `收到，已记录「${lastLabel}」。接下来：${next.question}`)
  } else {
    pushChat('assistant', '信息收集完成！你可以点击「生成技术选型文档」或直接在编辑器中完善。')
  }
}

function captureAiAnswer(content: string) {
  const next = currentQuestion()
  if (!next) return
  aiAnswers[next.key] = content
}

async function generateFromAi() {
  isSendingMessage.value = true
  try {
    const md = buildAiMarkdown()
    editorContent.value = md
    pageView.value = 'editor'
    await saveDraft()
    pushChat('assistant', '技术选型文档已生成！你可以在编辑器中查看和修改。')
  } finally {
    isSendingMessage.value = false
  }
}

function buildAiMarkdown(): string {
  const lines: string[] = ['# 技术选型', '']

  // Project context from AI answers
  lines.push('## 1. 项目概况', '')
  lines.push(`**团队规模**：${aiAnswers.teamSize || '待补充'}`, '')
  lines.push(`**性能要求**：${aiAnswers.performance || '待补充'}`, '')
  lines.push(`**扩展预期**：${aiAnswers.scale || '待补充'}`, '')
  lines.push(`**交付时间**：${aiAnswers.deadline || '待补充'}`, '')
  lines.push(`**技术储备**：${aiAnswers.existingTech || '待补充'}`, '')
  lines.push(`**约束条件**：${aiAnswers.constraints || '待补充'}`, '')
  lines.push(`**优先级**：${aiAnswers.priorities || '待补充'}`, '')

  // Recommended tech stack placeholder
  lines.push('## 2. 推荐技术栈', '')
  lines.push('（根据上述信息，请在编辑器中补充推荐的前端和后端技术方案）', '')

  lines.push('### 2.1 前端技术栈', '')
  lines.push('- 框架：待选择', '')
  lines.push('- 语言：待选择', '')
  lines.push('- UI 组件库：待选择', '')

  lines.push('### 2.2 后端技术栈', '')
  lines.push('- 框架：待选择', '')
  lines.push('- 数据库：待选择', '')
  lines.push('- 部署方案：待选择', '')

  // Risk assessment
  lines.push('## 3. 技术风险评估', '')
  lines.push('| 风险项 | 影响程度 | 缓解措施 |')
  lines.push('|--------|----------|----------|')
  lines.push('| 技术栈学习成本 | 中 | 团队培训、文档建设 |')
  lines.push('| 第三方依赖风险 | 低 | 版本锁定、备选方案 |')
  lines.push('| 性能瓶颈 | 中 | 性能测试、架构优化 |')
  lines.push('')

  lines.push('## 4. 选型理由总结', '')
  lines.push('（请根据项目实际情况补充选型理由）', '')

  return lines.join('\n')
}

// ─── Template ────────────────────────────────────
function handleTemplateSelect(content: string) {
  editorContent.value = content
  pageView.value = 'editor'
  showTemplateBrowser.value = false
}

// ─── File I/O ────────────────────────────────────
async function persistProjectConfig(status: 'in_progress' | 'locked') {
  const wsPath = workspacePath.value
  if (!wsPath) return

  const existing = await readProjectConfig(wsPath)
  const project = {
    ...(existing ?? (projectStore.currentProject as unknown as Record<string, unknown>) ?? {}),
  } as Record<string, any>

  project.updatedAt = new Date().toISOString()
  project.phases = {
    ...(project.phases ?? {}),
    tech: {
      ...(project.phases?.tech ?? {}),
      status,
      model: project.phases?.tech?.model ?? project.defaultModel ?? 'claude-sonnet-4-6',
      ...(status === 'locked' ? { lockedAt: new Date().toISOString() } : {}),
    },
  }

  await writeProjectConfig(wsPath, project)

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
  const wsPath = workspacePath.value
  if (!wsPath || isLocked.value) return

  isSaving.value = true
  try {
    await writeFile(wsPath, DOC_PATH, editorContent.value)
    await persistProjectConfig('in_progress')
  } catch (error) {
    console.error('Failed to save tech doc:', error)
    alert(`保存失败：${error}`)
  } finally {
    isSaving.value = false
  }
}

async function lockDocument() {
  const wsPath = workspacePath.value
  if (!wsPath || isLocked.value || !canLock.value) return

  isLocking.value = true
  try {
    await writeFile(wsPath, DOC_PATH, editorContent.value)
    await persistProjectConfig('locked')
    isLocked.value = true
    pageView.value = 'locked'
    projectStore.setActivePhase('prototype')
    await router.push({ name: 'prototype', params: { id: route.params.id as string } })
  } catch (error) {
    console.error('Failed to lock tech doc:', error)
    alert(`锁定失败：${error}`)
  } finally {
    isLocking.value = false
  }
}
</script>

<style scoped>
.tech-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

/* ─── 工具栏 ─── */
.tech-toolbar {
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

.toolbar-btn .is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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

/* ─── 主内容区 ─── */
.tech-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ─── Welcome ─── */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  gap: 2.5rem;
}

.welcome-header {
  text-align: center;
}

.welcome-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  background: color-mix(in oklab, var(--color-accent) 10%, var(--color-surface-raised));
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.welcome-title {
  font-size: var(--type-heading-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem;
}

.welcome-desc {
  font-size: var(--type-body-md);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 28rem;
}

.welcome-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-xl);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
}

.option-card:hover {
  border-color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 4%, var(--color-surface-raised));
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.option-card__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-card__icon--accent {
  background: color-mix(in oklab, var(--color-accent) 12%, var(--color-surface-raised));
  color: var(--color-accent);
}

.option-card__icon--ai {
  background: color-mix(in oklab, var(--color-accent) 12%, var(--color-surface-raised));
  color: var(--color-accent);
}

.option-card__body {
  flex: 1;
  min-width: 0;
}

.option-card__body h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem;
}

.option-card__body p {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

.option-card__arrow {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

/* ─── Guided Flow ─── */
.guided-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.guided-phases {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--color-border-soft);
  background: var(--color-surface);
  flex-shrink: 0;
}

.phase-step {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.phase-step--active {
  color: var(--color-accent);
}

.phase-step--current {
  background: color-mix(in oklab, var(--color-accent) 10%, var(--color-surface));
  color: var(--color-accent);
  font-weight: 600;
}

.phase-step__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: currentColor;
}

.guided-step-header {
  padding: 1.25rem 1.5rem 0.75rem;
  flex-shrink: 0;
}

.guided-step-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem;
}

.guided-step-header p {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

.guided-step-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1rem;
}

.category-block {
  margin-bottom: 1.5rem;
}

.category-block:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.category-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.category-hint {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  background: var(--color-surface-soft);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-pill);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.625rem;
}

.tech-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.tech-card:hover {
  border-color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 4%, var(--color-surface-raised));
}

.tech-card--selected {
  border-color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 8%, var(--color-surface-raised));
  box-shadow: 0 0 0 1px var(--color-accent);
}

.tech-card__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 10%, var(--color-surface-raised));
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-pill);
}

.tech-card__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.tech-card__desc {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

.tech-card__check {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  color: var(--color-accent);
}

.tech-card--custom {
  justify-content: center;
  border-style: dashed;
}

.custom-input {
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  outline: none;
  width: 100%;
  text-align: center;
}

.custom-input::placeholder {
  color: var(--color-text-tertiary);
}

.guided-overview {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1rem;
}

.guided-nav {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border-soft);
  background: var(--color-surface);
  flex-shrink: 0;
}

/* ─── Editor ─── */
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

/* ─── 遮罩层 ─── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, black 40%, transparent);
  z-index: 150;
}

/* ─── 动画 ─── */
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

/* ─── 响应式 ─── */
@media (max-width: 640px) {
  .welcome-options {
    max-width: 100%;
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
