<template>
  <section class="overview-page">
    <UiSurface tone="accent" class="overview-hero">
      <UiPageIntro :title="project?.name || '未命名项目'" eyebrow="Project Overview" :description="currentPhaseName + ' · 围绕需求、原型、技术方案、任务拆解和复盘，持续推进当前项目工作流。'">
        <template #meta>
          <span class="meta-chip">创建于 {{ formatDate(project?.createdAt) }}</span>
          <span class="meta-chip">工作区 {{ workspacePath }}</span>
        </template>
        <template #aside>
          <div class="hero-actions">
            <UiButton variant="secondary">同步状态</UiButton>
            <UiButton variant="primary" :to="{ name: 'requirements', params: { id: projectId } }">开始需求分析</UiButton>
          </div>
        </template>
      </UiPageIntro>
    </UiSurface>

    <section class="stats-grid">
      <UiSurface tone="accent" class="stat-card">
        <div class="stat-label">阶段进度</div>
        <div class="stat-value">{{ completedPhases }}/5</div>
        <div class="stat-sub">已完成 {{ completedPhases }} 个阶段</div>
        <div class="progress-track"><div class="progress-bar" :style="{ width: `${(completedPhases / 5) * 100}%` }" /></div>
      </UiSurface>
      <UiSurface class="stat-card"><div class="stat-label">默认模型</div><div class="stat-value small">{{ modelLabel }}</div><div class="stat-sub">当前项目默认配置</div></UiSurface>
      <UiSurface class="stat-card"><div class="stat-label">Token 消耗</div><div class="stat-value">0K</div><div class="stat-sub">尚未开始执行</div></UiSurface>
      <UiSurface class="stat-card"><div class="stat-label">提示词资产</div><div class="stat-value">0</div><div class="stat-sub">等待阶段内容沉淀</div></UiSurface>
    </section>

    <section class="content-grid">
      <UiSurface>
        <div class="section-label">项目阶段</div>
        <div class="phase-list">
          <button v-for="phase in phaseList" :key="phase.id" class="phase-item" type="button" @click="goToPhase(phase.id)">
            <span class="phase-index">{{ phase.num }}</span>
            <span class="phase-name">{{ phase.name }}</span>
            <UiStatusBadge :tone="getPhaseTone(phase.id)">{{ getPhaseStatusLabel(phase.id) }}</UiStatusBadge>
          </button>
        </div>
      </UiSurface>

      <UiSurface>
        <div class="section-label">活跃热力图</div>
        <div class="heatmap-wrap">
          <div class="heatmap-grid">
            <div v-for="w in 24" :key="w" class="heatmap-column">
              <div v-for="d in 7" :key="d" class="heatmap-cell" :data-v="getHeatValue(w, d)" />
            </div>
          </div>
        </div>
        <div class="legend-row">
          <span>最近 24 周暂未产生操作记录</span>
          <div class="legend-scale">
            <span>少</span><i class="legend-box level-0" /><i class="legend-box level-1" /><i class="legend-box level-2" /><i class="legend-box level-3" /><i class="legend-box level-4" /><span>多</span>
          </div>
        </div>
      </UiSurface>
    </section>

    <UiSurface>
      <div class="section-label">最近动态</div>
      <div v-if="activities.length > 0" class="activity-list">
        <div v-for="(act, i) in activities" :key="i" class="activity-item">
          <span class="activity-dot" :class="{ important: act.important }" />
          <span class="activity-text">{{ act.text }}</span>
          <span class="activity-time">{{ act.time }}</span>
        </div>
      </div>
      <div v-else class="activity-empty"><strong>还没有项目动态</strong><p>开始需求分析后，这里会汇总最近的生成、编辑和阶段推进记录。</p></div>
    </UiSurface>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import UiPageIntro from '@/components/ui/UiPageIntro.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import { useProjectStore } from '@/stores/project.ts'
import { useWorkspaceStore } from '@/stores/workspace.ts'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectStore.currentProject)
const workspacePath = computed(() => {
  const ws = workspaceStore.currentWorkspace
  if (!ws) return '未选择工作区'
  const parts = ws.path.split(/[/\\]/).filter(Boolean)
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : ws.path
})

const phaseList = [
  { id: 'requirements', name: '需求分析', num: '01' },
  { id: 'prototype', name: '原型设计', num: '02' },
  { id: 'tech', name: '技术选型', num: '03' },
  { id: 'tasks', name: '任务开发', num: '04' },
  { id: 'retrospective', name: '复盘总结', num: '05' },
]

const completedPhases = computed(() => !project.value ? 0 : Object.values(project.value.phases).filter((phase) => phase.status === 'completed').length)

const currentPhaseName = computed(() => {
  if (!project.value) return '初始化中'
  const inProgress = Object.entries(project.value.phases).find(([, phase]) => phase.status === 'in_progress')
  if (inProgress) {
    const labels: Record<string, string> = { requirements: '需求分析进行中', prototype: '原型设计进行中', tech: '技术选型进行中', tasks: '任务开发进行中', retrospective: '复盘总结进行中' }
    return labels[inProgress[0]] ?? '进行中'
  }
  if (completedPhases.value === 5) return '项目已完成'
  return '规划阶段'
})

const modelLabel = computed(() => {
  const model = project.value?.defaultModel ?? 'claude-sonnet-4-6'
  const labels: Record<string, string> = { 'claude-sonnet-4-6': 'Claude Sonnet 4.6', 'claude-opus-4-6': 'Claude Opus 4.6', 'claude-haiku-4-5-20251001': 'Claude Haiku 4.5' }
  return labels[model] ?? model
})

function getPhaseStatusLabel(phaseId: string): string {
  if (!project.value) return '待开始'
  const phase = (project.value.phases as Record<string, { status: string }>)[phaseId]
  const labels: Record<string, string> = { not_started: '待开始', in_progress: '进行中', completed: '已完成', locked: '已锁定' }
  return labels[phase?.status ?? 'not_started'] ?? '待开始'
}

function getPhaseTone(phaseId: string): 'neutral' | 'info' | 'success' | 'warning' {
  if (!project.value) return 'neutral'
  const phase = (project.value.phases as Record<string, { status: string }>)[phaseId]
  if (phase?.status === 'completed' || phase?.status === 'locked') return 'success'
  if (phase?.status === 'in_progress') return 'warning'
  return 'neutral'
}

function goToPhase(phaseId: string) {
  const routeMap: Record<string, string> = { requirements: 'requirements', prototype: 'prototype', tech: 'tech', tasks: 'tasks', retrospective: 'retrospective' }
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

const activities = ref<Array<{ text: string; time: string; important: boolean }>>([])
function getHeatValue(_w: number, _d: number): number { return 0 }
</script>

<style scoped>
.overview-page { display: flex; flex-direction: column; gap: 1.125rem; }
.overview-hero { padding: 1.5rem; }
.meta-chip {
  display: inline-flex; align-items: center; padding: 0.5rem 0.8rem; border-radius: var(--radius-pill); background: color-mix(in oklab, var(--color-surface-soft) 78%, white 22%); border: 1px solid var(--color-border-soft); color: var(--color-text-secondary); font-size: 0.75rem;
}
.hero-actions { display: flex; flex-direction: column; gap: 0.6rem; min-width: 11rem; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.stat-card { min-height: 9.8rem; }
.stat-label, .section-label { margin-bottom: 0.65rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-tertiary); }
.stat-value { font-size: 2.1rem; font-weight: 700; letter-spacing: -0.05em; line-height: 1; }
.stat-value.small { font-size: 1.2rem; line-height: 1.2; }
.stat-sub { margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-text-secondary); }
.progress-track { margin-top: 1rem; height: 0.38rem; border-radius: var(--radius-pill); background: var(--color-border-soft); overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--color-accent), color-mix(in oklab, var(--color-accent) 55%, white 45%)); }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.phase-list { display: flex; flex-direction: column; gap: 0.75rem; }
.phase-item { width: 100%; display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem; border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); background: var(--color-surface-raised); cursor: pointer; }
.phase-index { width: 1.8rem; color: var(--color-text-tertiary); font-size: 0.75rem; font-weight: 700; }
.phase-name { flex: 1; text-align: left; font-weight: 700; }
.heatmap-wrap { overflow: auto; }
.heatmap-grid { display: flex; gap: 0.25rem; }
.heatmap-column { display: flex; flex-direction: column; gap: 0.25rem; }
.heatmap-cell, .legend-box { width: 0.75rem; height: 0.75rem; border-radius: 0.2rem; background: #eef2f6; }
.heatmap-cell[data-v='1'], .legend-box.level-1 { background: #d0e8ff; }
.heatmap-cell[data-v='2'], .legend-box.level-2 { background: #90c4ff; }
.heatmap-cell[data-v='3'], .legend-box.level-3 { background: #4da3ff; }
.heatmap-cell[data-v='4'], .legend-box.level-4 { background: #007aff; }
.legend-row { margin-top: 0.9rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.75rem; color: var(--color-text-secondary); }
.legend-scale { display: flex; align-items: center; gap: 0.35rem; }
.activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
.activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem; border-radius: var(--radius-lg); background: var(--color-surface-soft); }
.activity-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--color-text-tertiary); }
.activity-dot.important { background: var(--color-accent); }
.activity-text { flex: 1; color: var(--color-text-primary); }
.activity-time { font-size: 0.75rem; color: var(--color-text-tertiary); }
.activity-empty { min-height: 8.75rem; display: grid; place-items: center; text-align: center; color: var(--color-text-secondary); }
.activity-empty p { margin-top: 0.45rem; max-width: 26rem; line-height: 1.6; }
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .content-grid { grid-template-columns: 1fr; } }
@media (max-width: 720px) { .stats-grid { grid-template-columns: 1fr; } .legend-row { flex-direction: column; align-items: flex-start; } }
</style>
