<template>
  <div class="prompts-card">
    <div class="card-head">
      <div class="card-head-title">
        <UiIcon icon="lucide:file-text" size="sm" />
        提示词记录
      </div>
      <button class="view-all-btn">查看全部</button>
    </div>
    <div class="prompt-table-head">
      <div class="pt-col" style="flex: 1">名称</div>
      <div class="pt-col" style="width: 80px">评分</div>
      <div class="pt-col" style="width: 60px; text-align: center">使用次数</div>
    </div>
    <div
      v-for="prompt in prompts"
      :key="prompt.name"
      class="prompt-row"
    >
      <div style="flex: 1">
        <div class="pr-name">{{ prompt.name }}</div>
        <div class="pr-module">{{ prompt.module }}</div>
      </div>
      <div style="width: 80px">
        <div class="stars">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ empty: i > Math.round(prompt.rating) }"
          >&#9733;</span>
        </div>
        <div class="star-value">{{ prompt.rating.toFixed(1) }}</div>
      </div>
      <div class="pr-uses">{{ prompt.uses }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '@/components/ui/Icon'

export interface PromptEntry {
  name: string
  module: string
  rating: number
  uses: number
}

defineProps<{
  prompts: PromptEntry[]
}>()
</script>

<style scoped>
.prompts-card {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-head {
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-btn {
  font-size: 0.6875rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--r-xs, 6px);
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.view-all-btn:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-primary);
}

.prompt-table-head {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  background: var(--color-surface-soft);
  border-bottom: 1px solid var(--color-border-soft);
}

.pt-col {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03125rem;
}

.prompt-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  transition: background 0.1s;
  cursor: pointer;
}

.prompt-row:last-child {
  border-bottom: none;
}

.prompt-row:hover {
  background: var(--color-surface-soft);
}

.pr-name {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.pr-module {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 0.125rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #FEBC2E;
  font-size: 0.75rem;
  line-height: 1;
}

.star.empty {
  color: var(--color-border-soft);
}

.star-value {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 0.0625rem;
}

.pr-uses {
  width: 60px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
