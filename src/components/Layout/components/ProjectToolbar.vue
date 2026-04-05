<template>
  <div class="project-toolbar">
    <div class="project-toolbar__actions">
      <UiButton variant="ghost" size="sm" @click="handlePowerShell">PowerShell</UiButton>
      <UiButton variant="ghost" size="sm" @click="handleCmd">命令提示符</UiButton>
      <UiButton variant="ghost" size="sm" @click="handleExplorer">{{ explorerLabel }}</UiButton>
    </div>
    <div class="project-toolbar__meta">
      <span class="toolbar-hint">{{ hint }}</span>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '@/components/ui/UiButton.vue'
import { openTerminal, openFileExplorer } from '@/api/system'

const props = withDefaults(
  defineProps<{
    hint: string
    workingDir?: string
    explorerLabel?: string
  }>(),
  {
    explorerLabel: '打开项目目录',
  },
)

async function handlePowerShell() {
  try {
    await openTerminal('powershell', props.workingDir)
  } catch (e) {
    console.error('Failed to open PowerShell:', e)
  }
}

async function handleCmd() {
  try {
    await openTerminal('cmd', props.workingDir)
  } catch (e) {
    console.error('Failed to open Command Prompt:', e)
  }
}

async function handleExplorer() {
  try {
    await openFileExplorer(props.workingDir)
  } catch (e) {
    console.error('Failed to open file explorer:', e)
  }
}
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>
