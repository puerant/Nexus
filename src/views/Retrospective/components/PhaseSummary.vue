<template>
  <div class="phase-card">
    <div class="card-head">
      <div class="card-head-title">
        <UiIcon icon="lucide:bar-chart-3" size="sm" />
        各阶段完成情况
      </div>
    </div>
    <div
      v-for="(phase, idx) in phases"
      :key="phase.name"
      class="phase-row"
      :class="{ last: idx === phases.length - 1 }"
    >
      <span class="phase-num">{{ phase.num }}</span>
      <div class="phase-info">
        <div class="phase-name">{{ phase.name }}</div>
        <div class="phase-tasks">{{ phase.taskLabel }}</div>
      </div>
      <div class="phase-bar-wrap">
        <div class="phase-bar" :style="{ width: phase.progress + '%' }" />
      </div>
      <div class="phase-time">{{ phase.timeSpent }}</div>
      <UiStatusBadge :tone="statusTone(phase.status)">
        {{ statusLabel(phase.status) }}
      </UiStatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '@/components/ui/Icon'
import { UiStatusBadge } from '@/components/ui/StatusBadge'

export interface PhaseSummaryItem {
  num: string
  name: string
  taskLabel: string
  progress: number
  timeSpent: string
  status: 'completed' | 'in_progress' | 'not_started'
}

defineProps<{
  phases: PhaseSummaryItem[]
}>()

function statusTone(status: PhaseSummaryItem['status']): 'success' | 'warning' | 'neutral' {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'warning'
  return 'neutral'
}

function statusLabel(status: PhaseSummaryItem['status']): string {
  if (status === 'completed') return '已完成'
  if (status === 'in_progress') return '进行中'
  return '未开始'
}
</script>

<style scoped>
.phase-card {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-head {
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
}

.card-head-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phase-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.8125rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.phase-row.last {
  border-bottom: none;
}

.phase-num {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  width: 1.5rem;
}

.phase-info {
  flex: 1;
}

.phase-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.phase-tasks {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 0.125rem;
}

.phase-bar-wrap {
  width: 7.5rem;
  height: 0.3125rem;
  background: var(--color-surface-soft);
  border-radius: 0.1875rem;
  overflow: hidden;
  flex-shrink: 0;
}

.phase-bar {
  height: 100%;
  background: var(--color-accent);
  border-radius: 0.1875rem;
  transition: width 0.3s ease;
}

.phase-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  width: 4rem;
  text-align: right;
  flex-shrink: 0;
}
</style>
