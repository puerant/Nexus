<template>
  <section class="phase-placeholder">
    <UiSurface tone="accent" class="phase-hero">
      <UiPageIntro eyebrow="Phase Workspace" :title="title" :description="description">
        <template #aside>
          <div class="phase-aside">
            <UiSurface class="model-panel" tone="muted" rounded="lg">
              <div class="panel-label">执行模型</div>
              <select v-model="selectedModel" class="model-select">
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
              </select>
            </UiSurface>
            <UiSurface class="icon-panel" tone="muted" rounded="lg">
              <slot name="icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.5" />
                  <path d="M24 12V24L32 32" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </slot>
            </UiSurface>
          </div>
        </template>
      </UiPageIntro>
    </UiSurface>

    <div class="phase-grid">
      <UiSurface>
        <div class="panel-label">当前状态</div>
        <h3>阶段工作区准备中</h3>
        <p class="panel-copy">这里将承载该阶段的 AI 协作、文档沉淀和操作面板。当前先保留统一的占位结构，方便后续逐步填充真实功能。</p>
        <div v-if="prerequisite" class="prerequisite">
          <UiStatusBadge tone="warning">前置条件</UiStatusBadge>
          <span>{{ prerequisite }}</span>
        </div>
      </UiSurface>

      <UiSurface tone="muted">
        <div class="panel-label">建议下一步</div>
        <ul class="checklist">
          <li>确认当前阶段的输入材料已经就绪</li>
          <li>选择适合本阶段的 AI 模型</li>
          <li>开始生成文档、方案或执行结果</li>
        </ul>
      </UiSurface>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UiPageIntro from '@/components/ui/UiPageIntro.vue'
import UiStatusBadge from '@/components/ui/UiStatusBadge.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
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
.phase-placeholder { display: flex; flex-direction: column; gap: 1.125rem; }
.phase-hero { padding: 1.5rem; }
.phase-aside { min-width: 13rem; display: flex; flex-direction: column; gap: 0.9rem; }
.model-panel, .icon-panel { padding: 1rem; }
.icon-panel { min-height: 9.5rem; display: grid; place-items: center; color: var(--color-accent); }
.panel-label { margin-bottom: 0.65rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-tertiary); }
.model-select {
  width: 100%; min-height: 2.35rem; padding: 0 0.85rem; border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); background: var(--color-surface-raised); color: var(--color-text-primary);
}
.phase-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.125rem; }
h3 { font-size: var(--type-heading-lg); margin-bottom: 0.65rem; }
.panel-copy { font-size: var(--type-body-md); line-height: 1.65; }
.prerequisite { margin-top: 1rem; display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
.checklist { list-style: none; display: flex; flex-direction: column; gap: 0.8rem; }
.checklist li { position: relative; padding-left: 1rem; line-height: 1.55; color: var(--color-text-primary); }
.checklist li::before { content: ''; position: absolute; left: 0; top: 0.55em; width: 0.45rem; height: 0.45rem; border-radius: 50%; background: var(--color-accent); }
@media (max-width: 900px) { .phase-grid { grid-template-columns: 1fr; } }
</style>
