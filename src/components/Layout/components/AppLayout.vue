<template>
  <div class="app-shell">
    <header class="app-topbar" data-tauri-drag-region>
      <div class="topbar-brand">
        <slot name="brand">
          <div class="brand-mark">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z"
                stroke="currentColor"
                stroke-width="1.2"
                fill="none"
              />
              <path
                d="M10 2V18M2 6.5L18 13.5M18 6.5L2 13.5"
                stroke="currentColor"
                stroke-width="1.1"
                opacity="0.45"
              />
            </svg>
          </div>
          <div class="brand-copy">
            <span class="brand-title">{{ title }}</span>
            <span v-if="subtitle" class="brand-subtitle">{{ subtitle }}</span>
          </div>
        </slot>
      </div>

      <div class="topbar-actions">
        <slot name="topbar-actions" />
      </div>

      <div class="window-actions">
        <button class="window-btn" type="button" aria-label="最小化窗口" @click="minimizeWindow">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5H13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
        <button class="window-btn" type="button" :aria-label="isMaximized ? '还原窗口' : '最大化窗口'" @click="toggleMaximize">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              v-if="!isMaximized"
              d="M3.5 3.5H12.5V12.5H3.5V3.5Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <path
              v-else
              d="M5.5 3.5H12.5V10.5H5.5V3.5ZM3.5 5.5H10.5V12.5H3.5V5.5Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
        </button>
        <button class="window-btn window-btn-close" type="button" aria-label="关闭窗口" @click="closeWindow">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <main class="app-content">
      <slot />
    </main>

    <footer class="app-toolbar">
      <slot name="toolbar" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'AI Workflow',
    subtitle: '',
  },
)

const appWindow = getCurrentWindow()
const isMaximized = ref(false)

async function syncMaximizeState() {
  isMaximized.value = await appWindow.isMaximized()
}

async function minimizeWindow() {
  await appWindow.minimize()
}

async function toggleMaximize() {
  if (isMaximized.value) {
    await appWindow.unmaximize()
  } else {
    await appWindow.maximize()
  }
  await syncMaximizeState()
}

async function closeWindow() {
  await appWindow.close()
}

onMounted(async () => {
  await syncMaximizeState()
})

const unlistenPromise = appWindow.onResized(async () => {
  await syncMaximizeState()
})

onBeforeUnmount(async () => {
  const unlisten = await unlistenPromise
  unlisten()
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: grid;
  grid-template-rows: var(--topbar-height) minmax(0, 1fr) var(--toolbar-height);
  background:
    radial-gradient(circle at top left, rgba(0, 122, 255, 0.08), transparent 30%),
    linear-gradient(180deg, #f8fafc 0%, #f3f6fa 100%);
  color: var(--text-1);
}

.app-topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 16px;
  padding: 0 18px 0 14px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(13, 17, 23, 0.08);
  backdrop-filter: blur(14px);
}

.topbar-brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, #007aff 0%, #5b8cff 100%);
  box-shadow: 0 10px 24px rgba(0, 122, 255, 0.22);
  flex-shrink: 0;
}

.brand-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 11px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-actions,
.window-actions,
.app-toolbar {
  display: flex;
  align-items: center;
}

.topbar-actions {
  gap: 10px;
}

.window-actions {
  gap: 8px;
}

.window-btn {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(13, 17, 23, 0.08);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-2);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    background 0.14s ease,
    color 0.14s ease,
    border-color 0.14s ease;
}

.window-btn:hover {
  transform: translateY(-1px);
  color: var(--text-1);
  background: white;
  border-color: rgba(0, 122, 255, 0.2);
}

.window-btn svg {
  width: 14px;
  height: 14px;
}

.window-btn-close:hover {
  color: white;
  background: #ff5f57;
  border-color: #ff5f57;
}

.app-content {
  min-height: 0;
  overflow: auto;
}

.app-toolbar {
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(13, 17, 23, 0.08);
}
</style>
