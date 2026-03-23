<template>
  <section class="phase-placeholder">
    <div class="phase-header">
      <div class="header-info">
        <h1 class="header-title">{{ title }}</h1>
        <span class="header-meta">{{ description }}</span>
      </div>
      <div class="model-select-wrap">
        <label class="select-label">执行模型</label>
        <select v-model="selectedModel" class="model-select">
          <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
          <option value="claude-opus-4-6">Claude Opus 4.6</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
        </select>
      </div>
    </div>

    <div class="phase-grid">
      <div class="panel">
        <div class="panel-label">当前状态</div>
        <h3>阶段工作区准备中</h3>
        <p class="panel-copy">这里将承载该阶段的 AI 协作、文档沉淀和操作面板。当前先保留统一的占位结构，方便后续逐步填充真实功能。</p>
        <div v-if="prerequisite" class="prerequisite">
          <UiStatusBadge tone="warning">前置条件</UiStatusBadge>
          <span>{{ prerequisite }}</span>
        </div>
      </div>

      <div class="panel muted">
        <div class="panel-label">建议下一步</div>
        <ul class="checklist">
          <li>确认当前阶段的输入材料已经就绪</li>
          <li>选择适合本阶段的 AI 模型</li>
          <li>开始生成文档、方案或执行结果</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import { useProjectStore } from '@/stores/project.ts'

defineProps<{
  title: string
  description: string
  prerequisite?: string
}>()

const projectStore = useProjectStore()
const selectedModel = ref(projectStore.currentProject?.defaultModel ?? 'claude-sonnet-4-6')
</script>

<style scoped>
.phase-placeholder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.phase-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.header-meta {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.model-select-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.select-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.model-select {
  min-width: 10rem;
  height: 2rem;
  padding: 0 0.625rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  font-size: 0.8125rem;
}

.phase-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 0.75rem;
}

.panel {
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-soft);
}

.panel.muted {
  background: var(--color-surface-soft);
}

.panel-label {
  margin-bottom: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.panel-copy {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.prerequisite {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.checklist {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
}

.checklist li {
  position: relative;
  padding-left: 0.875rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--color-text-primary);
}

.checklist li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: var(--color-accent);
}

@media (max-width: 900px) {
  .phase-grid {
    grid-template-columns: 1fr;
  }

  .phase-header {
    flex-direction: column;
  }
}
</style>
