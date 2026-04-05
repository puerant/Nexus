<template>
  <div class="phase-list">
    <button
      v-for="phase in phases"
      :key="phase.id"
      type="button"
      class="phase-item"
      @click="$emit('select', phase.id)"
    >
      <span class="phase-index">{{ phase.num }}</span>
      <span class="phase-name">{{ phase.name }}</span>
      <UiStatusBadge :tone="getTone(phase.status)">
        {{ getLabel(phase.status) }}
      </UiStatusBadge>
    </button>
  </div>
</template>

<script setup lang="ts">
import { UiStatusBadge } from '@/components/ui/StatusBadge'

export interface PhaseItem {
  id: string
  name: string
  num: string
  status: 'not_started' | 'in_progress' | 'completed' | 'locked'
}

defineProps<{
  phases: PhaseItem[]
}>()

defineEmits<{
  select: [phaseId: string]
}>()

const statusLabels: Record<string, string> = {
  not_started: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  locked: '已锁定',
}

function getLabel(status: string): string {
  return statusLabels[status] ?? '待开始'
}

function getTone(status: string): 'neutral' | 'info' | 'success' | 'warning' {
  if (status === 'completed' || status === 'locked') return 'success'
  if (status === 'in_progress') return 'warning'
  return 'neutral'
}
</script>

<style scoped>
.phase-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.phase-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.phase-item:hover {
  background: var(--color-surface-soft);
  border-color: var(--color-border);
}

.phase-index {
  width: 1.5rem;
  color: var(--color-text-tertiary);
  font-size: 0.6875rem;
  font-weight: 600;
}

.phase-name {
  flex: 1;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
