<template>
  <div class="ui-heatmap" :class="[`ui-heatmap--size-${cellSize}`, { 'ui-heatmap--stretch': stretch }]">
    <div class="ui-heatmap__header">
      <div class="ui-heatmap__weekday-labels"></div>
      <div class="ui-heatmap__months">
        <span v-for="(month, idx) in monthLabels" :key="idx" class="ui-heatmap__month" :style="month.style">
          {{ month.label }}
        </span>
      </div>
    </div>

    <div class="ui-heatmap__body">
      <div class="ui-heatmap__weekdays">
        <span v-for="(day, idx) in weekdayLabels" :key="idx" class="ui-heatmap__weekday">{{ day }}</span>
      </div>

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
    </div>

    <div v-if="showLegend" class="ui-heatmap__legend">
      <span class="ui-heatmap__legend-label">{{ hasData ? '' : emptyText }}</span>
      <div class="ui-heatmap__legend-scale">
        <span>少</span>
        <i class="ui-heatmap__legend-box ui-heatmap__legend-box--level-0" />
        <i class="ui-heatmap__legend-box ui-heatmap__legend-box--level-1" />
        <i class="ui-heatmap__legend-box ui-heatmap__legend-box--level-2" />
        <i class="ui-heatmap__legend-box ui-heatmap__legend-box--level-3" />
        <i class="ui-heatmap__legend-box ui-heatmap__legend-box--level-4" />
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
    /** 是否拉伸填满容器 */
    stretch?: boolean
    /** 单元格尺寸 */
    cellSize?: 'sm' | 'md' | 'lg'
  }>(),
  {
    weeks: 24,
    daysPerWeek: 7,
    levels: 5,
    showLegend: true,
    emptyText: '暂无数据',
    valueUnit: '次',
    theme: 'blue',
    stretch: false,
    cellSize: 'sm',
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

// 星期标签 (只显示周一、三、五)
const weekdayLabels = ['一', '', '三', '', '五', '', '']

// 月份标签
const monthLabels = computed(() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const result: Array<{ label: string; style: Record<string, string> }> = []
  const now = new Date()
  let lastMonth = -1

  for (let w = 0; w < props.weeks; w++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (props.weeks - 1 - w) * 7)
    const month = date.getMonth()

    if (month !== lastMonth) {
      const offset = (w / props.weeks) * 100
      result.push({
        label: months[month],
        style: { left: `${offset}%` },
      })
      lastMonth = month
    }
  }

  return result
})

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
  gap: 0.25rem;
}

.ui-heatmap__header {
  display: flex;
  padding-left: 1.5rem;
}

.ui-heatmap__weekday-labels {
  width: 1.5rem;
  flex-shrink: 0;
}

.ui-heatmap__months {
  flex: 1;
  position: relative;
  height: 1rem;
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
}

.ui-heatmap__month {
  position: absolute;
  white-space: nowrap;
}

.ui-heatmap__body {
  display: flex;
  gap: 0.25rem;
}

.ui-heatmap__weekdays {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 1.5rem;
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.ui-heatmap__weekday {
  height: 0.625rem;
  line-height: 0.625rem;
  font-size: 0.5625rem;
  color: var(--color-text-tertiary);
  text-align: right;
  padding-right: 0.25rem;
}

.ui-heatmap__grid {
  display: flex;
  gap: 0.2rem;
  overflow: auto;
  flex: 1;
}

/* Stretch mode: 填满容器宽度 */
.ui-heatmap--stretch .ui-heatmap__grid {
  justify-content: space-between;
}

.ui-heatmap--stretch .ui-heatmap__column {
  flex: 1;
  align-items: center;
}

.ui-heatmap__column {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ui-heatmap__cell {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 0.125rem;
  border: 1px solid transparent;
  transition: transform 0.1s ease, border-color 0.1s ease;
}

/* Level 0: 无数据 - 显示边框 */
.ui-heatmap__cell--level-0 {
  background: transparent;
  border-color: rgba(13, 17, 23, 0.08);
}

/* Cell sizes */
.ui-heatmap--size-sm .ui-heatmap__cell {
  width: 0.625rem;
  height: 0.625rem;
}

.ui-heatmap--size-md .ui-heatmap__cell {
  width: 0.875rem;
  height: 0.875rem;
}

.ui-heatmap--size-lg .ui-heatmap__cell {
  width: 1.125rem;
  height: 1.125rem;
}

/* Weekday sizes */
.ui-heatmap--size-sm .ui-heatmap__weekday {
  height: 0.625rem;
  line-height: 0.625rem;
}

.ui-heatmap--size-md .ui-heatmap__weekday {
  height: 0.875rem;
  line-height: 0.875rem;
}

.ui-heatmap--size-lg .ui-heatmap__weekday {
  height: 1.125rem;
  line-height: 1.125rem;
}

.ui-heatmap__cell:hover {
  transform: scale(1.15);
}

/* Blue theme (default) */
.ui-heatmap__cell--level-1 { background: #d0e8ff; border-color: #b8dcff; }
.ui-heatmap__cell--level-2 { background: #90c4ff; border-color: #78b8ff; }
.ui-heatmap__cell--level-3 { background: #4da3ff; border-color: #3597ff; }
.ui-heatmap__cell--level-4 { background: var(--color-accent); border-color: var(--color-accent); }

/* Green theme */
.ui-heatmap--theme-green .ui-heatmap__cell--level-1 { background: #d1f4e0; border-color: #b9eed0; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-2 { background: #8ee6b0; border-color: #76e0a0; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-3 { background: #4ac97f; border-color: #32bd6f; }
.ui-heatmap--theme-green .ui-heatmap__cell--level-4 { background: #2a9d5c; border-color: #2a9d5c; }

/* Orange theme */
.ui-heatmap--theme-orange .ui-heatmap__cell--level-1 { background: #ffe4cc; border-color: #ffd8b8; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-2 { background: #ffb880; border-color: #ffac6c; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-3 { background: #ff8c4d; border-color: #ff8039; }
.ui-heatmap--theme-orange .ui-heatmap__cell--level-4 { background: #e65c00; border-color: #e65c00; }

.ui-heatmap__legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-left: 1.5rem;
  margin-top: 0.25rem;
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
  border-radius: 0.125rem;
}

/* Legend box sizes */
.ui-heatmap--size-sm .ui-heatmap__legend-box {
  width: 0.625rem;
  height: 0.625rem;
}

.ui-heatmap--size-md .ui-heatmap__legend-box {
  width: 0.875rem;
  height: 0.875rem;
}

.ui-heatmap--size-lg .ui-heatmap__legend-box {
  width: 1.125rem;
  height: 1.125rem;
}

.ui-heatmap__legend-box--level-0 { background: transparent; border: 1px solid rgba(13, 17, 23, 0.08); }
.ui-heatmap__legend-box--level-1 { background: #d0e8ff; }
.ui-heatmap__legend-box--level-2 { background: #90c4ff; }
.ui-heatmap__legend-box--level-3 { background: #4da3ff; }
.ui-heatmap__legend-box--level-4 { background: var(--color-accent); }
</style>
