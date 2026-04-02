<template>
  <div class="list-view">
    <!-- 表头 -->
    <div class="list-head">
      <div class="lh-check" />
      <div class="lh-col" style="flex: 1">任务名称</div>
      <div class="lh-col" style="width: 100px">状态</div>
      <div class="lh-col" style="width: 80px">优先级</div>
      <div class="lh-col" style="width: 90px">模块</div>
      <div class="lh-col" style="width: 80px">用时</div>
      <div class="lh-col" style="width: 80px">Token</div>
      <div class="lh-col" style="width: 48px" />
    </div>

    <!-- 行 -->
    <div
      v-for="task in store.filteredTasks"
      :key="task.id"
      class="list-row"
      :class="{ done: task.status === 'done' }"
      @click="$emit('openDetail', task.id)"
    >
      <!-- 勾选 -->
      <div class="lr-check" @click.stop>
        <button
          type="button"
          class="lr-checkbox"
          :class="{ checked: task.status === 'done' }"
          @click="toggleDone(task)"
        >
          <svg v-if="task.status === 'done'" width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M2 4.5L3.8 6.5L7 3" stroke="white" stroke-width="1" />
          </svg>
        </button>
      </div>

      <!-- 标题 -->
      <div class="lr-title" :class="{ done: task.status === 'done' }">
        {{ task.title }}
        <span v-if="childCounts[task.id]" class="lr-subtask-badge">
          {{ childCounts[task.id] }} 子任务
        </span>
      </div>

      <!-- 状态 -->
      <div class="lr-status">
        <span class="task-tag" :class="statusClass(task.status)">
          {{ statusLabel(task.status) }}
        </span>
      </div>

      <!-- 优先级 -->
      <div class="lr-priority">
        <span class="task-tag" :class="priorityClass(task.priority)">
          {{ priorityLabel(task.priority) }}
        </span>
      </div>

      <!-- 模块 -->
      <div class="lr-module truncate">{{ task.module || '—' }}</div>

      <!-- 用时 -->
      <div class="lr-time">
        <template v-if="task.status === 'done'">
          {{ store.formatHoursMinutes(task.actualHours) }}
        </template>
        <template v-else-if="task.timerSeconds > 0">
          <span class="lr-time-active">{{ store.formatTimer(task.timerSeconds) }}</span>
        </template>
        <template v-else-if="task.estimatedHours > 0">
          {{ task.estimatedHours }}h
        </template>
        <template v-else>—</template>
      </div>

      <!-- Token -->
      <div class="lr-tokens">
        {{ task.tokensUsed > 0 ? formatTokens(task.tokensUsed) : '—' }}
      </div>

      <!-- 操作 -->
      <div class="lr-actions">
        <button type="button" class="lr-more" @click.stop="$emit('openDetail', task.id)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="3" r="0.75" fill="currentColor" />
            <circle cx="6" cy="6" r="0.75" fill="currentColor" />
            <circle cx="6" cy="9" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="store.filteredTasks.length === 0" class="list-empty">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.5" />
        <path d="M10 16H22M16 10V22" stroke="currentColor" stroke-width="1.5" />
      </svg>
      <span>暂无匹配的任务</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore, type Task, type TaskStatus, type TaskPriority } from '@/stores/tasks'

const store = useTasksStore()

defineEmits<{
  openDetail: [id: string]
}>()

const childCounts = computed(() => {
  const map: Record<string, number> = {}
  for (const task of store.tasks) {
    if (task.parentId) {
      map[task.parentId] = (map[task.parentId] || 0) + 1
    }
  }
  return map
})

function toggleDone(task: Task) {
  if (task.status === 'done') {
    store.changeTaskStatus(task.id, 'todo')
  } else {
    store.changeTaskStatus(task.id, 'done')
  }
}

function statusClass(status: TaskStatus): string {
  if (status === 'done') return 'status-done'
  if (status === 'in_progress') return 'status-progress'
  return 'status-todo'
}

function statusLabel(status: TaskStatus): string {
  if (status === 'done') return '已完成'
  if (status === 'in_progress') return '进行中'
  return '待开始'
}

function priorityClass(priority: TaskPriority): string {
  if (priority === 'high') return 'tag-high'
  if (priority === 'medium') return 'tag-mid'
  return 'tag-low'
}

function priorityLabel(priority: TaskPriority): string {
  if (priority === 'high') return '高'
  if (priority === 'medium') return '中'
  return '低'
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return String(tokens)
}
</script>

<style scoped>
.list-view {
  flex: 1;
  overflow-y: auto;
}

.list-head {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  height: 2.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 2;
}

.lh-check { width: 2rem; flex-shrink: 0; }

.lh-col {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.list-row {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  height: 2.875rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}

.list-row:hover {
  background: var(--hover);
}

.list-row.done {
  opacity: 0.65;
}

.lr-check {
  width: 2rem;
  flex-shrink: 0;
}

.lr-checkbox {
  width: 0.9375rem;
  height: 0.9375rem;
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  transition: all 0.1s;
}

.lr-checkbox:hover {
  border-color: var(--accent);
}

.lr-checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
}

.lr-title {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.lr-title.done {
  text-decoration: line-through;
  color: var(--text-3);
}

.lr-subtask-badge {
  font-size: 0.625rem;
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
  background: var(--accent-bg);
  color: var(--accent);
  white-space: nowrap;
}

.lr-status,
.lr-priority,
.lr-module,
.lr-time,
.lr-tokens {
  width: 80px;
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--text-2);
}

.lr-status { width: 100px; }
.lr-time-active { color: var(--accent); font-weight: 500; }

.task-tag {
  font-size: 0.625rem;
  padding: 0.125rem 0.4375rem;
  border-radius: var(--radius-pill);
  font-weight: 500;
  white-space: nowrap;
}

.status-done { background: var(--accent-bg); color: var(--accent); }
.status-progress { background: color-mix(in oklab, var(--warning) 12%, white); color: color-mix(in oklab, var(--warning) 80%, black); }
.status-todo { background: var(--surface); color: var(--text-2); }

.tag-high { background: color-mix(in oklab, var(--danger) 10%, white); color: var(--danger); }
.tag-mid { background: color-mix(in oklab, var(--warning) 12%, white); color: color-mix(in oklab, var(--warning) 80%, black); }
.tag-low { background: var(--surface); color: var(--text-2); }

.lr-actions {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.lr-more {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.1s;
}

.lr-more:hover {
  background: var(--surface);
  color: var(--text-2);
}

.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--text-3);
  font-size: 0.8125rem;
}
</style>
