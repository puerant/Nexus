<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="store.isDetailOpen && task" class="modal-overlay" @click.self="store.closeDetail()">
        <div class="modal">
          <!-- 头部 -->
          <div class="modal-head">
            <div class="modal-title">{{ task.title }}</div>
            <button type="button" class="modal-close" @click="store.closeDetail()">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1" />
              </svg>
            </button>
          </div>

          <!-- 标签 -->
          <div class="modal-tags">
            <span v-if="task.priority === 'high'" class="task-tag tag-high">高优先</span>
            <span v-else-if="task.priority === 'medium'" class="task-tag tag-mid">中优先</span>
            <span v-else class="task-tag tag-low">低优先</span>
            <span class="task-tag" :class="statusTagClass">{{ statusTagLabel }}</span>
            <span v-if="task.source === 'ai'" class="task-tag tag-ai">AI 辅助</span>
            <span v-if="task.module" class="task-tag tag-module">{{ task.module }}</span>
          </div>

          <!-- 内容 -->
          <div class="modal-body">
            <!-- 描述 -->
            <div class="modal-section">
              <div class="section-title">任务描述</div>
              <div class="section-desc">{{ task.description || '暂无描述' }}</div>
            </div>

            <!-- 任务信息 -->
            <div class="modal-section">
              <div class="section-title">任务信息</div>
              <div class="meta-grid">
                <div class="meta-item">
                  <div class="meta-label">创建时间</div>
                  <div class="meta-val">{{ formatDate(task.createdAt) }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">预计工时</div>
                  <div class="meta-val">{{ task.estimatedHours > 0 ? `${task.estimatedHours} 小时` : '—' }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">创建方式</div>
                  <div class="meta-val">{{ task.source === 'ai' ? 'AI 生成' : '手动创建' }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Token 消耗</div>
                  <div class="meta-val">{{ task.tokensUsed > 0 ? formatTokens(task.tokensUsed) : '—' }}</div>
                </div>
                <div v-if="task.relatedFiles.length > 0" class="meta-item">
                  <div class="meta-label">关联文件</div>
                  <div class="meta-val accent">{{ task.relatedFiles.join(', ') }}</div>
                </div>
                <div v-if="task.completedAt" class="meta-item">
                  <div class="meta-label">完成时间</div>
                  <div class="meta-val">{{ formatDate(task.completedAt) }}</div>
                </div>
              </div>
            </div>

            <!-- task.md -->
            <div v-if="task.taskMd" class="modal-section">
              <div class="section-title">任务详情 (task.md)</div>
              <div class="md-block">{{ task.taskMd }}</div>
            </div>

            <!-- test.md 验收标准 -->
            <div v-if="task.testMd" class="modal-section">
              <div class="section-title">验收标准 (test.md)</div>
              <div class="md-block">{{ task.testMd }}</div>
            </div>

            <!-- 子任务 -->
            <div v-if="children.length > 0" class="modal-section">
              <div class="section-title">子任务 ({{ children.length }})</div>
              <div class="children-list">
                <div
                  v-for="child in children"
                  :key="child.id"
                  class="child-item"
                  @click="store.openDetail(child.id)"
                >
                  <span class="child-status" :class="child.status" />
                  <span class="child-title" :class="{ done: child.status === 'done' }">
                    {{ child.title }}
                  </span>
                  <span class="child-priority" :class="`p-${child.priority}`">
                    {{ child.priority === 'high' ? '高' : child.priority === 'medium' ? '中' : '低' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 执行日志 -->
            <div v-if="task.executionLog.length > 0" class="modal-section">
              <div class="section-title">执行日志</div>
              <div class="log-block">
                <div
                  v-for="(log, i) in task.executionLog"
                  :key="i"
                  class="log-entry"
                  :class="log.type"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-msg">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="modal-footer">
            <div class="timer-display" :class="{ running: isTimerRunning }">
              {{ store.formatTimer(task.timerSeconds) }}
            </div>
            <div class="footer-actions">
              <button
                v-if="task.status !== 'done'"
                type="button"
                class="modal-btn ghost"
                @click="markDone"
              >
                手动完成
              </button>
              <button
                v-if="task.status === 'done'"
                type="button"
                class="modal-btn ghost"
                @click="reopen"
              >
                重新开启
              </button>
              <button type="button" class="modal-btn ghost" @click="editTask">
                编辑
              </button>
              <button type="button" class="modal-btn danger" @click="removeTask">
                删除
              </button>
              <button
                v-if="task.source === 'ai' && task.status !== 'done'"
                type="button"
                class="modal-btn primary"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" stroke-width="1" />
                </svg>
                继续 AI 执行
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const store = useTasksStore()

const task = computed(() => {
  if (!store.selectedTaskId) return null
  return store.getTaskById(store.selectedTaskId)
})

const children = computed(() => {
  if (!task.value) return []
  return store.getChildTasks(task.value.id)
})

const isTimerRunning = computed(() => {
  if (!task.value) return false
  return store.isTimerRunning(task.value.id)
})

const statusTagClass = computed(() => {
  if (!task.value) return ''
  if (task.value.status === 'done') return 'status-done'
  if (task.value.status === 'in_progress') return 'status-progress'
  return 'status-todo'
})

const statusTagLabel = computed(() => {
  if (!task.value) return ''
  if (task.value.status === 'done') return '已完成'
  if (task.value.status === 'in_progress') return '进行中'
  return '待开始'
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return String(tokens)
}

function markDone() {
  if (task.value) store.changeTaskStatus(task.value.id, 'done')
}

function reopen() {
  if (task.value) store.changeTaskStatus(task.value.id, 'todo')
}

function editTask() {
  if (task.value) {
    store.closeDetail()
    store.openEdit(task.value.id)
  }
}

function removeTask() {
  if (task.value && confirm('确认删除此任务？')) {
    store.deleteTask(task.value.id)
    store.closeDetail()
  }
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
  width: 560px;
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
  align-items: flex-start;
  gap: 0.75rem;
}

.modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.3px;
  flex: 1;
  line-height: 1.35;
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

.modal-tags {
  padding: 0.75rem 1.5rem 0;
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.task-tag {
  font-size: 0.625rem;
  padding: 0.125rem 0.4375rem;
  border-radius: var(--radius-pill);
  font-weight: 500;
}

.tag-high { background: color-mix(in oklab, var(--danger) 10%, white); color: var(--danger); }
.tag-mid { background: color-mix(in oklab, var(--warning) 12%, white); color: color-mix(in oklab, var(--warning) 80%, black); }
.tag-low { background: var(--surface); color: var(--text-2); }
.tag-ai { background: var(--accent-bg); color: var(--accent); }
.tag-module { background: var(--surface); color: var(--text-3); }
.status-done { background: var(--accent-bg); color: var(--accent); }
.status-progress { background: color-mix(in oklab, var(--warning) 12%, white); color: color-mix(in oklab, var(--warning) 80%, black); }
.status-todo { background: var(--surface); color: var(--text-2); }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.modal-section {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-size: 0.8125rem;
  color: var(--text-1);
  line-height: 1.7;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.meta-item {
  background: var(--surface);
  border-radius: var(--r-xs);
  padding: 0.625rem 0.75rem;
}

.meta-label {
  font-size: 0.625rem;
  color: var(--text-3);
  margin-bottom: 0.25rem;
}

.meta-val {
  font-size: 0.8125rem;
  color: var(--text-1);
  font-weight: 500;
}

.meta-val.accent { color: var(--accent); }

.md-block {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-2);
  line-height: 1.7;
  white-space: pre-wrap;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
}

/* 子任务 */
.children-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--r-xs);
  background: var(--surface);
  cursor: pointer;
  transition: background 0.1s;
}

.child-item:hover {
  background: var(--hover);
}

.child-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.child-status.todo { background: var(--text-3); }
.child-status.in_progress { background: var(--warning); }
.child-status.done { background: var(--accent); }

.child-title {
  flex: 1;
  font-size: 0.75rem;
  color: var(--text-1);
}

.child-title.done {
  text-decoration: line-through;
  color: var(--text-3);
}

.child-priority {
  font-size: 0.625rem;
  font-weight: 500;
}

.child-priority.p-high { color: var(--danger); }
.child-priority.p-medium { color: var(--warning); }
.child-priority.p-low { color: var(--text-3); }

/* 执行日志 */
.log-block {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.875rem;
}

.log-entry {
  font-size: 0.75rem;
  color: var(--text-2);
  line-height: 1.8;
  display: flex;
  gap: 0.75rem;
}

.log-entry.waiting { color: var(--accent); }
.log-entry.success { color: var(--success); }

.log-time {
  color: var(--text-3);
  flex-shrink: 0;
  width: 3rem;
}

/* 底部 */
.modal-footer {
  padding: 0.875rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.625rem;
  align-items: center;
  flex-shrink: 0;
}

.timer-display {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.timer-display.running {
  color: var(--accent);
}

.footer-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
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

.modal-btn.danger {
  background: color-mix(in oklab, var(--danger) 10%, white);
  color: var(--danger);
  border-color: color-mix(in oklab, var(--danger) 25%, white);
}

.modal-btn.danger:hover {
  background: color-mix(in oklab, var(--danger) 15%, white);
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
