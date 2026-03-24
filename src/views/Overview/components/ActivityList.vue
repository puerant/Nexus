<template>
  <div v-if="activities.length > 0" class="activity-list">
    <div v-for="(act, i) in activities" :key="i" class="activity-item">
      <span class="activity-dot" :class="{ important: act.important }" />
      <span class="activity-text">{{ act.text }}</span>
      <span class="activity-time">{{ act.time }}</span>
    </div>
  </div>
  <div v-else class="activity-empty">
    <strong>{{ emptyTitle }}</strong>
    <p>{{ emptyDescription }}</p>
  </div>
</template>

<script setup lang="ts">
export interface ActivityItem {
  text: string
  time: string
  important?: boolean
}

withDefaults(
  defineProps<{
    activities: ActivityItem[]
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    emptyTitle: '暂无动态',
    emptyDescription: '开始使用后，这里会显示最近的操作记录。',
  },
)
</script>

<style scoped>
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.activity-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--color-text-tertiary);
  flex-shrink: 0;
}

.activity-dot.important {
  background: var(--color-accent);
}

.activity-text {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--color-text-primary);
}

.activity-time {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.activity-empty {
  min-height: 6rem;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--color-text-secondary);
}

.activity-empty p {
  margin-top: 0.375rem;
  max-width: 22rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}
</style>
