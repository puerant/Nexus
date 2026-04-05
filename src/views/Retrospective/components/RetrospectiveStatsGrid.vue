<template>
  <section class="retro-stats">
    <UiSurface v-for="stat in stats" :key="stat.label" padding="md" rounded="lg">
      <div class="stat-icon">
        <UiIcon :icon="stat.icon" size="lg" />
      </div>
      <div class="stat-value">
        {{ stat.value }}<span v-if="stat.unit" class="stat-unit">{{ stat.unit }}</span>
      </div>
      <div class="stat-label">{{ stat.label }}</div>
      <div v-if="stat.delta" class="stat-delta">{{ stat.delta }}</div>
    </UiSurface>
  </section>
</template>

<script setup lang="ts">
import { UiSurface } from '@/components/ui/Surface'
import { UiIcon } from '@/components/ui/Icon'

export interface RetroStatItem {
  icon: string
  value: string | number
  unit?: string
  label: string
  delta?: string
}

defineProps<{
  stats: RetroStatItem[]
}>()
</script>

<style scoped>
.retro-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-icon {
  margin-bottom: 0.75rem;
  color: var(--color-text-tertiary);
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.0625rem;
  line-height: 1;
}

.stat-unit {
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 0.125rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-top: 0.375rem;
}

.stat-delta {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  margin-top: 0.1875rem;
}

@media (max-width: 1100px) {
  .retro-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .retro-stats {
    grid-template-columns: 1fr;
  }
}
</style>
