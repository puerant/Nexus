<template>
  <div class="prototype-toolbar">
    <div class="toolbar-left">
      <UiStatusBadge :tone="isLocked ? 'success' : 'warning'">
        {{ isLocked ? '已锁定' : '编辑中' }}
      </UiStatusBadge>
    </div>
    <div class="toolbar-actions">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: drawerOpen }"
        :disabled="isLocked"
        @click="$emit('toggle-drawer')"
      >
        <UiIcon icon="lucide:sparkles" size="sm" />
        <span>AI 助手</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: selectionMode }"
        :disabled="isLocked || !hasContent"
        @click="$emit('toggle-selection')"
      >
        <UiIcon icon="lucide:pointer" size="sm" />
        <span>{{ selectionMode ? '退出选取' : '选取元素' }}</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :disabled="isLocked || isSaving || !hasContent"
        @click="$emit('save')"
      >
        <UiIcon :icon="isSaving ? 'lucide:loader-2' : 'lucide:save'" size="sm" :class="{ 'is-spinning': isSaving }" />
        <span>{{ isSaving ? '保存中' : '保存' }}</span>
      </button>
      <button
        type="button"
        class="toolbar-btn toolbar-btn--primary"
        :disabled="isLocked || !canLock || isLocking"
        @click="$emit('lock')"
      >
        <UiIcon :icon="isLocking ? 'lucide:loader-2' : 'lucide:lock'" size="sm" :class="{ 'is-spinning': isLocking }" />
        <span>{{ isLocking ? '锁定中' : '锁定' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '@/components/ui/Icon'
import { UiStatusBadge } from '@/components/ui/StatusBadge'

defineProps<{
  isLocked: boolean
  isSaving: boolean
  isLocking: boolean
  drawerOpen: boolean
  selectionMode: boolean
  hasContent: boolean
  canLock: boolean
}>()

defineEmits<{
  'toggle-drawer': []
  'toggle-selection': []
  save: []
  lock: []
}>()
</script>

<style scoped>
.prototype-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-soft);
  background: var(--color-surface);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 6%, var(--color-surface));
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 10%, var(--color-surface));
}

.toolbar-btn--primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.toolbar-btn--primary:hover:not(:disabled) {
  background: color-mix(in oklab, var(--color-accent) 85%, black);
  border-color: color-mix(in oklab, var(--color-accent) 85%, black);
  color: white;
}

.toolbar-btn--primary:disabled {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.toolbar-btn .is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
