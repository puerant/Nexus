<template>
  <aside class="project-sidebar" :class="{ collapsed: isCollapsed }">
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

    <button class="collapse-toggle" type="button" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
      <UiIcon :icon="isCollapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'" />
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import UiIcon from '@/components/ui/UiIcon.vue'

defineProps<{
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
  padding: 0.75rem 0.5rem;
  background: color-mix(in oklab, var(--color-surface-soft) 70%, white 30%);
  border-right: 1px solid var(--color-border-soft);
  width: 11.5rem;
  transition: width 0.2s ease-out;
}

.project-sidebar.collapsed {
  width: 3.25rem;
  padding: 0.75rem 0.4rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
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
}

.collapsed .nav-label {
  display: none;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 2rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.collapse-toggle:hover {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

@media (max-width: 960px) {
  .project-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border-soft);
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem 0.75rem;
  }

  .project-sidebar.collapsed {
    width: 100%;
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
    display: inline;
  }

  .collapse-toggle {
    width: auto;
    margin-top: 0;
    margin-left: auto;
    padding: 0 0.5rem;
  }
}
</style>
