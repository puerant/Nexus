<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="store.isCreateOpen" class="modal-overlay" @click.self="store.closeCreate()">
        <div class="modal">
          <!-- 头部 -->
          <div class="modal-head">
            <div class="modal-title">
              {{ isEditing ? '编辑任务' : '新建任务' }}
            </div>
            <button type="button" class="modal-close" @click="store.closeCreate()">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1" />
              </svg>
            </button>
          </div>

          <!-- 创建模式切换 -->
          <div v-if="!isEditing" class="mode-tabs">
            <button
              type="button"
              class="mode-tab"
              :class="{ active: mode === 'manual' }"
              @click="mode = 'manual'"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1" />
              </svg>
              手动创建
            </button>
            <button
              type="button"
              class="mode-tab"
              :class="{ active: mode === 'ai' }"
              @click="mode = 'ai'"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" stroke-width="1" />
              </svg>
              AI 生成任务
            </button>
          </div>

          <!-- 表单 -->
          <div class="modal-body">
            <template v-if="mode === 'manual' || isEditing">
              <div class="form-group">
                <label class="form-label">任务标题 <span class="required">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-input"
                  placeholder="输入任务标题..."
                  autofocus
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">优先级</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">预估工时 (小时)</label>
                  <input
                    v-model.number="form.estimatedHours"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">所属模块</label>
                <input
                  v-model="form.module"
                  type="text"
                  class="form-input"
                  placeholder="例如：前端-用户模块"
                />
              </div>

              <div class="form-group">
                <label class="form-label">任务描述</label>
                <textarea
                  v-model="form.description"
                  class="form-textarea"
                  rows="3"
                  placeholder="描述任务内容..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">验收标准 (test.md)</label>
                <textarea
                  v-model="form.testMd"
                  class="form-textarea"
                  rows="3"
                  placeholder="- [ ] 验收条件1&#10;- [ ] 验收条件2"
                />
              </div>

              <div class="form-group">
                <label class="form-label">关联文件（逗号分隔）</label>
                <input
                  v-model="form.relatedFilesStr"
                  type="text"
                  class="form-input"
                  placeholder="file1.ts, file2.vue"
                />
              </div>
            </template>

            <!-- AI 生成模式 -->
            <template v-else>
              <div class="ai-hint">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="var(--accent)" stroke-width="1" />
                  <path d="M10 6V11M10 13V13.5" stroke="var(--accent)" stroke-width="1.5" />
                </svg>
                <div>
                  <div class="ai-hint-title">AI 任务生成</div>
                  <div class="ai-hint-desc">
                    描述你想要完成的任务，AI 将按照前后端模块自动拆解为原子化子任务，
                    并为每个子任务生成 task.md 和 test.md。
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">任务描述 <span class="required">*</span></label>
                <textarea
                  v-model="aiPrompt"
                  class="form-textarea"
                  rows="5"
                  placeholder="例如：实现用户认证系统，包含注册、登录、密码重置功能..."
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">拆解粒度</label>
                  <select v-model="aiGranularity" class="form-select">
                    <option value="fine">细粒度（更多子任务）</option>
                    <option value="medium">中等</option>
                    <option value="coarse">粗粒度（较少子任务）</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">默认优先级</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>

              <!-- AI 预览 -->
              <div v-if="aiPreview.length > 0" class="ai-preview">
                <div class="ai-preview-header">
                  <div class="ai-preview-title">AI 生成预览</div>
                  <div class="ai-preview-hint">可修改后再确认</div>
                </div>
                <div
                  v-for="(item, i) in aiPreview"
                  :key="i"
                  class="ai-preview-item"
                  :class="{ disabled: item.disabled }"
                >
                  <button type="button" class="ai-check" :class="{ checked: !item.disabled }" @click="item.disabled = !item.disabled">
                    <svg v-if="!item.disabled" width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.2" />
                    </svg>
                  </button>
                  <div class="ai-item-content">
                    <div class="ai-item-title">{{ item.title }}</div>
                    <div class="ai-item-meta">
                      <span class="ai-item-module">{{ item.module }}</span>
                      <span class="ai-item-hours">{{ item.estimatedHours }}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 底部 -->
          <div class="modal-footer">
            <button type="button" class="modal-btn ghost" @click="store.closeCreate()">
              取消
            </button>
            <template v-if="mode === 'manual' || isEditing">
              <button
                type="button"
                class="modal-btn primary"
                :disabled="!form.title.trim()"
                @click="submitManual"
              >
                {{ isEditing ? '保存修改' : '创建任务' }}
              </button>
            </template>
            <template v-else>
              <button
                v-if="aiPreview.length === 0"
                type="button"
                class="modal-btn primary"
                :disabled="!aiPrompt.trim() || isGenerating"
                @click="generateAiTasks"
              >
                {{ isGenerating ? '生成中...' : '生成任务' }}
              </button>
              <button
                v-else
                type="button"
                class="modal-btn primary"
                @click="confirmAiTasks"
              >
                确认并创建 ({{ enabledPreviewCount }} 个任务)
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const store = useTasksStore()

const mode = ref<'manual' | 'ai'>('manual')
const isGenerating = ref(false)
const aiPrompt = ref('')
const aiGranularity = ref<'fine' | 'medium' | 'coarse'>('medium')

const aiPreview = reactive<Array<{ title: string; module: string; estimatedHours: number; description: string; taskMd: string; testMd: string; disabled: boolean }>>([])

const form = reactive({
  title: '',
  description: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  estimatedHours: 0,
  module: '',
  testMd: '',
  relatedFilesStr: '',
})

const isEditing = computed(() => !!store.editingTaskId)

const enabledPreviewCount = computed(() => aiPreview.filter((i) => !i.disabled).length)

// 填充编辑表单
watch(
  () => store.isCreateOpen,
  (open) => {
    if (!open) return
    if (store.editingTaskId) {
      const task = store.getTaskById(store.editingTaskId)
      if (task) {
        form.title = task.title
        form.description = task.description
        form.priority = task.priority
        form.estimatedHours = task.estimatedHours
        form.module = task.module
        form.testMd = task.testMd
        form.relatedFilesStr = task.relatedFiles.join(', ')
      }
    } else {
      resetForm()
    }
    aiPreview.length = 0
    mode.value = 'manual'
  },
)

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.estimatedHours = 0
  form.module = ''
  form.testMd = ''
  form.relatedFilesStr = ''
}

function submitManual() {
  if (!form.title.trim()) return

  const relatedFiles = form.relatedFilesStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (isEditing.value && store.editingTaskId) {
    store.updateTask(store.editingTaskId, {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      estimatedHours: form.estimatedHours,
      module: form.module.trim(),
      testMd: form.testMd.trim(),
      relatedFiles,
    })
  } else {
    store.createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      estimatedHours: form.estimatedHours,
      module: form.module.trim(),
      source: 'manual',
      testMd: form.testMd.trim(),
      relatedFiles,
    })
  }

  store.closeCreate()
}

// 模拟 AI 生成（后续接入真实 AI）
async function generateAiTasks() {
  if (!aiPrompt.value.trim()) return
  isGenerating.value = true

  // 模拟 AI 处理
  await new Promise((r) => setTimeout(r, 1200))

  aiPreview.length = 0

  const lines = aiPrompt.value.split(/[，。；\n,;]/).filter((s) => s.trim())
  const modules = ['前端-通用', '后端-API', '后端-数据库', '前端-页面', '后端-服务']
  const count = aiGranularity.value === 'fine' ? 5 : aiGranularity.value === 'coarse' ? 2 : 3

  for (let i = 0; i < count; i++) {
    const line = lines[i % lines.length]?.trim() || `子任务 ${i + 1}`
    aiPreview.push({
      title: line,
      module: modules[i % modules.length],
      estimatedHours: Math.ceil(Math.random() * 4) + 1,
      description: `基于需求「${aiPrompt.value.slice(0, 30)}...」拆解的子任务`,
      taskMd: `## ${line}\n\n详细任务描述...`,
      testMd: `## 验收标准\n\n- [ ] 功能正常\n- [ ] 测试通过`,
      disabled: false,
    })
  }

  isGenerating.value = false
}

function confirmAiTasks() {
  const enabledItems = aiPreview.filter((i) => !i.disabled)
  for (const item of enabledItems) {
    store.createTask({
      title: item.title,
      description: item.description,
      priority: form.priority,
      estimatedHours: item.estimatedHours,
      module: item.module,
      source: 'ai',
      taskMd: item.taskMd,
      testMd: item.testMd,
    })
  }
  store.closeCreate()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, black 35%, transparent);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: 520px;
  max-height: min(680px, 85vh);
  background: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-head {
  padding: 1.25rem 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.3px;
  flex: 1;
}

.modal-close {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-3);
  flex-shrink: 0;
  transition: all 0.1s;
}

.modal-close:hover {
  background: var(--surface);
  color: var(--text-1);
}

/* 模式切换 */
.mode-tabs {
  display: flex;
  gap: 0;
  padding: 1rem 1.5rem 0;
}

.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font);
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.1s;
}

.mode-tab:first-child {
  border-radius: var(--r-xs) 0 0 var(--r-xs);
}

.mode-tab:last-child {
  border-radius: 0 var(--r-xs) var(--r-xs) 0;
  border-left: none;
}

.mode-tab.active {
  background: var(--accent-bg);
  color: var(--accent);
  border-color: oklch(0.78 0.06 252);
  font-weight: 600;
}

/* 表单 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-row .form-group {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 0.25rem;
}

.required {
  color: var(--danger);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  background: var(--bg);
  color: var(--text-1);
  font-size: 0.8125rem;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--accent);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-3);
}

.form-textarea {
  resize: vertical;
  min-height: 3rem;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%23B1BAC4' stroke-width='1'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.5rem;
}

/* AI 提示 */
.ai-hint {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background: var(--accent-bg);
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
  border: 1px solid oklch(0.88 0.06 252);
}

.ai-hint-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.ai-hint-desc {
  font-size: 0.6875rem;
  color: var(--text-2);
  line-height: 1.6;
}

/* AI 预览 */
.ai-preview {
  margin-top: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ai-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.ai-preview-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-1);
}

.ai-preview-hint {
  font-size: 0.625rem;
  color: var(--text-3);
}

.ai-preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

.ai-preview-item:last-child {
  border-bottom: none;
}

.ai-preview-item.disabled {
  opacity: 0.4;
}

.ai-check {
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.1s;
}

.ai-check.checked {
  background: var(--accent);
  border-color: var(--accent);
}

.ai-item-content {
  flex: 1;
  min-width: 0;
}

.ai-item-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-1);
}

.ai-item-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.ai-item-module {
  font-size: 0.625rem;
  color: var(--text-3);
}

.ai-item-hours {
  font-size: 0.625rem;
  color: var(--accent);
  font-weight: 500;
}

/* 底部 */
.modal-footer {
  padding: 0.875rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--r-xs);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.1s;
  white-space: nowrap;
}

.modal-btn.ghost {
  background: var(--bg);
  color: var(--text-2);
  border-color: var(--border);
}

.modal-btn.ghost:hover {
  background: var(--hover);
  color: var(--text-1);
}

.modal-btn.primary {
  background: var(--accent);
  color: white;
}

.modal-btn.primary:hover {
  background: color-mix(in oklab, var(--accent) 85%, black);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .modal {
  transform: scale(0.95) translateY(8px);
}
</style>
