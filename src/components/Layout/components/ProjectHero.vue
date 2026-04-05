<template>
  <UiPageIntro eyebrow="Project Workspace" :title="title" :description="description">
    <template #aside>
      <UiSurface class="project-hero-status" padding="sm">
        <div class="project-status">
          <span class="status-dot" />
          <span>{{ status }}</span>
        </div>
      </UiSurface>
    </template>
  </UiPageIntro>
</template>

<script setup lang="ts">
import { UiPageIntro } from '@/components/ui/PageIntro'
import { UiSurface } from '@/components/ui/Surface'

defineProps<{
  title: string
  description: string
  status: string
}>()
</script>

<style scoped>
.project-hero-status {
  min-width: 10rem;
}

.project-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--color-success);
}
</style>
