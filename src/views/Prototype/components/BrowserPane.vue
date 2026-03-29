<template>
  <div class="browser-pane">
    <div class="browser-bar">
      <div class="browser-bar__nav">
        <button class="nav-btn" type="button" title="后退" @click="goBack">
          <UiIcon icon="lucide:chevron-left" size="sm" />
        </button>
        <button class="nav-btn" type="button" title="前进" @click="goForward">
          <UiIcon icon="lucide:chevron-right" size="sm" />
        </button>
        <button class="nav-btn" type="button" title="刷新" @click="refresh">
          <UiIcon icon="lucide:rotate-cw" size="sm" />
        </button>
      </div>
      <div class="browser-bar__url">
        <UiIcon icon="lucide:file" size="sm" class="url-icon" />
        <span class="url-text">{{ displayUrl }}</span>
      </div>
      <div class="browser-bar__actions">
        <button class="nav-btn" type="button" title="在浏览器中打开" @click="$emit('open-external')">
          <UiIcon icon="lucide:external-link" size="sm" />
        </button>
      </div>
    </div>
    <div class="browser-pane__content">
      <IFramePreview
        :html-content="htmlContent"
        :selection-mode="selectionMode"
        @element-selected="$emit('element-selected', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { IFramePreview, type ElementInfo } from '@/components/ui/IFramePreview'

const props = defineProps<{
  htmlContent: string
  currentFilePath: string
  selectionMode: boolean
}>()

defineEmits<{
  'element-selected': [info: ElementInfo]
  'open-external': []
}>()

const refreshKey = ref(0)

const displayUrl = computed(() => {
  if (!props.currentFilePath) return 'file:///'
  return 'file:///' + props.currentFilePath
})

function goBack() {
  // Navigation history not implemented yet
}

function goForward() {
  // Navigation history not implemented yet
}

function refresh() {
  refreshKey.value++
}
</script>

<style scoped>
.browser-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.browser-bar {
  height: 2.625rem;
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  gap: 0.5rem;
  background: var(--color-surface);
  flex-shrink: 0;
}

.browser-bar__nav {
  display: flex;
  gap: 0.25rem;
}

.nav-btn {
  width: 1.5rem;
  height: 1.5rem;
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

.nav-btn:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
}

.browser-bar__url {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-canvas);
  border: 1px solid var(--color-border-soft);
  border-radius: 0.375rem;
  padding: 0 0.625rem;
  height: 1.75rem;
  gap: 0.375rem;
}

.url-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.url-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browser-bar__actions {
  display: flex;
  gap: 0.25rem;
}

.browser-pane__content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: var(--color-surface-soft);
}
</style>
