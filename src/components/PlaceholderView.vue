<template>
  <section class="phase-placeholder">
    <header class="phase-hero surface-card surface-card-hero">
      <div>
        <div class="eyebrow">Phase Workspace</div>
        <h2>{{ title }}</h2>
        <p class="phase-description">{{ description }}</p>
      </div>

      <div class="phase-aside">
        <div class="model-selector">
          <span class="selector-label">执行模型</span>
          <select v-model="selectedModel" class="model-select">
            <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-6">Claude Opus 4.6</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </select>
        </div>
        <div class="phase-icon">
          <slot name="icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
              <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.5" />
              <path d="M24 12V24L32 32" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </slot>
        </div>
      </div>
    </header>

    <div class="phase-grid">
      <section class="surface-card">
        <div class="card-kicker">当前状态</div>
        <h3>阶段工作区准备中</h3>
        <p class="card-copy">这里将承载该阶段的 AI 协作、文档沉淀和操作面板。当前先保留统一的占位结构，方便后续逐步填充真实功能。</p>
        <div v-if="prerequisite" class="prerequisite">
          <span class="prerequisite-dot" />
          <span>前置条件：{{ prerequisite }}</span>
        </div>
      </section>

      <section class="surface-card checklist-card">
        <div class="card-kicker">建议下一步</div>
        <ul class="checklist">
          <li>确认当前阶段的输入材料已经就绪</li>
          <li>选择适合本阶段的 AI 模型</li>
          <li>开始生成文档、方案或执行结果</li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/project'

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
  gap: 18px;
}

.surface-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.surface-card-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
}

.eyebrow,
.card-kicker,
.selector-label {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--accent);
  margin-bottom: 12px;
}

.card-kicker,
.selector-label {
  color: var(--text-3);
  margin-bottom: 10px;
}

h2 {
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.08;
  letter-spacing: -0.04em;
  margin-bottom: 10px;
}

h3 {
  font-size: 20px;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 10px;
}

.phase-description,
.card-copy {
  max-width: 640px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-2);
}

.phase-aside {
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.model-selector {
  padding: 16px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(13, 17, 23, 0.06);
}

.model-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(13, 17, 23, 0.12);
  border-radius: 12px;
  background: white;
  font-size: 13px;
  font-family: var(--font);
  color: var(--text-1);
  outline: none;
}

.phase-icon {
  min-height: 150px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: var(--accent);
  background: linear-gradient(180deg, rgba(235, 245, 255, 0.9), rgba(245, 249, 255, 1));
  border: 1px dashed rgba(0, 122, 255, 0.2);
}

.phase-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
}

.prerequisite {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(254, 188, 46, 0.12);
  color: #9a6b00;
  font-size: 12px;
}

.prerequisite-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #febc2e;
}

.checklist {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist li {
  position: relative;
  padding-left: 18px;
  color: var(--text-1);
  line-height: 1.55;
}

.checklist li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

@media (max-width: 900px) {
  .surface-card-hero,
  .phase-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .phase-aside {
    min-width: 0;
  }
}

@media (max-width: 720px) {
  .surface-card {
    padding: 18px;
    border-radius: 18px;
  }
}
</style>
