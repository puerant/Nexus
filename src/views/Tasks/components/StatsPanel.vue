<template>
  <aside class="stats-panel">
    <!-- 标题 -->
    <div class="sp-title">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="3.5" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1" />
        <rect x="6" y="1.5" width="3.5" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1" />
        <rect x="1.5" y="6" width="3.5" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1" />
        <rect x="6" y="6" width="3.5" height="3.5" rx="0.5" stroke="currentColor" stroke-width="1" />
      </svg>
      任务完成热力图
    </div>

    <!-- 热力图 -->
    <div class="heatmap-grid">
      <div v-for="(_, wi) in 20" :key="wi" class="hm-col">
        <div
          v-for="(_, di) in 7"
          :key="di"
          class="hm-cell"
          :class="getCellClass(wi, di)"
        />
      </div>
    </div>

    <!-- 图例 -->
    <div class="hm-legend">
      <span>少</span>
      <div class="hm-legend-cell" style="background: var(--surface)" />
      <div class="hm-legend-cell" style="background: oklch(0.88 0.06 252)" />
      <div class="hm-legend-cell" style="background: oklch(0.72 0.12 252)" />
      <div class="hm-legend-cell" style="background: var(--accent)" />
      <span>多</span>
    </div>

    <!-- 统计卡片 -->
    <div class="sp-stats">
      <div class="sp-stat">
        <div class="sp-stat-val">{{ store.totalTasks }}</div>
        <div class="sp-stat-label">总任务数</div>
      </div>
      <div class="sp-stat">
        <div class="sp-stat-val accent">{{ store.completedCount }}</div>
        <div class="sp-stat-label">已完成</div>
        <div class="sp-stat-sub">占比 {{ store.completionRate }}%</div>
      </div>
      <div class="sp-stat">
        <div class="sp-stat-val warning">{{ store.inProgressCount }}</div>
        <div class="sp-stat-label">进行中</div>
      </div>
      <div class="sp-stat">
        <div class="sp-stat-val">{{ store.todoCount }}</div>
        <div class="sp-stat-label">待开始</div>
      </div>
    </div>

    <!-- 总工时 / Token -->
    <div class="sp-summary">
      <div class="sp-summary-row">
        <span class="sp-summary-label">预估总工时</span>
        <span class="sp-summary-val">{{ store.formatHoursMinutes(store.totalEstimatedHours) }}</span>
      </div>
      <div class="sp-summary-row">
        <span class="sp-summary-label">实际总工时</span>
        <span class="sp-summary-val">{{ store.formatHoursMinutes(store.totalActualHours) }}</span>
      </div>
      <div class="sp-summary-row">
        <span class="sp-summary-label">Token 消耗</span>
        <span class="sp-summary-val">{{ formatTokenCount(store.totalTokensUsed) }}</span>
      </div>
    </div>

    <!-- 按优先级分布 -->
    <div class="sp-progress-title">按优先级分布</div>
    <div class="prog-row">
      <span class="prog-label danger">高</span>
      <div class="prog-bar-wrap">
        <div
          class="prog-bar"
          :style="{ width: barWidth(store.highPriorityCount), background: 'var(--danger)' }"
        />
      </div>
      <span class="prog-count">{{ store.highPriorityCount }}</span>
    </div>
    <div class="prog-row">
      <span class="prog-label warning">中</span>
      <div class="prog-bar-wrap">
        <div
          class="prog-bar"
          :style="{ width: barWidth(store.mediumPriorityCount), background: 'var(--warning)' }"
        />
      </div>
      <span class="prog-count">{{ store.mediumPriorityCount }}</span>
    </div>
    <div class="prog-row">
      <span class="prog-label">低</span>
      <div class="prog-bar-wrap">
        <div
          class="prog-bar"
          :style="{ width: barWidth(store.lowPriorityCount), background: 'var(--text-3)' }"
        />
      </div>
      <span class="prog-count">{{ store.lowPriorityCount }}</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/stores/tasks'

const store = useTasksStore()

// 生成确定性热力图数据（基于 seed）
const heatmapData: number[][] = []
let seed = 42
function seededRandom(): number {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
for (let w = 0; w < 20; w++) {
  const col: number[] = []
  for (let d = 0; d < 7; d++) {
    const r = seededRandom()
    col.push(r < 0.45 ? 0 : r < 0.63 ? 1 : r < 0.78 ? 2 : r < 0.9 ? 3 : 4)
  }
  heatmapData.push(col)
}

function getCellClass(wi: number, di: number): string {
  const v = heatmapData[wi]?.[di] ?? 0
  if (v === 0) return ''
  return `hm-v-${v}`
}

function barWidth(count: number): string {
  const max = Math.max(store.highPriorityCount, store.mediumPriorityCount, store.lowPriorityCount, 1)
  return `${Math.max((count / max) * 100, 4)}%`
}

function formatTokenCount(tokens: number): string {
  if (tokens === 0) return '—'
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return String(tokens)
}
</script>

<style scoped>
.stats-panel {
  width: 300px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 1.25rem;
  background: var(--bg);
}

.sp-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 热力图 */
.heatmap-grid {
  display: flex;
  gap: 3px;
  margin-bottom: 0.5rem;
}

.hm-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hm-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--surface);
}

.hm-v-1 { background: oklch(0.92 0.04 252); }
.hm-v-2 { background: oklch(0.82 0.08 252); }
.hm-v-3 { background: oklch(0.68 0.14 252); }
.hm-v-4 { background: var(--accent); }

.hm-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  color: var(--text-3);
  margin-bottom: 1.25rem;
}

.hm-legend-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

/* 统计卡片 */
.sp-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.sp-stat {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.875rem;
}

.sp-stat-val {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.5px;
  line-height: 1;
}

.sp-stat-val.accent { color: var(--accent); }
.sp-stat-val.warning { color: var(--warning); }

.sp-stat-label {
  font-size: 0.6875rem;
  color: var(--text-2);
  margin-top: 0.25rem;
}

.sp-stat-sub {
  font-size: 0.625rem;
  color: var(--text-3);
  margin-top: 0.125rem;
}

/* 工时 / Token 汇总 */
.sp-summary {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  margin-bottom: 1.25rem;
}

.sp-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.sp-summary-row + .sp-summary-row {
  border-top: 1px solid var(--border);
  margin-top: 0.25rem;
  padding-top: 0.375rem;
}

.sp-summary-label {
  font-size: 0.75rem;
  color: var(--text-2);
}

.sp-summary-val {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-1);
}

/* 优先级分布 */
.sp-progress-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 0.625rem;
}

.prog-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
}

.prog-label {
  font-size: 0.75rem;
  color: var(--text-2);
  width: 1.75rem;
}

.prog-label.danger { color: var(--danger); }
.prog-label.warning { color: var(--warning); }

.prog-bar-wrap {
  flex: 1;
  height: 5px;
  background: var(--surface);
  border-radius: 3px;
  overflow: hidden;
}

.prog-bar {
  height: 100%;
  border-radius: 3px;
  opacity: 0.75;
  transition: width 0.3s ease;
}

.prog-count {
  font-size: 0.75rem;
  color: var(--text-3);
  width: 1.5rem;
  text-align: right;
}
</style>
