<template>
  <section class="tasks-page">
    <!-- 左侧统计面板 -->
    <StatsPanel />

    <!-- 右侧任务面板 -->
    <div class="task-panel">
      <!-- 子工具栏 -->
      <div class="task-toolbar">
        <div class="toolbar-search">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1" />
            <path d="M9 9L11 11" stroke="currentColor" stroke-width="1" />
          </svg>
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="搜索任务..."
          />
        </div>

        <button
          type="button"
          class="filter-btn"
          :class="{ active: store.filterStatus !== 'all' }"
          @click="cycleStatusFilter"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3H8M3 5H7M4 7H6" stroke="currentColor" stroke-width="1" />
          </svg>
          {{ statusFilterLabel }}
        </button>

        <button
          type="button"
          class="filter-btn"
          :class="{ active: store.filterPriority !== 'all' }"
          @click="cyclePriorityFilter"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="3" stroke="currentColor" stroke-width="1" />
            <path d="M5 3V5.5L6.5 6" stroke="currentColor" stroke-width="1" />
          </svg>
          {{ priorityFilterLabel }}
        </button>

        <!-- 视图切换 -->
        <div class="view-toggle">
          <button
            type="button"
            class="vt-btn"
            :class="{ active: store.viewMode === 'kanban' }"
            @click="store.viewMode = 'kanban'"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="2.5" height="10" rx="0.5" stroke="currentColor" stroke-width="1" />
              <rect x="4.75" y="1" width="2.5" height="7" rx="0.5" stroke="currentColor" stroke-width="1" />
              <rect x="8.5" y="1" width="2.5" height="9" rx="0.5" stroke="currentColor" stroke-width="1" />
            </svg>
            看板
          </button>
          <button
            type="button"
            class="vt-btn"
            :class="{ active: store.viewMode === 'list' }"
            @click="store.viewMode = 'list'"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 3H11M1 6H11M1 9H11" stroke="currentColor" stroke-width="1" />
            </svg>
            列表
          </button>
        </div>

        <!-- 新建按钮 -->
        <button type="button" class="toolbar-btn--primary" @click="store.openCreate()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1" />
          </svg>
          新建任务
        </button>
      </div>

      <!-- 内容区 -->
      <KanbanView
        v-if="store.viewMode === 'kanban'"
        @open-detail="store.openDetail"
        @create-task="handleCreateWithStatus"
      />
      <ListView
        v-else
        @open-detail="store.openDetail"
      />
    </div>

    <!-- 模态框 -->
    <TaskDetailModal />
    <CreateTaskModal />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore, type TaskStatus, type TaskPriority } from '@/stores/tasks'
import StatsPanel from './components/StatsPanel.vue'
import KanbanView from './components/KanbanView.vue'
import ListView from './components/ListView.vue'
import TaskDetailModal from './components/TaskDetailModal.vue'
import CreateTaskModal from './components/CreateTaskModal.vue'

const store = useTasksStore()

const statusFilterOptions: Array<TaskStatus | 'all'> = ['all', 'todo', 'in_progress', 'done']
const statusLabels: Record<string, string> = {
  all: '全部状态',
  todo: '待开始',
  in_progress: '进行中',
  done: '已完成',
}

const priorityFilterOptions: Array<TaskPriority | 'all'> = ['all', 'high', 'medium', 'low']
const priorityLabels: Record<string, string> = {
  all: '全部优先级',
  high: '高优先',
  medium: '中优先',
  low: '低优先',
}

const statusFilterLabel = computed(() => statusLabels[store.filterStatus])
const priorityFilterLabel = computed(() => priorityLabels[store.filterPriority])

function cycleStatusFilter() {
  const idx = statusFilterOptions.indexOf(store.filterStatus)
  store.filterStatus = statusFilterOptions[(idx + 1) % statusFilterOptions.length]
}

function cyclePriorityFilter() {
  const idx = priorityFilterOptions.indexOf(store.filterPriority)
  store.filterPriority = priorityFilterOptions[(idx + 1) % priorityFilterOptions.length]
}

function handleCreateWithStatus(_status?: TaskStatus) {
  store.openCreate()
}
</script>

<style scoped>
.tasks-page {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

/* 右侧任务面板 */
.task-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* 子工具栏 */
.task-toolbar {
  height: 3rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  gap: 0.625rem;
  flex-shrink: 0;
}

.toolbar-search {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  padding: 0 0.625rem;
  height: 1.875rem;
  flex: 1;
  max-width: 280px;
  color: var(--text-3);
  transition: border-color 0.15s;
}

.toolbar-search:focus-within {
  border-color: var(--accent);
}

.toolbar-search input {
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-family: var(--font);
  color: var(--text-1);
  outline: none;
  flex: 1;
  min-width: 0;
}

.toolbar-search input::placeholder {
  color: var(--text-3);
}

/* 筛选按钮 */
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-family: var(--font);
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-2);
  transition: all 0.1s;
  white-space: nowrap;
}

.filter-btn:hover {
  background: var(--hover);
}

.filter-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

/* 视图切换 */
.view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  margin-left: auto;
}

.vt-btn {
  padding: 0.3125rem 0.75rem;
  font-size: 0.6875rem;
  cursor: pointer;
  background: var(--bg);
  color: var(--text-2);
  border: none;
  font-family: var(--font);
  transition: all 0.1s;
  display: flex;
  align-items: center;
  gap: 0.3125rem;
}

.vt-btn.active {
  background: var(--surface);
  color: var(--text-1);
  font-weight: 500;
}

/* 主操作按钮 */
.toolbar-btn--primary {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--r-xs);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  border: none;
  background: var(--accent);
  color: white;
  transition: all 0.1s;
  white-space: nowrap;
}

.toolbar-btn--primary:hover {
  background: color-mix(in oklab, var(--accent) 85%, black);
}

.toolbar-btn--primary:active {
  transform: scale(0.98);
}
</style>
