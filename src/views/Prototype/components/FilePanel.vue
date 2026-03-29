<template>
  <aside class="file-panel">
    <header class="file-panel__header">
      <span class="file-panel__title">原型文件</span>
      <div class="file-panel__actions">
        <button class="fp-btn" type="button" title="新建文件" @click="$emit('new-file')">
          <UiIcon icon="lucide:plus" size="sm" />
        </button>
        <button class="fp-btn" type="button" title="新建文件夹" @click="$emit('new-folder')">
          <UiIcon icon="lucide:folder-plus" size="sm" />
        </button>
      </div>
    </header>
    <div class="file-panel__body">
      <template v-if="tree.length">
        <FileTreeItem
          v-for="item in tree"
          :key="item.path"
          :entry="item"
          :active-path="activePath"
          :depth="0"
          @select="$emit('select', $event)"
        />
      </template>
      <div v-else class="file-panel__empty">
        <p>暂无原型文件</p>
        <p class="file-panel__empty-hint">点击 + 创建第一个文件</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { FileEntry } from '@/api/workspace'
import UiIcon from '@/components/ui/UiIcon.vue'
import FileTreeItem from './FileTreeItem.vue'

defineProps<{
  tree: FileEntry[]
  activePath: string
}>()

defineEmits<{
  select: [path: string]
  'new-file': []
  'new-folder': []
}>()
</script>

<style scoped>
.file-panel {
  width: 240px;
  border-right: 1px solid var(--color-border-soft);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: var(--color-surface);
}

.file-panel__header {
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-panel__title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.file-panel__actions {
  display: flex;
  gap: 0.25rem;
}

.fp-btn {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  transition: all 0.15s;
}

.fp-btn:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
}

.file-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0.375rem;
}

.file-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: var(--color-text-tertiary);
  font-size: 0.8125rem;
  text-align: center;
}

.file-panel__empty-hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>
