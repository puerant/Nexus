<template>
  <section class="overview-page">
    <header class="overview-hero surface-card surface-card-hero">
      <div>
        <div class="eyebrow">Project Overview</div>
        <h2>{{ project?.name || '未命名项目' }}</h2>
        <p class="hero-copy">{{ currentPhaseName }} · 围绕需求、原型、技术方案、任务拆解和复盘，持续推进当前项目工作流。</p>

        <div class="hero-meta">
          <span class="meta-chip">创建于 {{ formatDate(project?.createdAt) }}</span>
          <span class="meta-chip">工作区 {{ workspacePath }}</span>
        </div>
      </div>

      <div class="hero-actions">
        <button class="ghost-btn" type="button">同步状态</button>
        <RouterLink :to="{ name: 'requirements', params: { id: projectId } }" class="btn btn-primary">
          开始需求分析
        </RouterLink>
      </div>
    </header>

    <section class="stats-grid">
      <article class="surface-card stat-card accent-card">
        <div class="stat-label">阶段进度</div>
        <div class="stat-value">{{ completedPhases }}/5</div>
        <div class="stat-sub">已完成 {{ completedPhases }} 个阶段</div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${(completedPhases / 5) * 100}%` }" />
        </div>
      </article>

      <article class="surface-card stat-card">
        <div class="stat-label">默认模型</div>
        <div class="stat-value small">{{ modelLabel }}</div>
        <div class="stat-sub">当前项目默认配置</div>
      </article>

      <article class="surface-card stat-card">
        <div class="stat-label">Token 消耗</div>
        <div class="stat-value">0K</div>
        <div class="stat-sub">尚未开始执行</div>
      </article>

      <article class="surface-card stat-card">
        <div class="stat-label">提示词资产</div>
        <div class="stat-value">0</div>
        <div class="stat-sub">等待阶段内容沉淀</div>
      </article>
    </section>

    <section class="content-grid">
      <article class="surface-card phases-card">
        <div class="section-title">项目阶段</div>
        <div class="phase-list">
          <button v-for="phase in phaseList" :key="phase.id" class="phase-item" type="button" @click="goToPhase(phase.id)">
            <span class="phase-index">{{ phase.num }}</span>
            <span class="phase-name">{{ phase.name }}</span>
            <span class="phase-status" :class="getPhaseStatusClass(phase.id)">{{ getPhaseStatusLabel(phase.id) }}</span>
          </button>
        </div>
      </article>

      <article class="surface-card heatmap-card">
        <div class="section-title">活跃热力图</div>
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
            <span>少</span>
            <i class="legend-box level-0" />
            <i class="legend-box level-1" />
            <i class="legend-box level-2" />
            <i class="legend-box level-3" />
            <i class="legend-box level-4" />
            <span>多</span>
          </div>
        </div>
      </article>
    </section>

    <article class="surface-card activity-card">
      <div class="section-title">最近动态</div>
      <div v-if="activities.length > 0" class="activity-list">
        <div v-for="(act, i) in activities" :key="i" class="activity-item">
          <span class="activity-dot" :class="{ important: act.important }" />
          <span class="activity-text">{{ act.text }}</span>
          <span class="activity-time">{{ act.time }}</span>
        </div>
      </div>
      <div v-else class="activity-empty">
        <strong>还没有项目动态</strong>
        <p>开始需求分析后，这里会汇总最近的生成、编辑和阶段推进记录。</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'

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

const completedPhases = computed(() => {
  if (!project.value) return 0
  return Object.values(project.value.phases).filter((phase) => phase.status === 'completed').length
})

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

function getPhaseStatusLabel(phaseId: string): string {
  if (!project.value) return '待开始'
  const phase = (project.value.phases as Record<string, { status: string }>)[phaseId]
  const labels: Record<string, string> = {
    not_started: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    locked: '已锁定',
  }
  return labels[phase?.status ?? 'not_started'] ?? '待开始'
}

function getPhaseStatusClass(phaseId: string): string {
  if (!project.value) return 'status-todo'
  const phase = (project.value.phases as Record<string, { status: string }>)[phaseId]
  const classes: Record<string, string> = {
    not_started: 'status-todo',
    in_progress: 'status-active',
    completed: 'status-done',
    locked: 'status-done',
  }
  return classes[phase?.status ?? 'not_started'] ?? 'status-todo'
}

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

const activities = ref<Array<{ text: string; time: string; important: boolean }>>([])

function getHeatValue(_w: number, _d: number): number {
  return 0
}
</script>

<style scoped>
.overview-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.surface-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.surface-card-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
}

.eyebrow,
.section-title,
.stat-label {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--accent);
  margin-bottom: 12px;
}

.section-title,
.stat-label {
  color: var(--text-3);
  margin-bottom: 10px;
}

h2 {
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 10px;
}

.hero-copy {
  max-width: 680px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-2);
}

.hero-meta {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(13, 17, 23, 0.06);
  color: var(--text-2);
  font-size: 12px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 180px;
}

.ghost-btn {
  padding: 8px 14px;
  font-size: 12px;
  border: 1px solid rgba(13, 17, 23, 0.08);
  background: white;
  color: var(--text-1);
  border-radius: 999px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  min-height: 158px;
}

.accent-card {
  background: linear-gradient(180deg, rgba(235, 245, 255, 0.92), rgba(255, 255, 255, 0.92));
}

.stat-value {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1;
}

.stat-value.small {
  font-size: 20px;
  line-height: 1.2;
}

.stat-sub {
  margin-top: 8px;
  color: var(--text-2);
  font-size: 12px;
}

.progress-track {
  margin-top: 16px;
  height: 6px;
  border-radius: 999px;
  background: rgba(13, 17, 23, 0.08);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007aff 0%, #71a7ff 100%);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.phase-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.phase-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(13, 17, 23, 0.06);
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease;
}

.phase-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.18);
  box-shadow: 0 12px 30px rgba(0, 122, 255, 0.08);
}

.phase-index {
  width: 28px;
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
}

.phase-name {
  flex: 1;
  text-align: left;
  font-weight: 600;
  color: var(--text-1);
}

.phase-status {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-done {
  background: rgba(0, 122, 255, 0.1);
  color: var(--accent);
}

.status-active {
  background: rgba(254, 188, 46, 0.16);
  color: #a36800;
}

.status-todo {
  background: rgba(13, 17, 23, 0.06);
  color: var(--text-3);
}

.heatmap-wrap {
  overflow: auto;
}

.heatmap-grid {
  display: flex;
  gap: 4px;
}

.heatmap-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-cell,
.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #eef2f6;
}

.heatmap-cell[data-v='1'],
.legend-box.level-1 {
  background: #d0e8ff;
}

.heatmap-cell[data-v='2'],
.legend-box.level-2 {
  background: #90c4ff;
}

.heatmap-cell[data-v='3'],
.legend-box.level-3 {
  background: #4da3ff;
}

.heatmap-cell[data-v='4'],
.legend-box.level-4 {
  background: #007aff;
}

.legend-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-2);
  font-size: 12px;
}

.legend-scale {
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(13, 17, 23, 0.06);
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-3);
}

.activity-dot.important {
  background: var(--accent);
}

.activity-text {
  flex: 1;
  color: var(--text-1);
}

.activity-time {
  color: var(--text-3);
  font-size: 12px;
}

.activity-empty {
  min-height: 140px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--text-2);
}

.activity-empty p {
  max-width: 420px;
  margin-top: 8px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid,
  .surface-card-hero {
    grid-template-columns: 1fr;
    display: grid;
  }
}

@media (max-width: 720px) {
  .surface-card {
    padding: 18px;
    border-radius: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .legend-row,
  .hero-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
