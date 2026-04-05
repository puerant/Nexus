<template>
  <section class="retrospective-page">
    <!-- Header -->
    <div class="retro-header">
      <div class="header-info">
        <h1 class="header-title">项目复盘</h1>
        <span class="header-meta">
          {{ project?.name || '未命名项目' }}
          <span class="meta-sep">·</span>
          {{ dateRange }}
          <span class="meta-sep">·</span>
          <span class="meta-accent">{{ currentPhaseLabel }}</span>
        </span>
      </div>
      <div class="header-actions">
        <UiButton variant="secondary" size="sm">
          <template #icon><UiIcon icon="lucide:download" size="sm" /></template>
          导出报告
        </UiButton>
        <UiButton variant="primary" size="sm">
          <template #icon><UiIcon icon="lucide:sparkles" size="sm" /></template>
          AI 生成总结
        </UiButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <RetrospectiveStatsGrid :stats="statsItems" />

    <!-- Two-column: Prompts + Phase -->
    <div class="two-col">
      <PromptRanking :prompts="promptData" />
      <PhaseSummary :phases="phaseItems" />
    </div>

    <!-- Two-column: Usage + Time Split -->
    <div class="two-col">
      <UsageBreakdown :categories="usageCategories" />
      <TimeSplitCard :time-split="timeSplitData" />
    </div>

    <!-- Heatmap -->
    <UiSurface padding="md" rounded="lg">
      <div class="section-label">项目全周期活跃度热力图 <span class="label-hint">· 过去 52 周</span></div>
      <UiHeatmap
        :data="heatmapData"
        :weeks="52"
        :show-legend="true"
        stretch
        cell-size="sm"
        empty-text="暂无项目活动记录"
      />
    </UiSurface>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton } from '@/components/ui/Button'
import { UiSurface } from '@/components/ui/Surface'
import { UiIcon } from '@/components/ui/Icon'
import { UiHeatmap, generateDemoData } from '@/components/ui/Heatmap'
import type { HeatmapData } from '@/components/ui/Heatmap'
import { useProjectStore } from '@/stores/project'
import { useTasksStore } from '@/stores/tasks'

import RetrospectiveStatsGrid from './components/RetrospectiveStatsGrid.vue'
import type { RetroStatItem } from './components/RetrospectiveStatsGrid.vue'
import PromptRanking from './components/PromptRanking.vue'
import type { PromptEntry } from './components/PromptRanking.vue'
import PhaseSummary from './components/PhaseSummary.vue'
import type { PhaseSummaryItem } from './components/PhaseSummary.vue'
import UsageBreakdown from './components/UsageBreakdown.vue'
import type { UsageCategory } from './components/UsageBreakdown.vue'
import TimeSplitCard from './components/TimeSplitCard.vue'
import type { TimeSplitData } from './components/TimeSplitCard.vue'

const projectStore = useProjectStore()
const tasksStore = useTasksStore()
const project = computed(() => projectStore.currentProject)

// --- Date Range ---
const dateRange = computed(() => {
  if (!project.value) return '未知时间'
  const start = formatDate(project.value.createdAt)
  const end = project.value.updatedAt ? formatDate(project.value.updatedAt) : '今天'
  return `${start} — ${end}`
})

const currentPhaseLabel = computed(() => {
  if (!project.value) return '未知阶段'
  const phaseLabels: Record<string, string> = {
    requirements: '需求分析',
    tech: '技术选型',
    prototype: '原型设计',
    tasks: '任务开发',
    retrospective: '复盘总结',
  }
  const phases = project.value.phases
  const activeEntry = Object.entries(phases).find(([, p]) => p.status === 'in_progress')
  if (activeEntry) return phaseLabels[activeEntry[0]] + '阶段'
  const completedCount = Object.values(phases).filter(p => p.status === 'completed').length
  if (completedCount === 5) return '项目已完成'
  return '规划阶段'
})

// --- Stats Grid (real data from tasks store) ---
const statsItems = computed<RetroStatItem[]>(() => {
  const total = tasksStore.totalTasks
  const done = tasksStore.completedCount
  const rate = tasksStore.completionRate
  const totalHours = tasksStore.totalActualHours
  const tokens = tasksStore.totalTokensUsed

  return [
    {
      icon: 'lucide:bar-chart-3',
      value: `${done}`,
      unit: `/${total}`,
      label: '任务完成数',
      delta: `完成率 ${rate}%`,
    },
    {
      icon: 'lucide:clock',
      value: formatHours(totalHours),
      unit: '',
      label: '项目总耗时',
      delta: totalHours > 0 ? `日均 ${(totalHours / Math.max(projectAge.value, 1)).toFixed(1)}h` : undefined,
    },
    {
      icon: 'lucide:zap',
      value: formatTokens(tokens),
      unit: '',
      label: 'Token 总消耗',
      delta: 'input/output 比例待接入',
    },
    {
      icon: 'lucide:message-square',
      value: '18',
      label: '提示词总数',
      delta: '平均评分 \u2605 4.2',
    },
  ]
})

const projectAge = computed(() => {
  if (!project.value?.createdAt) return 1
  const days = (Date.now() - new Date(project.value.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(Math.round(days), 1)
})

// --- Prompt Ranking (demo data) ---
const promptData = ref<PromptEntry[]>([
  { name: '需求分析启动提示词', module: '需求分析', rating: 4.9, uses: 8 },
  { name: 'Landing Page 原型生成', module: '原型设计', rating: 4.3, uses: 5 },
  { name: '用户故事生成器', module: '需求分析', rating: 4.1, uses: 4 },
  { name: '组件开发辅助', module: '任务执行', rating: 3.6, uses: 3 },
  { name: 'API 文档生成模板', module: '任务执行', rating: 4.0, uses: 2 },
])

// --- Phase Summary (merge real status + demo timing) ---
const phaseItems = computed<PhaseSummaryItem[]>(() => {
  const phases = project.value?.phases
  const statusMap: Record<string, string> = {
    completed: 'completed',
    locked: 'completed',
    in_progress: 'in_progress',
    not_started: 'not_started',
  } as const

  const phaseConfig = [
    { key: 'requirements', num: '01', name: '需求分析', tasks: 8, done: 8, time: '12h 30m' },
    { key: 'tech', num: '02', name: '技术选型', tasks: 4, done: 3, time: '8h 15m' },
    { key: 'prototype', num: '03', name: '原型设计', tasks: 6, done: 4, time: '18h 40m' },
    { key: 'tasks', num: '04', name: '任务开发', tasks: 11, done: tasksStore.completedCount, time: formatHoursFull(tasksStore.totalActualHours) },
    { key: 'retrospective', num: '05', name: '复盘总结', tasks: 0, done: 0, time: '—' },
  ]

  return phaseConfig.map(p => {
    const phaseState = phases?.[p.key as keyof typeof phases]
    const status = (phaseState?.status ? statusMap[phaseState.status] : 'not_started') as PhaseSummaryItem['status']
    const progress = p.tasks > 0 ? Math.round((p.done / p.tasks) * 100) : 0

    return {
      num: p.num,
      name: p.name,
      taskLabel: p.tasks > 0 ? (status === 'not_started' ? '—' : `${p.tasks} 个任务${p.done > 0 ? ` · ${p.done}/${p.tasks}` : ''}`) : '—',
      progress,
      timeSpent: status === 'not_started' ? '—' : p.time,
      status,
    }
  })
})

// --- Usage Breakdown (demo data) ---
const usageCategories = ref<UsageCategory[]>([
  {
    label: 'Skill 使用频率',
    max: 23,
    items: [
      { name: '代码生成', count: 23, color: 'var(--color-accent)' },
      { name: '需求分析', count: 15, color: 'var(--color-accent)' },
      { name: '测试编写', count: 12, color: 'var(--color-accent)' },
      { name: '文档撰写', count: 8, color: 'var(--color-accent)' },
      { name: '重构建议', count: 5, color: 'var(--color-accent)' },
    ],
  },
  {
    label: 'MCP 调用频率',
    max: 45,
    items: [
      { name: '文件系统', count: 45, color: 'var(--color-success)' },
      { name: '终端执行', count: 28, color: 'var(--color-success)' },
      { name: '浏览器预览', count: 18, color: 'var(--color-success)' },
      { name: '数据库查询', count: 9, color: 'var(--color-success)' },
    ],
  },
  {
    label: 'Agent 使用频率',
    max: 32,
    items: [
      { name: 'Claude Sonnet', count: 32, color: 'var(--color-warning)' },
      { name: 'Claude Haiku', count: 14, color: 'var(--color-warning)' },
      { name: '自定义 Agent', count: 7, color: 'var(--color-warning)' },
    ],
  },
])

// --- Time Split (real data from tasks store) ---
const timeSplitData = computed<TimeSplitData>(() => {
  const tasks = tasksStore.tasks
  const manualHours = tasks.filter(t => t.source === 'manual').reduce((s, t) => s + t.actualHours, 0)
  const aiHours = tasks.filter(t => t.source === 'ai').reduce((s, t) => s + t.actualHours, 0)
  return {
    total: tasksStore.totalActualHours,
    manual: manualHours,
    ai: aiHours,
  }
})

// --- Heatmap (demo data) ---
const heatmapData = ref<HeatmapData[]>(generateDemoData(52, 0.3))

// --- Helpers ---
function formatDate(iso?: string): string {
  if (!iso) return '未知'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatHours(hours: number): string {
  if (hours === 0) return '0h'
  const h = Math.floor(hours)
  return `${h}h`
}

function formatHoursFull(hours: number): string {
  if (hours === 0) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTokens(tokens: number): string {
  if (tokens === 0) return '0'
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return String(tokens)
}
</script>

<style scoped>
.retrospective-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.retro-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.header-meta {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.meta-sep {
  color: var(--color-text-tertiary);
  margin: 0 0.25rem;
}

.meta-accent {
  color: var(--color-accent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.section-label {
  margin-bottom: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.label-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 1100px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .retro-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
