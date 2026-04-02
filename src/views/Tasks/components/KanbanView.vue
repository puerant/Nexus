<template>
  <div class="kanban-view">
    <!-- 待开始 -->
    <div
      class="kanban-col"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop($event, 'todo')"
    >
      <div class="col-head">
        <div class="col-dot todo" />
        <span class="col-title">待开始</span>
        <span class="col-count">{{ store.filteredTodoTasks.length }}</span>
        <button type="button" class="col-add" @click="$emit('createTask', 'todo')">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1V9M1 5H9" stroke="currentColor" stroke-width="1" />
          </svg>
        </button>
      </div>
      <div class="col-body">
        <TaskCard
          v-for="task in store.filteredTodoTasks"
          :key="task.id"
          :task="task"
          @open-detail="$emit('openDetail', $event)"
        />
        <div v-if="store.filteredTodoTasks.length === 0" class="col-empty">
          暂无待开始任务
        </div>
      </div>
    </div>

    <!-- 进行中 -->
    <div
      class="kanban-col"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop($event, 'in_progress')"
    >
      <div class="col-head">
        <div class="col-dot progress" />
        <span class="col-title">进行中</span>
        <span class="col-count">{{ store.filteredInProgressTasks.length }}</span>
        <button type="button" class="col-add" @click="$emit('createTask', 'in_progress')">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1V9M1 5H9" stroke="currentColor" stroke-width="1" />
          </svg>
        </button>
      </div>
      <div class="col-body">
        <TaskCard
          v-for="task in store.filteredInProgressTasks"
          :key="task.id"
          :task="task"
          @open-detail="$emit('openDetail', $event)"
        />
        <div v-if="store.filteredInProgressTasks.length === 0" class="col-empty">
          暂无进行中任务
        </div>
      </div>
    </div>

    <!-- 已完成 -->
    <div
      class="kanban-col"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop($event, 'done')"
    >
      <div class="col-head">
        <div class="col-dot done" />
        <span class="col-title">已完成</span>
        <span class="col-count">{{ store.filteredDoneTasks.length }}</span>
      </div>
      <div class="col-body">
        <TaskCard
          v-for="task in store.filteredDoneTasks"
          :key="task.id"
          :task="task"
          @open-detail="$emit('openDetail', $event)"
        />
        <div v-if="store.filteredDoneTasks.length === 0" class="col-empty">
          暂无已完成任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore, type TaskStatus } from '@/stores/tasks'
import TaskCard from './TaskCard.vue'

const store = useTasksStore()

defineEmits<{
  openDetail: [id: string]
  createTask: [status?: TaskStatus]
}>()

function onDragOver(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  el.classList.add('drag-over')
}

function onDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  el.classList.remove('drag-over')
}

function onDrop(e: DragEvent, status: TaskStatus) {
  const el = e.currentTarget as HTMLElement
  el.classList.remove('drag-over')
  const taskId = e.dataTransfer?.getData('text/plain')
  if (taskId) {
    store.changeTaskStatus(taskId, status)
  }
}
</script>

<style scoped>
.kanban-view {
  flex: 1;
  overflow-x: auto;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.875rem;
}

.kanban-col {
  flex-shrink: 0;
  width: 260px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}

.kanban-col.drag-over {
  background: color-mix(in oklab, var(--accent) 4%, transparent);
}

.col-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  padding: 0 0.125rem;
}

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-dot.todo { background: var(--text-3); }
.col-dot.progress { background: var(--warning); }
.col-dot.done { background: var(--accent); }

.col-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-1);
  flex: 1;
}

.col-count {
  font-size: 0.6875rem;
  color: var(--text-3);
  background: var(--surface);
  padding: 0.0625rem 0.4375rem;
  border-radius: var(--radius-pill);
}

.col-add {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-3);
  transition: all 0.1s;
}

.col-add:hover {
  background: var(--surface);
  color: var(--text-2);
}

.col-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.col-empty {
  font-size: 0.75rem;
  color: var(--text-3);
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
}
</style>
