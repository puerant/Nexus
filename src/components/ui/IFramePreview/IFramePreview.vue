<template>
  <div class="iframe-preview">
    <iframe
      ref="iframeRef"
      class="iframe-preview__frame"
      :srcdoc="processedHtml"
      sandbox="allow-scripts allow-same-origin"
    />
    <div v-if="selectionMode" class="iframe-preview__hint">
      点击选取元素
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { prepareHtmlWithSelection } from './injectSelectionScript'

export interface ElementInfo {
  tagName: string
  id: string
  className: string
  cssSelector: string
  outerHTML: string
  attributes: Record<string, string>
  boundingRect: { top: number; left: number; width: number; height: number }
}

const props = defineProps<{
  htmlContent: string
  selectionMode: boolean
}>()

const emit = defineEmits<{
  'element-selected': [info: ElementInfo]
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)

const processedHtml = computed(() => {
  if (!props.htmlContent) return ''
  return prepareHtmlWithSelection(props.htmlContent)
})

watch(() => props.selectionMode, (active) => {
  sendToggleMessage(active)
})

function sendToggleMessage(active: boolean) {
  if (!iframeRef.value?.contentWindow) return
  iframeRef.value.contentWindow.postMessage(
    { type: '__toggle_selection__', active },
    '*',
  )
}

function handleMessage(event: MessageEvent) {
  if (event.data?.type === '__element_selected__') {
    emit('element-selected', event.data.data as ElementInfo)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.iframe-preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.iframe-preview__frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.iframe-preview__hint {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.75rem;
  background: var(--color-accent);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-pill);
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--shadow-md);
}
</style>
