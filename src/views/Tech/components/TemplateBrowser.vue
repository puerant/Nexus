<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <div class="modal-title">
            <UiIcon icon="lucide:copy" size="md" />
            <h2>从模板创建</h2>
          </div>
          <button class="modal-close" type="button" @click="$emit('close')">
            <UiIcon icon="lucide:x" size="sm" />
          </button>
        </header>

        <div class="modal-body">
          <!-- Loading -->
          <div v-if="isLoading" class="loading-state">
            <UiIcon icon="lucide:loader-2" size="lg" class="is-spinning" />
            <span>正在扫描项目...</span>
          </div>

          <!-- Empty -->
          <div v-else-if="templates.length === 0" class="empty-state">
            <UiIcon icon="lucide:folder-open" size="lg" />
            <p>未找到技术选型文档</p>
            <span>其他项目中尚未创建技术选型文档</span>
          </div>

          <!-- Template list -->
          <div v-else class="template-list">
            <button
              v-for="tpl in templates"
              :key="tpl.projectPath"
              class="template-card"
              type="button"
              @click="$emit('select', tpl.content)"
            >
              <div class="template-card__header">
                <UiIcon icon="lucide:folder" size="sm" />
                <span class="template-card__name">{{ tpl.projectName }}</span>
              </div>
              <div class="template-card__path">{{ tpl.relativePath }}</div>
              <pre class="template-card__preview">{{ tpl.preview }}</pre>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { scanWorkspace, readFile } from '@/api/workspace'

interface TemplateInfo {
  projectName: string
  projectPath: string
  relativePath: string
  preview: string
  content: string
}

const props = defineProps<{
  workspacePath: string
}>()

defineEmits<{
  select: [content: string]
  close: []
}>()

const templates = ref<TemplateInfo[]>([])
const isLoading = ref(false)

const SEARCH_PATHS = [
  'docs/技术选型.md',
  '.ai-workflow/tech-design/tech-stack.md',
]

onMounted(async () => {
  await scanTemplates()
})

async function scanTemplates() {
  if (!props.workspacePath) return
  isLoading.value = true

  try {
    const entries = await scanWorkspace(props.workspacePath)
    const dirs = entries.filter((e) => e.isDir)
    const found: TemplateInfo[] = []

    await Promise.all(
      dirs.map(async (dir) => {
        for (const relPath of SEARCH_PATHS) {
          try {
            const fullPath = `${dir.name}/${relPath}`
            const content = await readFile(props.workspacePath, fullPath)
            if (content?.trim()) {
              const lines = content.split('\n').slice(0, 5).join('\n')
              found.push({
                projectName: dir.name,
                projectPath: dir.path,
                relativePath: relPath,
                preview: lines,
                content,
              })
              break
            }
          } catch {
            // File doesn't exist in this project, skip
          }
        }
      }),
    )

    templates.value = found
  } catch (error) {
    console.error('Failed to scan templates:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, black 40%, transparent);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: min(36rem, 90vw);
  max-height: 80vh;
  background: var(--color-surface-raised);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.modal-title h2 {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--color-surface-soft);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.5rem;
}

/* Loading & Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}

.empty-state p {
  margin: 0;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.empty-state span {
  font-size: 0.8125rem;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Template list */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.template-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition: all 0.15s ease;
}

.template-card:hover {
  border-color: var(--color-accent);
  background: color-mix(in oklab, var(--color-accent) 4%, var(--color-surface-raised));
}

.template-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.template-card__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-card__path {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-bottom: 0.5rem;
}

.template-card__preview {
  margin: 0;
  padding: 0.625rem 0.75rem;
  background: var(--color-surface-soft);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  overflow: hidden;
  max-height: 5rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
