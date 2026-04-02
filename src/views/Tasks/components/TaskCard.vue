<template>
  <div
    class="task-card"
    :class="{
      'is-done': task.status === 'done',
      'is-running': isRunning,
      'is-dragging': isDragging,
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('openDetail', task.id)"
  >
    <!-- 子任务指示 -->
    <div v-if="childCount > 0" class="task-card-children">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1" />
        <path d="M5 3V7M3 5H7" stroke="currentColor" stroke-width="1" />
      </svg>
      {{ childCount }} 个子任务
    </div>

    <!-- 标题 -->
    <div class="task-card-title" :class="{ done: task.status === 'done' }">
      {{ task.title }}
    </div>

    <!-- 标签 -->
    <div class="task-card-meta">
      <span v-if="task.priority === 'high'" class="task-tag tag-high">高优先</span>
      <span v-else-if="task.priority === 'medium'" class="task-tag tag-mid">中优先</span>
      <span v-else-if="task.priority === 'low'" class="task-tag tag-low">低优先</span>
      <span v-if="task.source === 'ai'" class="task-tag tag-ai">AI 辅助</span>
      <span v-if="task.module" class="task-tag tag-module">{{ task.module }}</span>
    </div>

    <!-- 底部：时间 + 计时器 -->
    <div class="task-card-footer">
      <span class="task-time" :class="{ active: isRunning }">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1" />
          <path d="M5 3V5L6.5 6" stroke="currentColor" stroke-width="1" />
        </svg>
        <template v-if="task.status === 'done'">
          耗时 {{ store.formatHoursMinutes(task.actualHours) }}
        </template>
        <template v-else-if="isRunning">
          {{ store.formatTimer(task.timerSeconds) }}
        </template>
        <template v-else-if="task.timerSeconds > 0">
          {{ store.formatTimer(task.timerSeconds) }}
        </template>
        <template v-else-if="task.estimatedHours > 0">
          预计 {{ task.estimatedHours }}h
        </template>
        <template v-else>—</template>
      </span>

      <button
        v-if="task.status !== 'done'"
        type="button"
        class="task-timer-btn"
        :class="{ running: isRunning }"
        @click.stop="toggleTimer"
      >
        <template v-if="isRunning">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <rect x="2.5" y="2.5" width="1.5" height="4" fill="currentColor" />
            <rect x="5" y="2.5" width="1.5" height="4" fill="currentColor" />
          </svg>
          暂停
        </template>
        <template v-else>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" stroke-width="1" />
            <path d="M4.5 2.5V4.5L6 5.5" stroke="currentColor" stroke-width="1" />
          </svg>
          计时
        </template>
      </button>

      <!-- Token 消耗 -->
      <span v-if="task.tokensUsed > 0" class="task-tokens">
        {{ formatTokens(task.tokensUsed) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasksStore, type Task } from '@/stores/tasks'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  openDetail: [id: string]
}>()

const store = useTasksStore()
const isDragging = ref(false)

const childCount = computed(() => store.getChildTasks(props.task.id).length)
const isRunning = computed(() => store.isTimerRunning(props.task.id))

function onDragStart(e: DragEvent) {
  isDragging.value = true
  e.dataTransfer?.setData('text/plain', props.task.id)
  e.dataTransfer!.effectAllowed = 'move'
}

function onDragEnd() {
  isDragging.value = false
}

function toggleTimer() {
  if (isRunning.value) {
    store.stopTimer(props.task.id)
  } else {
    store.startTimer(props.task.id)
  }
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K tok`
  return `${tokens} tok`
}
</script>

<style scoped>
.task-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.task-card:hover {
  border-color: oklch(0.78 0.06 252);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.task-card.is-running {
  border-color: var(--warning);
}

.task-card.is-done {
  opacity: 0.7;
}

.task-card.is-dragging {
  opacity: 0.4;
  transform: rotate(2deg);
}

.task-card-children {
  font-size: 0.6875rem;
  color: var(--accent);
  margin-bottom: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-card-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.45;
  margin-bottom: 0.5rem;
}

.task-card-title.done {
  text-decoration: line-through;
  color: var(--text-2);
}

.task-card-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.task-tag {
  font-size: 0.625rem;
  padding: 0.125rem 0.4375rem;
  border-radius: var(--radius-pill);
  font-weight: 500;
  white-space: nowrap;
}

.tag-high {
  background: color-mix(in oklab, var(--danger) 10%, white);
  color: var(--danger);
}

.tag-mid {
  background: color-mix(in oklab, var(--warning) 12%, white);
  color: color-mix(in oklab, var(--warning) 80%, black);
}

.tag-low {
  background: var(--surface);
  color: var(--text-2);
}

.tag-ai {
  background: var(--accent-bg);
  color: var(--accent);
}

.tag-module {
  background: var(--surface);
  color: var(--text-3);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  gap: 0.375rem;
}

.task-time {
  font-size: 0.6875rem;
  color: var(--text-3);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-time.active {
  color: var(--accent);
}

.task-timer-btn {
  font-size: 0.6875rem;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  border: 1px solid oklch(0.82 0.06 252);
  cursor: pointer;
  background: var(--accent-bg);
  transition: all 0.1s;
  white-space: nowrap;
}

.task-timer-btn.running {
  color: color-mix(in oklab, var(--warning) 80%, black);
  background: color-mix(in oklab, var(--warning) 12%, white);
  border-color: color-mix(in oklab, var(--warning) 30%, white);
}

.task-timer-btn:hover {
  opacity: 0.85;
}

.task-tokens {
  font-size: 0.625rem;
  color: var(--text-3);
  background: var(--surface);
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
}
</style>
