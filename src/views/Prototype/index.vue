<template>
  <section class="prototype-page">
    <!-- Toolbar -->
    <PrototypeToolbar
      :is-locked="isLocked"
      :is-saving="isSaving"
      :is-locking="isLocking"
      :drawer-open="drawerOpen"
      :selection-mode="selectionMode"
      :has-content="!!htmlContent"
      :can-lock="canLock"
      @toggle-drawer="drawerOpen = !drawerOpen"
      @toggle-selection="toggleSelectionMode"
      @save="saveDraft"
      @lock="lockPrototype"
    />

    <!-- Main work area -->
    <div class="prototype-workspace">
      <!-- File panel -->
      <FilePanel
        :tree="fileTree"
        :active-path="currentFilePath"
        @select="handleFileSelect"
        @new-file="handleNewFile"
        @new-folder="handleNewFolder"
      />

      <!-- Browser pane -->
      <BrowserPane
        :html-content="htmlContent"
        :current-file-path="currentFilePath"
        :selection-mode="selectionMode"
        @element-selected="handleElementSelected"
      />
    </div>

    <!-- AI Chat drawer -->
    <Transition name="drawer">
      <AiChatDrawer
        v-if="drawerOpen"
        :messages="chatMessages"
        :selected-element="selectedElement"
        :is-sending="isSendingMessage"
        @send="handleSendMessage"
        @close="drawerOpen = false"
        @clear-element="selectedElement = null"
      />
    </Transition>

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false" />
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { readFile, readProjectConfig, scanWorkspace, writeFile, writeProjectConfig } from '@/api/workspace'
import type { FileEntry } from '@/api/workspace'
import type { ElementInfo } from '@/components/ui/IFramePreview'
import { useProjectStore, type ProjectConfig } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'
import PrototypeToolbar from './components/PrototypeToolbar.vue'
import FilePanel from './components/FilePanel.vue'
import BrowserPane from './components/BrowserPane.vue'
import AiChatDrawer from './components/AiChatDrawer.vue'
import type { ChatMessage } from './components/AiChatDrawer.vue'

const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const PROTOTYPES_DIR = '.ai-workflow/prototypes'

// State
const fileTree = ref<FileEntry[]>([])
const currentFilePath = ref('')
const htmlContent = ref('')
const drawerOpen = ref(false)
const selectionMode = ref(false)
const selectedElement = ref<ElementInfo | null>(null)
const chatMessages = ref<ChatMessage[]>([])
const isSendingMessage = ref(false)
const isSaving = ref(false)
const isLocking = ref(false)
const isLocked = ref(false)
let messageId = 0

const canLock = computed(() => htmlContent.value.trim().length > 0)

function getWorkspacePath(): string | undefined {
  return workspaceStore.currentWorkspace?.path || projectStore.currentProject?.workspacePath
}

// --- Lifecycle ---
onMounted(async () => {
  await loadState()
  bootstrapChat()
})

async function loadState() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return

  try {
    const [config, entries] = await Promise.all([
      readProjectConfig(workspacePath),
      scanWorkspace(workspacePath + '/' + PROTOTYPES_DIR).catch(() => [] as FileEntry[]),
    ])

    fileTree.value = entries

    // Check lock status
    const phase = (config?.phases as Record<string, { status?: string }>)?.prototype
    if (phase?.status === 'locked') {
      isLocked.value = true
    }

    // Auto-select first HTML file
    if (entries.length > 0) {
      const firstFile = findFirstHtmlFile(entries)
      if (firstFile) {
        await loadFile(firstFile)
      }
    }
  } catch (error) {
    console.error('Failed to load prototype state:', error)
  }
}

function findFirstHtmlFile(entries: FileEntry[]): string | null {
  for (const entry of entries) {
    if (!entry.isDir && (entry.name.endsWith('.html') || entry.name.endsWith('.htm'))) {
      return entry.path
    }
    if (entry.isDir && entry.children) {
      const found = findFirstHtmlFile(entry.children)
      if (found) return found
    }
  }
  return null
}

async function loadFile(relativePath: string) {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return

  currentFilePath.value = relativePath
  try {
    const content = await readFile(workspacePath, relativePath)
    htmlContent.value = content
  } catch (error) {
    console.error('Failed to load file:', error)
    htmlContent.value = ''
  }
}

// --- File operations ---
function handleFileSelect(path: string) {
  if (path === currentFilePath.value) return
  loadFile(path)
}

async function handleNewFile() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return

  const name = prompt('请输入文件名（例如 index.html）：')
  if (!name) return

  const relativePath = PROTOTYPES_DIR + '/' + name
  const defaultHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name.replace('.html', '')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 2rem; }
  </style>
</head>
<body>
  <h1>${name.replace('.html', '')}</h1>
  <p>在此编辑原型内容...</p>
</body>
</html>`

  try {
    await writeFile(workspacePath, relativePath, defaultHtml)
    await refreshFileTree()
    await loadFile(relativePath)
  } catch (error) {
    console.error('Failed to create file:', error)
    alert(`创建文件失败：${error}`)
  }
}

async function handleNewFolder() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return

  const name = prompt('请输入文件夹名称：')
  if (!name) return

  // Create a placeholder file in the folder so it appears in the tree
  const relativePath = PROTOTYPES_DIR + '/' + name + '/.gitkeep'
  try {
    await writeFile(workspacePath, relativePath, '')
    await refreshFileTree()
  } catch (error) {
    console.error('Failed to create folder:', error)
    alert(`创建文件夹失败：${error}`)
  }
}

async function refreshFileTree() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return
  fileTree.value = await scanWorkspace(workspacePath + '/' + PROTOTYPES_DIR).catch(() => [])
}

// --- Selection mode ---
function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    // Keep selectedElement for reference, just turn off visual selection
  }
}

function handleElementSelected(info: ElementInfo) {
  selectedElement.value = info
  selectionMode.value = false

  // Auto-add element card to chat
  if (drawerOpen.value) {
    pushUserMessage('', info)
  } else {
    drawerOpen.value = true
    nextTick(() => {
      pushUserMessage('', info)
    })
  }
}

// --- Chat ---
function bootstrapChat() {
  if (chatMessages.value.length > 0) return
  pushAssistantMessage('你好！我是原型设计助手。你可以选取页面上的元素，然后告诉我需要如何修改。')
}

function pushAssistantMessage(content: string) {
  chatMessages.value.push({ id: ++messageId, role: 'assistant', content, elementInfo: null })
  scrollChatToBottom()
}

function pushUserMessage(content: string, elementInfo?: ElementInfo) {
  chatMessages.value.push({ id: ++messageId, role: 'user', content, elementInfo: elementInfo || null })
  scrollChatToBottom()
}

function scrollChatToBottom() {
  nextTick(() => {
    const el = document.querySelector('.ai-drawer__messages')
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function handleSendMessage(content: string) {
  pushUserMessage(content)

  isSendingMessage.value = true
  try {
    const response = await callAiApi(content, selectedElement.value)
    pushAssistantMessage(response)
    selectedElement.value = null
  } catch (error) {
    pushAssistantMessage(`抱歉，处理时出现了错误：${error}`)
  } finally {
    isSendingMessage.value = false
  }
}

/**
 * AI API abstraction.
 * TODO: Replace with actual AI API call (Claude API, etc.)
 */
async function callAiApi(message: string, element: ElementInfo | null): Promise<string> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800))

  if (element) {
    return `我看到了你选中的 \`<${element.tagName}>\` 元素${
      element.id ? ` (#${element.id})` : ''
    }。关于「${message}」的修改需求，我已经记录下来了。\n\n在真实环境中，我会分析当前 HTML 并生成修改后的代码。目前这是 mock 响应，等待对接 AI API 后即可实现。`
  }

  return `收到你的需求：「${message}」。\n\n在真实环境中，我会分析当前原型页面并生成修改方案。目前这是 mock 响应，等待对接 AI API 后即可实现。`
}

// --- Save & Lock ---
async function saveDraft() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath || isLocked.value) return

  isSaving.value = true
  try {
    if (currentFilePath.value) {
      await writeFile(workspacePath, currentFilePath.value, htmlContent.value)
    }
    await persistProjectConfig('in_progress')
  } catch (error) {
    console.error('Failed to save prototype:', error)
    alert(`保存失败：${error}`)
  } finally {
    isSaving.value = false
  }
}

async function lockPrototype() {
  const workspacePath = getWorkspacePath()
  if (!workspacePath || isLocked.value || !canLock.value) return

  isLocking.value = true
  try {
    if (currentFilePath.value) {
      await writeFile(workspacePath, currentFilePath.value, htmlContent.value)
    }
    await persistProjectConfig('locked')
    isLocked.value = true
  } catch (error) {
    console.error('Failed to lock prototype:', error)
    alert(`锁定失败：${error}`)
  } finally {
    isLocking.value = false
  }
}

async function persistProjectConfig(status: 'in_progress' | 'locked') {
  const workspacePath = getWorkspacePath()
  if (!workspacePath) return

  const existing = await readProjectConfig(workspacePath)
  const project = {
    ...(existing ?? (projectStore.currentProject as unknown as Record<string, unknown>) ?? {}),
  } as Record<string, any>

  project.updatedAt = new Date().toISOString()
  project.phases = {
    ...(project.phases ?? {}),
    prototype: {
      ...(project.phases?.prototype ?? {}),
      status,
      model: project.phases?.prototype?.model ?? project.defaultModel ?? 'claude-sonnet-4-6',
      ...(status === 'locked' ? { lockedAt: new Date().toISOString() } : {}),
    },
  }

  await writeProjectConfig(workspacePath, project)

  const currentProject = (projectStore.currentProject ?? project) as ProjectConfig
  projectStore.setCurrentProject({
    ...currentProject,
    ...project,
    phases: {
      ...currentProject.phases,
      ...project.phases,
    },
  })
}
</script>

<style scoped>
.prototype-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.prototype-workspace {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* Drawer overlay */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, black 40%, transparent);
  z-index: 150;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .prototype-workspace {
    flex-direction: column;
  }
}
</style>
