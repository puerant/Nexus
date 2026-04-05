<template>
  <div class="tree-item">
    <!-- Folder -->
    <div
      v-if="entry.isDir"
      class="tree-item__folder"
      @click="expanded = !expanded"
    >
      <svg
        class="tree-item__chevron"
        :class="{ 'is-open': expanded }"
        width="10" height="10" viewBox="0 0 10 10" fill="none"
      >
        <path d="M3 4L5 6L7 4" stroke="currentColor" stroke-width="1" />
      </svg>
      <UiIcon icon="lucide:folder" size="sm" class="tree-item__folder-icon" />
      <span class="tree-item__name">{{ entry.name }}</span>
    </div>

    <!-- File -->
    <div
      v-else
      class="tree-item__file"
      :class="{ 'is-active': entry.path === activePath }"
      @click="$emit('select', entry.path)"
    >
      <UiIcon
        :icon="fileIcon"
        size="sm"
        class="tree-item__file-icon"
      />
      <span class="tree-item__name">{{ entry.name }}</span>
      <span class="tree-item__ext">{{ fileExt }}</span>
    </div>

    <!-- Children -->
    <div v-if="entry.isDir && expanded && entry.children?.length" class="tree-item__children">
      <FileTreeItem
        v-for="child in entry.children"
        :key="child.path"
        :entry="child"
        :active-path="activePath"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FileEntry } from '@/api/workspace'
import { UiIcon } from '@/components/ui/Icon'

const props = defineProps<{
  entry: FileEntry
  activePath: string
  depth: number
}>()

defineEmits<{
  select: [path: string]
}>()

const expanded = ref(props.depth === 0)

const fileExt = computed(() => {
  const dot = props.entry.name.lastIndexOf('.')
  if (dot === -1) return ''
  return props.entry.name.slice(dot + 1).toUpperCase()
})

const fileIcon = computed(() => {
  const ext = fileExt.value.toLowerCase()
  if (ext === 'html' || ext === 'htm') return 'lucide:file-code'
  if (ext === 'css') return 'lucide:file-code-2'
  if (ext === 'js' || ext === 'ts') return 'lucide:file-json'
  return 'lucide:file'
})
</script>

<style scoped>
.tree-item__folder,
.tree-item__file {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.5rem;
  border-radius: 0.3125rem;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-bottom: 1px;
}

.tree-item__folder:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-primary);
}

.tree-item__file:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-primary);
}

.tree-item__file.is-active {
  background: color-mix(in oklab, var(--color-accent) 8%, var(--color-surface));
  color: var(--color-accent);
}

.tree-item__file.is-active .tree-item__file-icon {
  color: var(--color-accent);
}

.tree-item__chevron {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transition: transform 0.15s;
}

.tree-item__chevron.is-open {
  transform: rotate(90deg);
}

.tree-item__folder-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.tree-item__file-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.tree-item__name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-item__ext {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
  flex-shrink: 0;
}

.tree-item__file.is-active .tree-item__ext {
  color: var(--color-accent);
}

.tree-item__children {
  padding-left: 1.125rem;
}
</style>
