<template>
  <div class="ui-tab-group">
    <div class="ui-tab-group__nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="ui-tab-group__tab"
        :class="{ 'ui-tab-group__tab--active': modelValue === tab.key }"
        @click="modelValue = tab.key"
      >
        <UiIcon v-if="tab.icon" :icon="tab.icon" size="sm" />
        <span>{{ tab.label }}</span>
      </button>
    </div>
    <div class="ui-tab-group__panel">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue'

export interface TabItem {
  key: string
  label: string
  icon?: string
}

withDefaults(
  defineProps<{
    tabs: TabItem[]
    modelValue: string
  }>(),
  {},
)

const modelValue = defineModel<string>({ required: true })
</script>

<style scoped>
.ui-tab-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.ui-tab-group__nav {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.ui-tab-group__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: color var(--motion-fast), background var(--motion-fast), border-color var(--motion-fast);
}

.ui-tab-group__tab:hover {
  color: var(--color-text-primary);
  background: var(--hover);
}

.ui-tab-group__tab--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.ui-tab-group__panel {
  padding-top: 0.85rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
