<template>
  <UiSurface padding="md" rounded="lg">
    <div class="section-label">工具使用分析</div>
    <div class="usage-grid">
      <div v-for="category in categories" :key="category.label" class="usage-col">
        <div class="usage-col-title">{{ category.label }}</div>
        <div v-for="item in category.items" :key="item.name" class="usage-row">
          <div class="usage-row-info">
            <span class="usage-name">{{ item.name }}</span>
            <span class="usage-count">{{ item.count }}</span>
          </div>
          <div class="usage-bar-wrap">
            <div
              class="usage-bar"
              :style="{ width: barWidth(item.count, category.max), background: item.color || 'var(--color-accent)' }"
            />
          </div>
        </div>
      </div>
    </div>
  </UiSurface>
</template>

<script setup lang="ts">
import { UiSurface } from '@/components/ui/Surface'

export interface UsageEntry {
  name: string
  count: number
  color?: string
}

export interface UsageCategory {
  label: string
  items: UsageEntry[]
  max: number
}

defineProps<{
  categories: UsageCategory[]
}>()

function barWidth(count: number, max: number): string {
  return `${Math.max((count / Math.max(max, 1)) * 100, 4)}%`
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

.usage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.usage-col-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.usage-row {
  margin-bottom: 0.625rem;
}

.usage-row:last-child {
  margin-bottom: 0;
}

.usage-row-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.usage-name {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.usage-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.usage-bar-wrap {
  height: 0.3125rem;
  background: var(--color-surface-soft);
  border-radius: 0.1875rem;
  overflow: hidden;
}

.usage-bar {
  height: 100%;
  border-radius: 0.1875rem;
  opacity: 0.75;
  transition: width 0.3s ease;
}

@media (max-width: 1100px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
