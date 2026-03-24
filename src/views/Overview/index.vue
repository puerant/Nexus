<template>
  <section class="overview-page">
    <div class="overview-header">
      <div class="header-info">
        <h1 class="header-title">{{ project?.name || '未命名项目' }}</h1>
        <span class="header-meta">{{ currentPhaseName }} · 创建于 {{ formatDate(project?.createdAt) }}</span>
      </div>
      <div class="header-actions">
        <UiButton variant="secondary" size="sm">同步状态</UiButton>
        <UiButton variant="primary" size="sm" :to="{ name: 'requirements', params: { id: projectId } }">
          开始需求分析
        </UiButton>
      </div>
    </div>

    <StatsGrid :stats="statsItems" />

    <section class="content-grid">
      <UiSurface padding="md" rounded="lg">
        <div class="section-label">项目阶段</div>
        <PhaseList :phases="phaseItems" @select="goToPhase" />
      </UiSurface>

      <UiSurface padding="md" rounded="lg">
        <div class="section-label">活跃热力图</div>
        <UiHeatmap
          :data="heatmapData"
          :weeks="24"
          :show-legend="true"
          stretch
          cell-size="md"
          empty-text="最近 24 周暂未产生操作记录"
        />
      </UiSurface>
    </section>

    <UiSurface padding="md" rounded="lg">
      <div class="section-label">最近动态</div>
      <ActivityList
        :activities="activities"
        empty-title="还没有项目动态"
        empty-description="开始需求分析后，这里会汇总最近的生成、编辑和阶段推进记录。"
      />
    </UiSurface>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import { UiHeatmap, generateDemoData } from '@/components/ui/Heatmap'
import StatsGrid from './components/StatsGrid.vue'
import PhaseList from './components/PhaseList.vue'
import ActivityList from './components/ActivityList.vue'
import { useProjectStore } from '@/stores/project.ts'
import type { PhaseItem } from './components/PhaseList.vue'
import type { StatItem } from './components/StatsGrid.vue'
import type { ActivityItem } from './components/ActivityList.vue'
import type { HeatmapData } from '@/components/ui/Heatmap'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectStore.currentProject)

const phaseConfig = [
  { id: 'requirements', name: '需求分析', num: '01' },
  { id: 'prototype', name: '原型设计', num: '02' },
  { id: 'tech', name: '技术选型', num: '03' },
  { id: 'tasks', name: '任务开发', num: '04' },
  { id: 'retrospective', name: '复盘总结', num: '05' },
] as const

const completedPhases = computed(() =>
  !project.value ? 0 : Object.values(project.value.phases).filter((phase) => phase.status === 'completed').length,
)

const phaseItems = computed<PhaseItem[]>(() =>
  phaseConfig.map((phase) => ({
    ...phase,
    status: (project.value?.phases as Record<string, { status: PhaseItem['status'] }>)?.[phase.id]?.status ?? 'not_started',
  })),
)

const statsItems = computed<StatItem[]>(() => [
  {
    label: '阶段进度',
    value: `${completedPhases.value}/5`,
    subtitle: `已完成 ${completedPhases.value} 个阶段`,
    progress: (completedPhases.value / 5) * 100,
  },
  {
    label: '默认模型',
    value: modelLabel.value,
    subtitle: '当前项目默认配置',
    smallValue: true,
  },
  {
    label: 'Token 消耗',
    value: '0K',
    subtitle: '尚未开始执行',
  },
  {
    label: '提示词资产',
    value: '0',
    subtitle: '等待阶段内容沉淀',
  },
])

const currentPhaseName = computed(() => {
  if (!project.value) return '初始化中'
  const inProgress = Object.entries(project.value.phases).find(([, phase]) => phase.status === 'in_progress')
  if (inProgress) {
    const labels: Record<string, string> = {
      requirements: '需求分析进行中',
      prototype: '原型设计进行中',
      tech: '技术选型进行中',
      tasks: '任务开发进行中',
      retrospective: '复盘总结进行中',
    }
    return labels[inProgress[0]] ?? '进行中'
  }
  if (completedPhases.value === 5) return '项目已完成'
  return '规划阶段'
})

const modelLabel = computed(() => {
  const model = project.value?.defaultModel ?? 'claude-sonnet-4-6'
  const labels: Record<string, string> = {
    'claude-sonnet-4-6': 'Claude Sonnet 4.6',
    'claude-opus-4-6': 'Claude Opus 4.6',
    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  }
  return labels[model] ?? model
})

const activities = ref<ActivityItem[]>([
  { text: '完成需求分析文档初稿', time: '2 小时前', important: true },
  { text: '更新用户故事 #12', time: '5 小时前', important: false },
  { text: '添加新的接口定义', time: '昨天', important: false },
  { text: '需求评审会议记录', time: '2 天前', important: true },
  { text: '修改原型页面布局', time: '3 天前', important: false },
])

const heatmapData = ref<HeatmapData[]>(generateDemoData(24, 0.35))

function goToPhase(phaseId: string) {
  const routeMap: Record<string, string> = {
    requirements: 'requirements',
    prototype: 'prototype',
    tech: 'tech',
    tasks: 'tasks',
    retrospective: 'retrospective',
  }
  const routeName = routeMap[phaseId]
  if (routeName) {
    projectStore.setActivePhase(phaseId)
    void router.push({ name: routeName, params: { id: projectId.value } })
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '未知'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.overview-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.overview-header {
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
  color: var(--color-text-tertiary);
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

.content-grid {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: 0.75rem;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
