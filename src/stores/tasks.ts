import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskSource = 'ai' | 'manual'
export type ViewMode = 'kanban' | 'list'

export interface ExecutionLogEntry {
  time: string
  message: string
  type: 'info' | 'action' | 'waiting' | 'success'
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  parentId: string | null
  source: TaskSource
  estimatedHours: number
  actualHours: number
  tokensUsed: number
  taskMd: string
  testMd: string
  module: string
  tags: string[]
  relatedFiles: string[]
  executionLog: ExecutionLogEntry[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
  timerStartedAt: string | null
  timerSeconds: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  parentId?: string | null
  source?: TaskSource
  estimatedHours?: number
  module?: string
  tags?: string[]
  relatedFiles?: string[]
  taskMd?: string
  testMd?: string
}

let idCounter = 100

function generateId(): string {
  return `task-${Date.now()}-${++idCounter}`
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

// Demo data
function createDemoTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: '用户注册与邮箱验证功能',
      description:
        '实现用户注册流程，包含邮箱验证、密码强度校验、防重注册逻辑。后端发送验证邮件，前端实现验证成功/失败页。',
      status: 'todo',
      priority: 'high',
      parentId: null,
      source: 'ai',
      estimatedHours: 8,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: '## 用户注册与邮箱验证\n\n实现完整的注册流程...',
      testMd: '## 验收标准\n\n- [ ] 注册表单提交成功\n- [ ] 验证邮件发送成功\n- [ ] 邮箱验证链接可用\n- [ ] 密码强度校验正确',
      module: '前端-用户模块',
      tags: ['前端', '用户模块'],
      relatedFiles: ['Register.vue', 'auth.service.ts'],
      executionLog: [],
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(48),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    },
    {
      id: 'task-2',
      title: '数据库 Schema 设计与迁移脚本',
      description: '设计核心业务表结构（用户、订阅、支付记录），编写 Knex 迁移脚本，添加种子数据。',
      status: 'todo',
      priority: 'high',
      parentId: null,
      source: 'manual',
      estimatedHours: 4,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: '## Schema 设计\n\n设计用户表、订阅表、支付记录表...',
      testMd: '## 验收标准\n\n- [ ] 迁移脚本执行无报错\n- [ ] 表结构与设计文档一致\n- [ ] 种子数据正确插入',
      module: '后端-数据库',
      tags: ['后端', '数据库'],
      relatedFiles: ['migrations/001_init.ts'],
      executionLog: [],
      createdAt: hoursAgo(60),
      updatedAt: hoursAgo(40),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    },
    {
      id: 'task-3',
      title: '支付模块接入 Stripe',
      description: '接入 Stripe Payment Intent API，实现订阅创建、支付确认、Webhook 回调处理。',
      status: 'todo',
      priority: 'medium',
      parentId: null,
      source: 'ai',
      estimatedHours: 6,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: '## Stripe 集成\n\n实现订阅支付全流程...',
      testMd: '## 验收标准\n\n- [ ] 创建 Payment Intent 成功\n- [ ] Webhook 签名验证通过\n- [ ] 订阅状态同步正确',
      module: '后端-支付',
      tags: ['后端', '支付'],
      relatedFiles: ['stripe.service.ts'],
      executionLog: [],
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(30),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    },
    {
      id: 'task-4',
      title: 'API 文档生成（OpenAPI 3.0）',
      description: '基于路由和 Controller 自动生成 OpenAPI 3.0 规范文档，集成 Swagger UI。',
      status: 'todo',
      priority: 'low',
      parentId: null,
      source: 'manual',
      estimatedHours: 2,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: '## API 文档\n\n生成 OpenAPI 3.0 规范文档...',
      testMd: '## 验收标准\n\n- [ ] 所有 API 端点已收录\n- [ ] Swagger UI 可正常访问',
      module: '后端-工具',
      tags: ['后端', '文档'],
      relatedFiles: ['openapi.yaml'],
      executionLog: [],
      createdAt: hoursAgo(36),
      updatedAt: hoursAgo(24),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    },
    {
      id: 'task-5',
      title: '仪表盘首页数据统计组件',
      description:
        '实现仪表盘首页的核心数据统计模块，包含总用户数、活跃用户、收入趋势图、任务完成率卡片。支持日期范围筛选和骨架屏。',
      status: 'in_progress',
      priority: 'high',
      parentId: null,
      source: 'ai',
      estimatedHours: 4,
      actualHours: 1.4,
      tokensUsed: 12500,
      taskMd: '## 仪表盘统计组件\n\n实现数据统计卡片和趋势图...',
      testMd: '## 验收标准\n\n- [ ] 四个统计卡片正确渲染\n- [ ] 趋势图数据加载正常\n- [ ] 日期筛选器交互正确\n- [ ] 骨架屏在加载时显示',
      module: '前端-仪表盘',
      tags: ['前端', '仪表盘'],
      relatedFiles: ['Dashboard.vue', 'StatsCard.vue'],
      executionLog: [
        { time: '14:20', message: 'Claude 开始分析需求文档...', type: 'info' },
        { time: '14:21', message: '生成组件骨架结构 (Dashboard.tsx)', type: 'action' },
        { time: '14:24', message: '完成 StatsCard 子组件编写', type: 'action' },
        { time: '14:38', message: '等待用户确认 API 接口格式...', type: 'waiting' },
      ],
      createdAt: hoursAgo(24),
      updatedAt: hoursAgo(2),
      completedAt: null,
      timerStartedAt: hoursAgo(0.5),
      timerSeconds: 5048,
    },
    {
      id: 'task-6',
      title: '用户权限与 RBAC 模型设计',
      description: '设计基于角色的访问控制模型，定义角色（Admin/Member/Viewer）及其权限矩阵。',
      status: 'in_progress',
      priority: 'medium',
      parentId: null,
      source: 'manual',
      estimatedHours: 3,
      actualHours: 0.75,
      tokensUsed: 0,
      taskMd: '## RBAC 模型\n\n定义角色与权限矩阵...',
      testMd: '## 验收标准\n\n- [ ] 角色定义完整\n- [ ] 权限矩阵覆盖所有操作\n- [ ] 中间件鉴权正确',
      module: '后端-权限',
      tags: ['后端', '权限'],
      relatedFiles: ['rbac.model.ts'],
      executionLog: [],
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(4),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 2721,
    },
    {
      id: 'task-7',
      title: '响应式布局适配（移动端）',
      description: '对所有主要页面进行移动端适配，确保在 375px~768px 屏幕上的可用性。',
      status: 'in_progress',
      priority: 'medium',
      parentId: null,
      source: 'manual',
      estimatedHours: 3,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: '## 移动端适配\n\n响应式布局适配...',
      testMd: '## 验收标准\n\n- [ ] 375px 宽度下布局正常\n- [ ] 触控交互正常\n- [ ] 图片自适应加载',
      module: '前端-通用',
      tags: ['前端', '响应式'],
      relatedFiles: [],
      executionLog: [],
      createdAt: hoursAgo(16),
      updatedAt: hoursAgo(8),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    },
    {
      id: 'task-8',
      title: 'PRD 文档初稿撰写',
      description: '完成产品需求文档的初稿撰写，包含背景、目标用户、核心功能、验收标准。',
      status: 'done',
      priority: 'high',
      parentId: null,
      source: 'manual',
      estimatedHours: 2,
      actualHours: 2.25,
      tokensUsed: 3200,
      taskMd: '## PRD 撰写\n\n完成需求文档初稿...',
      testMd: '## 验收标准\n\n- [x] 文档结构完整\n- [x] 核心功能描述清晰\n- [x] 验收标准可量化',
      module: '文档',
      tags: ['文档'],
      relatedFiles: ['PRD.md'],
      executionLog: [
        { time: '10:00', message: '开始撰写 PRD 文档', type: 'info' },
        { time: '11:30', message: '完成核心功能章节', type: 'action' },
        { time: '12:15', message: '文档初稿完成', type: 'success' },
      ],
      createdAt: hoursAgo(120),
      updatedAt: hoursAgo(96),
      completedAt: hoursAgo(96),
      timerStartedAt: null,
      timerSeconds: 8100,
    },
    {
      id: 'task-9',
      title: 'Landing Page 原型设计',
      description: '设计产品落地页的高保真原型，包含 Hero、功能介绍、定价方案、CTA 模块。',
      status: 'done',
      priority: 'medium',
      parentId: null,
      source: 'ai',
      estimatedHours: 2,
      actualHours: 1.8,
      tokensUsed: 8700,
      taskMd: '## Landing Page\n\n设计高保真原型...',
      testMd: '## 验收标准\n\n- [x] 四个模块设计完成\n- [x] 交互流程清晰\n- [x] 视觉风格统一',
      module: '前端-页面',
      tags: ['前端', '设计'],
      relatedFiles: ['Landing.vue'],
      executionLog: [],
      createdAt: hoursAgo(96),
      updatedAt: hoursAgo(72),
      completedAt: hoursAgo(72),
      timerStartedAt: null,
      timerSeconds: 6480,
    },
    {
      id: 'task-10',
      title: '技术选型调研报告',
      description: '完成技术选型调研，对比候选方案，输出推荐方案和理由。',
      status: 'done',
      priority: 'high',
      parentId: null,
      source: 'manual',
      estimatedHours: 3,
      actualHours: 3.33,
      tokensUsed: 5100,
      taskMd: '## 技术选型\n\n调研并输出技术选型报告...',
      testMd: '## 验收标准\n\n- [x] 候选方案对比完整\n- [x] 推荐方案有理有据\n- [x] 风险评估充分',
      module: '文档',
      tags: ['文档', '技术选型'],
      relatedFiles: ['tech-stack.md'],
      executionLog: [],
      createdAt: hoursAgo(80),
      updatedAt: hoursAgo(60),
      completedAt: hoursAgo(60),
      timerStartedAt: null,
      timerSeconds: 12000,
    },
    {
      id: 'task-11',
      title: '用户故事梳理（15条）',
      description: '梳理并编写 15 条用户故事，涵盖核心场景和边缘场景。',
      status: 'done',
      priority: 'medium',
      parentId: null,
      source: 'ai',
      estimatedHours: 1,
      actualHours: 0.75,
      tokensUsed: 4200,
      taskMd: '## 用户故事\n\n梳理 15 条用户故事...',
      testMd: '## 验收标准\n\n- [x] 15 条用户故事覆盖核心场景\n- [x] 格式统一\n- [x] 包含验收条件',
      module: '文档',
      tags: ['文档', '需求'],
      relatedFiles: ['user-stories.md'],
      executionLog: [],
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(56),
      completedAt: hoursAgo(56),
      timerStartedAt: null,
      timerSeconds: 2700,
    },
  ]
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(createDemoTasks())
  const viewMode = ref<ViewMode>('kanban')
  const searchQuery = ref('')
  const filterStatus = ref<TaskStatus | 'all'>('all')
  const filterPriority = ref<TaskPriority | 'all'>('all')
  const selectedTaskId = ref<string | null>(null)
  const isDetailOpen = ref(false)
  const isCreateOpen = ref(false)
  const editingTaskId = ref<string | null>(null)

  // Active timers: taskId -> intervalId
  const activeTimers = ref<Map<string, ReturnType<typeof setInterval>>>(new Map())

  // Computed
  const todoTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'todo'),
  )
  const inProgressTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'in_progress'),
  )
  const doneTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'done'),
  )

  const totalTasks = computed(() => tasks.value.length)
  const completedCount = computed(() => doneTasks.value.length)
  const inProgressCount = computed(() => inProgressTasks.value.length)
  const todoCount = computed(() => todoTasks.value.length)
  const completionRate = computed(() =>
    totalTasks.value > 0
      ? Math.round((completedCount.value / totalTasks.value) * 100)
      : 0,
  )

  const totalEstimatedHours = computed(() =>
    tasks.value.reduce((sum, t) => sum + t.estimatedHours, 0),
  )
  const totalActualHours = computed(() =>
    tasks.value.reduce((sum, t) => sum + t.actualHours, 0),
  )
  const totalTokensUsed = computed(() =>
    tasks.value.reduce((sum, t) => sum + t.tokensUsed, 0),
  )

  const highPriorityCount = computed(() =>
    tasks.value.filter((t) => t.priority === 'high').length,
  )
  const mediumPriorityCount = computed(() =>
    tasks.value.filter((t) => t.priority === 'medium').length,
  )
  const lowPriorityCount = computed(() =>
    tasks.value.filter((t) => t.priority === 'low').length,
  )

  const filteredTasks = computed(() => {
    let result = tasks.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.module.toLowerCase().includes(q),
      )
    }

    if (filterStatus.value !== 'all') {
      result = result.filter((t) => t.status === filterStatus.value)
    }

    if (filterPriority.value !== 'all') {
      result = result.filter((t) => t.priority === filterPriority.value)
    }

    return result
  })

  const filteredTodoTasks = computed(() =>
    filteredTasks.value.filter((t) => t.status === 'todo'),
  )
  const filteredInProgressTasks = computed(() =>
    filteredTasks.value.filter((t) => t.status === 'in_progress'),
  )
  const filteredDoneTasks = computed(() =>
    filteredTasks.value.filter((t) => t.status === 'done'),
  )

  // Child tasks
  function getChildTasks(parentId: string): Task[] {
    return tasks.value.filter((t) => t.parentId === parentId)
  }

  function getTaskById(id: string): Task | undefined {
    return tasks.value.find((t) => t.id === id)
  }

  // CRUD
  function createTask(input: CreateTaskInput): Task {
    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description ?? '',
      status: 'todo',
      priority: input.priority ?? 'medium',
      parentId: input.parentId ?? null,
      source: input.source ?? 'manual',
      estimatedHours: input.estimatedHours ?? 0,
      actualHours: 0,
      tokensUsed: 0,
      taskMd: input.taskMd ?? '',
      testMd: input.testMd ?? '',
      module: input.module ?? '',
      tags: input.tags ?? [],
      relatedFiles: input.relatedFiles ?? [],
      executionLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      timerStartedAt: null,
      timerSeconds: 0,
    }
    tasks.value.push(task)
    return task
  }

  function updateTask(id: string, updates: Partial<Task>) {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    tasks.value[idx] = {
      ...tasks.value[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  }

  function deleteTask(id: string) {
    // Also delete children
    const childIds = tasks.value.filter((t) => t.parentId === id).map((t) => t.id)
    for (const childId of childIds) {
      stopTimer(childId)
    }
    stopTimer(id)
    tasks.value = tasks.value.filter((t) => t.id !== id && t.parentId !== id)
  }

  function changeTaskStatus(id: string, status: TaskStatus) {
    const updates: Partial<Task> = { status }
    if (status === 'done') {
      updates.completedAt = new Date().toISOString()
      updates.actualHours =
        tasks.value.find((t) => t.id === id)?.estimatedHours ?? 0
      stopTimer(id)
    }
    if (status === 'todo') {
      updates.completedAt = null
      stopTimer(id)
    }
    updateTask(id, updates)
  }

  // Timer
  function startTimer(id: string) {
    const task = getTaskById(id)
    if (!task || task.status === 'done') return

    updateTask(id, { timerStartedAt: new Date().toISOString(), status: 'in_progress' })

    const intervalId = setInterval(() => {
      const t = getTaskById(id)
      if (t) {
        updateTask(id, { timerSeconds: t.timerSeconds + 1 })
      }
    }, 1000)

    activeTimers.value.set(id, intervalId)
  }

  function stopTimer(id: string) {
    const intervalId = activeTimers.value.get(id)
    if (intervalId) {
      clearInterval(intervalId)
      activeTimers.value.delete(id)
    }
    const task = getTaskById(id)
    if (task?.timerStartedAt) {
      updateTask(id, { timerStartedAt: null })
    }
  }

  function isTimerRunning(id: string): boolean {
    return activeTimers.value.has(id)
  }

  // Detail / Create modals
  function openDetail(id: string) {
    selectedTaskId.value = id
    isDetailOpen.value = true
  }

  function closeDetail() {
    isDetailOpen.value = false
    selectedTaskId.value = null
  }

  function openCreate(_parentId?: string) {
    editingTaskId.value = null
    isCreateOpen.value = true
  }

  function openEdit(id: string) {
    editingTaskId.value = id
    isCreateOpen.value = true
  }

  function closeCreate() {
    isCreateOpen.value = false
    editingTaskId.value = null
  }

  // Format timer
  function formatTimer(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function formatHoursMinutes(hours: number): string {
    if (hours === 0) return '—'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return {
    tasks,
    viewMode,
    searchQuery,
    filterStatus,
    filterPriority,
    selectedTaskId,
    isDetailOpen,
    isCreateOpen,
    editingTaskId,

    todoTasks,
    inProgressTasks,
    doneTasks,
    totalTasks,
    completedCount,
    inProgressCount,
    todoCount,
    completionRate,
    totalEstimatedHours,
    totalActualHours,
    totalTokensUsed,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    filteredTasks,
    filteredTodoTasks,
    filteredInProgressTasks,
    filteredDoneTasks,

    getChildTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    startTimer,
    stopTimer,
    isTimerRunning,
    openDetail,
    closeDetail,
    openCreate,
    openEdit,
    closeCreate,
    formatTimer,
    formatHoursMinutes,
  }
})
