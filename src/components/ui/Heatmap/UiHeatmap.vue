<template>
  <div class="ui-heatmap">
    <div class="ui-heatmap__grid">
      <div v-for="(column, wIdx) in gridData" :key="wIdx" class="ui-heatmap__column">
        <div
          v-for="(cell, dIdx) in column"
          :key="dIdx"
          class="ui-heatmap__cell"
          :class="getCellClass(cell)"
          :title="getTooltip(wIdx, dIdx, cell)"
        />
      </div>
    </div>

    <div v-if="showLegend" class="ui-heatmap__legend">
      <span class="ui-heatmap__legend-label">{{ hasData ? '' : emptyText }}</span>
      <div class="ui-heatmap__legend-scale">
        <span>少</span>
        <i
          v-for="level in 5"
          :key="level"
          class="ui-heatmap__legend-box"
          :class="`ui-heatmap__legend-box--level-${level - 1}`"
        />
        <span>多</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface HeatmapData {
  /** 周索引 (0-weeks) */
  week: number
  /** 天索引 (0-6) */
  day: number
  /** 活跃度等级 (0-4) */
  level: number
  /** 可选的日期字符串，用于 tooltip */
  date?: string
  /** 可选的数值，用于 tooltip */
  value?: number
}

const props = withDefaults(
  defineProps<{
    /** 热力图数据 */
    data: HeatmapData[]
    /** 显示的周数 */
    weeks?: number
    /** 每周的天数 */
    daysPerWeek?: number
    /** 等级数量 */
    levels?: number
    /** 是否显示图例 */
    showLegend?: boolean
    /** 空数据时的提示文本 */
    emptyText?: string
    /** 值的单位，用于 tooltip */
    valueUnit?: string
    /** 颜色主题 */
    theme?: 'blue' | 'green' | 'orange'
  }>(),
  {
    weeks: 24,
    daysPerWeek: 7,
    levels: 5,
    showLegend: true,
    emptyText: '暂无数据',
    valueUnit: '次',
    theme: 'blue',
  },
)

const gridData = computed(() => {
  const grid: number[][] = []
  for (let w = 0; w < props.weeks; w++) {
    const column: number[] = []
    for (let d = 0; d < props.daysPerWeek; d++) {
      const cell = props.data.find((item) => item.week === w && item.day === d)
      column.push(cell?.level ?? 0)
    }
    grid.push(column)
  }
  return grid
})

const hasData = computed(() => props.data.length > 0)

function getCellClass(level: number): string {
  return `ui-heatmap__cell--level-${Math.min(level, props.levels - 1)}`
}

function getTooltip(week: number, day: number, level: number): string {
  const cell = props.data.find((item) => item.week === week && item.day === day)
  if (!cell || level === 0) {
    return '无活动'
  }
  const dateStr = cell.date ? `${cell.date}: ` : ''
  const valueStr = cell.value !== undefined ? `${cell.value} ${props.valueUnit}` : `${level} 级活跃度`
  return `${dateStr}${valueStr}`
}
</script>

<style scoped>
.ui-heatmap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ui-heatmap__grid {
  display: flex;
  gap: 0.2rem;
  overflow: auto;
}

.ui-heatmap__column {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ui-heatmap__cell {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 0.15rem;
  background: var(--color-surface-soft);
  transition: transform 0.1s ease;
}

.ui-heatmap__cell:hover {
  transform: scale(1.2);
}

/* Blue theme (default) */
.ui-heatmap__cell--level-1 { background: #d0e8ff; }
.ui-heatmap__cell--level-2 { background: #90c4ff; }
.ui-heatmap__cell--level-3 { background: #4da3ff; }
.ui-heatmap__cell--level-4 { background: var(--color-accent); }

/* Green theme */
.ui-heatmap--theme-green .ui-heatmap__cell--level-1 { background: #d1f4e0; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-2 { background: #8ee6b0; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-3 { background: #4ac97f; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-4 { background: #2a9d5c; }

/* Orange theme */
.ui-heatmap--theme-orange .ui-heatmap__cell--level-1 { background: #ffe4cc; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-2 { background: #ffb880; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-3 { background: #ff8c4d; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-4 { background: #e65c00; }

.ui-heatmap__legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
}

.ui-heatmap__legend-label {
  flex: 1;
}

.ui-heatmap__legend-scale {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ui-heatmap__legend-box {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 0.15rem;
  background: var(--color-surface-soft);
}

.ui-heatmap__legend-box--level-1 { background: #d0e8ff; }
.ui-heatmap__legend-box--level-2 { background: #90c4ff; }
.ui-heatmap__legend-box--level-3 { background: #4da3ff; }
.ui-heatmap__legend-box--level-4 { background: var(--color-accent); }
</style>
