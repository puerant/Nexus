<template>
  <aside class="project-sidebar" :class="{ collapsed: isCollapsed }">
    <button class="collapse-toggle" type="button" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
        <path v-if="isCollapsed" d="M6 4L10 8L6 12" />
        <path v-else d="M10 4L6 8L10 12" />
      </svg>
    </button>

    <div class="sidebar-summary" :class="{ hidden: isCollapsed }">
      <div class="sidebar-label">当前项目</div>
      <div class="sidebar-title">{{ title }}</div>
      <UiStatusBadge tone="info">{{ phaseLabel }}</UiStatusBadge>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in items"
        :key="item.phase"
        :to="item.to"
        class="nav-item"
        :class="{ active: activePhase === item.phase }"
        :title="isCollapsed ? item.label : undefined"
        @click="$emit('select', item.phase)"
      >
        <UiIcon class="nav-icon" :icon="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'

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

const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.project-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0.6rem;
  background: color-mix(in oklab, var(--color-surface-soft) 70%, white 30%);
  border-right: 1px solid var(--color-border-soft);
  width: 11.5rem;
  transition: width 0.2s ease-out;
}

.project-sidebar.collapsed {
  width: 3.25rem;
  padding: 1rem 0.4rem;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0 0 0.5rem auto;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.collapse-toggle:hover {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.collapse-toggle svg {
  width: 1rem;
  height: 1rem;
}

.collapsed .collapse-toggle {
  margin: 0 auto 0.5rem;
}

.sidebar-summary {
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 1;
  transition: opacity 0.15s;
}

.sidebar-summary.hidden {
  opacity: 0;
  pointer-events: none;
  height: 0;
  padding: 0;
  overflow: hidden;
}

.sidebar-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.sidebar-title {
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.6rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: background 0.12s, color 0.12s;
}

.nav-item:hover {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.collapsed .nav-item {
  justify-content: center;
  padding: 0.65rem;
}

.nav-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.15s;
}

.collapsed .nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

@media (max-width: 960px) {
  .project-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border-soft);
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.75rem;
  }

  .project-sidebar.collapsed {
    width: 100%;
  }

  .collapse-toggle {
    order: -1;
  }

  .sidebar-summary {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .sidebar-summary.hidden {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .nav-item {
    padding: 0.5rem 0.75rem;
  }

  .collapsed .nav-item {
    justify-content: flex-start;
  }

  .collapsed .nav-label {
    opacity: 1;
    width: auto;
  }
}
</style>
