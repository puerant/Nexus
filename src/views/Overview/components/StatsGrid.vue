<template>
  <section class="stats-grid">
    <UiSurface v-for="(stat, index) in stats" :key="index" padding="md" rounded="lg">
      <div class="stat-label">{{ stat.label }}</div>
      <div class="stat-value" :class="{ small: stat.smallValue }">
        {{ stat.value }}
      </div>
      <div v-if="stat.subtitle" class="stat-sub">{{ stat.subtitle }}</div>
      <div v-if="stat.progress !== undefined" class="progress-track">
        <div class="progress-bar" :style="{ width: `${stat.progress}%` }" />
      </div>
    </UiSurface>
  </section>
</template>

<script setup lang="ts">
import { UiSurface } from '@/components/ui/Surface'

export interface StatItem {
  label: string
  value: string | number
  subtitle?: string
  progress?: number
  smallValue?: boolean
}

defineProps<{
  stats: StatItem[]
}>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-label {
  margin-bottom: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-text-primary);
}

.stat-value.small {
  font-size: 1rem;
  line-height: 1.2;
}

.stat-sub {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
}

.progress-track {
  margin-top: 0.75rem;
  height: 0.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-border-soft);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-accent);
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
