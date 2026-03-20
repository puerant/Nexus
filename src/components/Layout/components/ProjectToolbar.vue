<template>
  <div class="project-toolbar">
    <div class="project-toolbar__actions">
      <UiButton variant="ghost" size="sm" @click="$emit('powershell')">PowerShell</UiButton>
      <UiButton variant="ghost" size="sm" @click="$emit('explorer')">{{ explorerLabel }}</UiButton>
    </div>
    <div class="project-toolbar__meta">
      <span class="toolbar-hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '@/components/ui/UiButton.vue'

withDefaults(
  defineProps<{
    hint: string
    explorerLabel?: string
  }>(),
  {
    explorerLabel: '打开项目目录',
  },
)

defineEmits<{
  powershell: []
  explorer: []
}>()
</script>

<style scoped>
.project-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.project-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.project-toolbar__meta {
  color: var(--color-text-secondary);
}

.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>
