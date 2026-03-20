<template>
  <span class="ui-status-badge" :class="`ui-status-badge--${tone}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'info' | 'success' | 'warning'
  }>(),
  {
    tone: 'neutral',
  },
)
</script>

<style scoped>
.ui-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.65rem;
  padding: 0.18rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ui-status-badge--neutral {
  background: var(--color-surface-soft);
  color: var(--color-text-tertiary);
}

.ui-status-badge--info {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.ui-status-badge--success {
  background: color-mix(in oklab, var(--color-success) 14%, white 86%);
  color: color-mix(in oklab, var(--color-success) 70%, black 20%);
}

.ui-status-badge--warning {
  background: color-mix(in oklab, var(--color-warning) 18%, white 82%);
  color: color-mix(in oklab, var(--color-warning) 70%, black 24%);
}
</style>
