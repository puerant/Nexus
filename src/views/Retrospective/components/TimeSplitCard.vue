<template>
  <UiSurface padding="md" rounded="lg">
    <div class="section-label">工时分布</div>
    <div class="time-rows">
      <div class="time-row">
        <div class="time-row-head">
          <span class="time-dot total" />
          <span class="time-label">总任务用时</span>
        </div>
        <div class="time-value">{{ formatTime(timeSplit.total) }}</div>
        <div class="time-bar-wrap">
          <div class="time-bar total" :style="{ width: '100%' }" />
        </div>
      </div>
      <div class="time-row">
        <div class="time-row-head">
          <span class="time-dot manual" />
          <span class="time-label">人工任务用时</span>
        </div>
        <div class="time-value">{{ formatTime(timeSplit.manual) }}</div>
        <div class="time-bar-wrap">
          <div
            class="time-bar manual"
            :style="{ width: percent(timeSplit.manual, timeSplit.total) + '%' }"
          />
        </div>
        <div class="time-percent">{{ percent(timeSplit.manual, timeSplit.total) }}%</div>
      </div>
      <div class="time-row">
        <div class="time-row-head">
          <span class="time-dot ai" />
          <span class="time-label">Agent 任务用时</span>
        </div>
        <div class="time-value">{{ formatTime(timeSplit.ai) }}</div>
        <div class="time-bar-wrap">
          <div
            class="time-bar ai"
            :style="{ width: percent(timeSplit.ai, timeSplit.total) + '%' }"
          />
        </div>
        <div class="time-percent">{{ percent(timeSplit.ai, timeSplit.total) }}%</div>
      </div>
    </div>
  </UiSurface>
</template>

<script setup lang="ts">
import UiSurface from '@/components/ui/UiSurface.vue'

export interface TimeSplitData {
  total: number
  manual: number
  ai: number
}

defineProps<{
  timeSplit: TimeSplitData
}>()

function formatTime(hours: number): string {
  if (hours === 0) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function percent(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
</script>

<style scoped>
.section-label {
  margin-bottom: 0.75rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.time-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.25rem 0.75rem;
  align-items: center;
}

.time-row-head {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.time-dot.total {
  background: var(--color-text-tertiary);
}

.time-dot.manual {
  background: var(--color-warning);
}

.time-dot.ai {
  background: var(--color-accent);
}

.time-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.time-value {
  grid-column: 3;
  grid-row: 1;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.time-bar-wrap {
  grid-column: 1 / -1;
  grid-row: 2;
  height: 0.3125rem;
  background: var(--color-surface-soft);
  border-radius: 0.1875rem;
  overflow: hidden;
}

.time-bar {
  height: 100%;
  border-radius: 0.1875rem;
  transition: width 0.3s ease;
}

.time-bar.total {
  background: var(--color-text-tertiary);
}

.time-bar.manual {
  background: var(--color-warning);
  opacity: 0.8;
}

.time-bar.ai {
  background: var(--color-accent);
  opacity: 0.8;
}

.time-percent {
  grid-column: 3;
  grid-row: 2;
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  text-align: right;
}
</style>
