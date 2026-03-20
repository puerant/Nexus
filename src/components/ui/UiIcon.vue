<template>
  <span class="ui-icon" :class="`ui-icon--${size}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)
</script>

<style scoped>
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.ui-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.ui-icon--sm { width: 0.9rem; height: 0.9rem; }
.ui-icon--md { width: 1rem; height: 1rem; }
.ui-icon--lg { width: 1.25rem; height: 1.25rem; }
</style>
