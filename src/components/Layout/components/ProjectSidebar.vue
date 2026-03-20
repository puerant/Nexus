<template>
  <aside class="project-sidebar">
    <UiSurface class="sidebar-summary" tone="accent" padding="lg">
      <div class="sidebar-label">当前项目</div>
      <div class="sidebar-title">{{ title }}</div>
      <UiStatusBadge tone="info">{{ phaseLabel }}</UiStatusBadge>
    </UiSurface>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in items"
        :key="item.phase"
        :to="item.to"
        class="nav-item"
        :class="{ active: activePhase === item.phase }"
        @click="$emit('select', item.phase)"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import UiSurface from '@/components/ui/UiSurface.vue'

defineProps<{
  title: string
  phaseLabel: string
  activePhase: string
  items: Array<{
    phase: string
    label: string
    icon: string
    to: RouteLocationRaw
  }>
}>()

defineEmits<{
  select: [phase: string]
}>()
</script>

<style scoped>
.project-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 0.9rem 1rem;
  background: color-mix(in oklab, var(--color-surface-soft) 70%, white 30%);
  border-right: 1px solid var(--color-border-soft);
}

.sidebar-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 0.9rem;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition:
    transform var(--motion-fast),
    background var(--motion-fast),
    color var(--motion-fast),
    box-shadow var(--motion-fast);
}

.nav-item:hover,
.nav-item.active {
  transform: translateX(2px);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-soft);
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

@media (max-width: 960px) {
  .project-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border-soft);
  }
}
</style>
