<template>
  <div class="overview">
    <!-- Topbar -->
    <div class="topbar">
      <div class="breadcrumb">
        <span class="bc-item">{{ project?.name }}</span>
        <span class="bc-sep">/</span>
        <span class="bc-current">概览</span>
      </div>
      <div class="topbar-actions">
        <button class="btn btn-ghost">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6C2 3.8 3.8 2 6 2C8.2 2 10 3.8 10 6"
              stroke="#6E7781"
              stroke-width="1"
            />
            <path d="M10 4L10 6L8 6" stroke="#6E7781" stroke-width="1" />
          </svg>
          同步状态
        </button>
        <RouterLink
          :to="{ name: 'requirements', params: { id: projectId } }"
          class="btn btn-primary"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1V11M1 6H11" stroke="white" stroke-width="1" />
          </svg>
          开始需求分析
        </RouterLink>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Project header -->
      <div class="project-header">
        <div class="project-title-row">
          <span class="project-title">{{ project?.name }}</span>
          <span class="phase-badge">{{ currentPhaseName }}</span>
        </div>
        <div class="project-meta">
          <span class="meta-item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#6E7781" stroke-width="1" />
              <path d="M6 3.5V6L7.5 7.5" stroke="#6E7781" stroke-width="1" />
            </svg>
            创建于 {{ formatDate(project?.createdAt) }}
          </span>
          <span class="meta-item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 8L5 4.5L7.5 6.5L11 3" stroke="#6E7781" stroke-width="1" />
            </svg>
            工作区：{{ workspacePath }}
          </span>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L5 6.5L7.5 8.5L10 4.5" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            阶段进度
          </div>
          <div class="stat-value">{{ completedPhases }}</div>
          <div class="stat-sub">共 5 个阶段</div>
          <div class="stat-progress">
            <div class="stat-bar" :style="{ width: `${(completedPhases / 5) * 100}%` }" />
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#B1BAC4" stroke-width="1" />
              <path d="M6 3.5V6L7.5 7.5" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            AI 模型
          </div>
          <div class="stat-value-sm">{{ modelLabel }}</div>
          <div class="stat-sub">当前使用</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9L5 6.5L7.5 8.5L10.5 2.5" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            Token 消耗
          </div>
          <div class="stat-value">0<span class="stat-unit">K</span></div>
          <div class="stat-sub">≈ ¥0.00</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2H10V8H7L6 10L5 8H2V2Z" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            提示词数
          </div>
          <div class="stat-value">0</div>
          <div class="stat-sub">暂无评分</div>
        </div>
      </div>

      <!-- Two column -->
      <div class="two-col">
        <!-- Description + phases -->
        <div class="desc-card">
          <div class="card-title">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2H9L11 4V11H2V2Z" stroke="#B1BAC4" stroke-width="1" />
              <path d="M9 2V4H11" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            项目阶段
          </div>
          <div class="phase-list">
            <div
              v-for="phase in phaseList"
              :key="phase.id"
              class="phase-item"
              :class="{ clickable: true }"
              @click="goToPhase(phase.id)"
            >
              <span class="phase-num">{{ phase.num }}</span>
              <span class="phase-name">{{ phase.name }}</span>
              <span class="phase-status" :class="getPhaseStatusClass(phase.id)">
                {{ getPhaseStatusLabel(phase.id) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Heatmap skeleton -->
        <div class="heatmap-card">
          <div class="card-title">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1.5" y="1.5" width="4" height="4" rx="0.5" stroke="#B1BAC4" stroke-width="1" />
              <rect x="7.5" y="1.5" width="4" height="4" rx="0.5" stroke="#B1BAC4" stroke-width="1" />
              <rect x="1.5" y="7.5" width="4" height="4" rx="0.5" stroke="#B1BAC4" stroke-width="1" />
              <rect x="7.5" y="7.5" width="4" height="4" rx="0.5" stroke="#B1BAC4" stroke-width="1" />
            </svg>
            活跃度热力图
            <span class="card-title-sub">过去 52 周</span>
          </div>
          <div class="heatmap-wrap">
            <div class="heatmap-grid">
              <div v-for="w in 52" :key="w" class="hm-col">
                <div
                  v-for="d in 7"
                  :key="d"
                  class="hm-cell"
                  :data-v="getHeatValue(w, d)"
                />
              </div>
            </div>
          </div>
          <div class="heatmap-footer">
            <span class="hm-count">0 次活动</span>
            <div class="hm-legend">
              <span>少</span>
              <div class="hm-legend-cell" style="background: #f0f2f5" />
              <div class="hm-legend-cell" style="background: #d0e8ff" />
              <div class="hm-legend-cell" style="background: #90c4ff" />
              <div class="hm-legend-cell" style="background: #4da3ff" />
              <div class="hm-legend-cell" style="background: #007aff" />
              <span>多</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="card-title" style="margin-bottom: 10px">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="#B1BAC4" stroke-width="1" />
          <path d="M6.5 3.5V6.5L8 8" stroke="#B1BAC4" stroke-width="1" />
        </svg>
        最近动态
      </div>
      <div v-if="activities.length > 0" class="activity-card">
        <div v-for="(act, i) in activities" :key="i" class="activity-row">
          <div class="activity-dot" :class="{ blue: act.important }" />
          <span class="activity-text">{{ act.text }}</span>
          <span class="activity-time">{{ act.time }}</span>
        </div>
      </div>
      <div v-else class="empty-activity">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
          <circle cx="16" cy="16" r="14" stroke="#B1BAC4" stroke-width="1.5" />
          <path d="M16 8V16L20 20" stroke="#B1BAC4" stroke-width="1.5" />
        </svg>
        <p>暂无活动记录</p>
        <p>开始需求分析后，活动将在这里显示</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
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
  if (!ws) return ''
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
  return Object.values(project.value.phases).filter((p) => p.status === 'completed').length
})

const currentPhaseName = computed(() => {
  if (!project.value) return '初始化'
  const inProgress = Object.entries(project.value.phases).find(([, v]) => v.status === 'in_progress')
  if (inProgress) {
    const labels: Record<string, string> = {
      requirements: '需求分析阶段',
      prototype: '原型设计阶段',
      tech: '技术选型阶段',
      tasks: '任务开发阶段',
      retrospective: '复盘总结阶段',
    }
    return labels[inProgress[0]] ?? '进行中'
  }
  if (completedPhases.value === 5) return '已完成'
  return '规划阶段'
})

const modelLabel = computed(() => {
  const model = project.value?.defaultModel ?? 'claude-sonnet-4-6'
  const labels: Record<string, string> = {
    'claude-sonnet-4-6': 'Sonnet 4.6',
    'claude-opus-4-6': 'Opus 4.6',
    'claude-haiku-4-5-20251001': 'Haiku 4.5',
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
  if (!project.value) return 'ps-todo'
  const phase = (project.value.phases as Record<string, { status: string }>)[phaseId]
  const classes: Record<string, string> = {
    not_started: 'ps-todo',
    in_progress: 'ps-active',
    completed: 'ps-done',
    locked: 'ps-done',
  }
  return classes[phase?.status ?? 'not_started'] ?? 'ps-todo'
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
    router.push({ name: routeName, params: { id: projectId.value } })
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '未知'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Activity placeholder
const activities = ref<Array<{ text: string; time: string; important: boolean }>>([])

// Heatmap - all empty for new project
function getHeatValue(_w: number, _d: number): number {
  return 0
}
</script>

<style scoped>
.overview {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  height: var(--topbar-height);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 8px;
  flex-shrink: 0;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.bc-sep {
  color: var(--text-3);
}
.bc-item {
  color: var(--text-2);
}
.bc-current {
  color: var(--text-1);
  font-weight: 500;
}
.topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

/* Project header */
.project-header {
  margin-bottom: 28px;
}
.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.project-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.5px;
}
.phase-badge {
  font-size: 11.5px;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}
.project-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12.5px;
  color: var(--text-2);
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.stat-card {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 18px 20px;
}
.stat-label {
  font-size: 11.5px;
  color: var(--text-2);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -1px;
  line-height: 1;
}
.stat-value-sm {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.4;
}
.stat-unit {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-2);
  margin-left: 2px;
}
.stat-sub {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 4px;
}
.stat-progress {
  margin-top: 10px;
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}
.stat-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* Two col */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* Description card */
.desc-card {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 20px;
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.card-title-sub {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 400;
  margin-left: 4px;
}
.phase-list {
  display: flex;
  flex-direction: column;
}
.phase-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.1s;
  border-radius: var(--r-xs);
  padding-left: 4px;
  padding-right: 4px;
}
.phase-item:last-child {
  border-bottom: none;
}
.phase-item:hover {
  background: var(--hover);
}
.phase-num {
  font-size: 11px;
  color: var(--text-3);
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}
.phase-name {
  flex: 1;
  color: var(--text-1);
}
.phase-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 500;
}
.ps-done {
  background: #ebf5ff;
  color: var(--accent);
}
.ps-active {
  background: #fff3e0;
  color: #e67e22;
}
.ps-todo {
  background: var(--surface);
  color: var(--text-3);
}

/* Heatmap */
.heatmap-card {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 20px;
}
.heatmap-wrap {
  overflow-x: auto;
  margin-bottom: 8px;
}
.heatmap-grid {
  display: flex;
  gap: 3px;
}
.hm-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hm-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  background: #f0f2f5;
}
.hm-cell[data-v='1'] {
  background: #d0e8ff;
}
.hm-cell[data-v='2'] {
  background: #90c4ff;
}
.hm-cell[data-v='3'] {
  background: #4da3ff;
}
.hm-cell[data-v='4'] {
  background: #007aff;
}
.heatmap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hm-count {
  font-size: 11px;
  color: var(--text-3);
}
.hm-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-3);
}
.hm-legend-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
}

/* Activity */
.activity-card {
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
}
.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.activity-row:last-child {
  border-bottom: none;
}
.activity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-3);
  flex-shrink: 0;
}
.activity-dot.blue {
  background: var(--accent);
}
.activity-text {
  flex: 1;
  color: var(--text-1);
}
.activity-time {
  font-size: 11.5px;
  color: var(--text-3);
}
.empty-activity {
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 40px 20px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
  line-height: 1.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
