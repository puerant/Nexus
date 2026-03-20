<template>
  <section class="ui-surface" :class="surfaceClass">
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'default' | 'muted' | 'accent'
    padding?: 'sm' | 'md' | 'lg'
    rounded?: 'md' | 'lg' | 'xl'
  }>(),
  {
    tone: 'default',
    padding: 'md',
    rounded: 'xl',
  },
)

const surfaceClass = computed(() => [
  `ui-surface--${props.tone}`,
  `ui-surface--padding-${props.padding}`,
  `ui-surface--rounded-${props.rounded}`,
])
</script>

<style scoped>
.ui-surface {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
}

.ui-surface--default {
  background: var(--color-surface-raised);
}

.ui-surface--muted {
  background: var(--color-surface-soft);
}

.ui-surface--accent {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--color-accent-soft) 65%, white 35%) 0%,
    var(--color-surface-raised) 100%
  );
}

.ui-surface--padding-sm { padding: 1rem; }
.ui-surface--padding-md { padding: 1.25rem; }
.ui-surface--padding-lg { padding: 1.5rem; }

.ui-surface--rounded-md { border-radius: var(--radius-md); }
.ui-surface--rounded-lg { border-radius: var(--radius-lg); }
.ui-surface--rounded-xl { border-radius: var(--radius-xl); }
</style>
