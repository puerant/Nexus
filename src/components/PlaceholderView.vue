<template>
  <div class="placeholder-view">
    <div class="topbar">
      <div class="breadcrumb">
        <span class="bc-item">{{ projectName }}</span>
        <span class="bc-sep">/</span>
        <span class="bc-current">{{ title }}</span>
      </div>
      <div class="topbar-actions">
        <!-- Phase model selector -->
        <div class="model-selector">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#6E7781" stroke-width="1" />
            <path d="M4 6L5.5 7.5L8 4.5" stroke="#6E7781" stroke-width="1" />
          </svg>
          <select v-model="selectedModel" class="model-select">
            <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-6">Claude Opus 4.6</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </select>
        </div>
      </div>
    </div>

    <div class="placeholder-body">
      <div class="placeholder-icon">
        <slot name="icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
            <circle cx="24" cy="24" r="22" stroke="#B1BAC4" stroke-width="1.5" />
            <path d="M24 12V24L32 32" stroke="#B1BAC4" stroke-width="1.5" />
          </svg>
        </slot>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <div v-if="prerequisite" class="prerequisite">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#FEBC2E" stroke-width="1" />
          <path d="M7 4V7.5" stroke="#FEBC2E" stroke-width="1" />
          <circle cx="7" cy="10" r="0.75" fill="#FEBC2E" />
        </svg>
        前置条件：{{ prerequisite }}
      </div>
    </div>
  </div>
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

const projectName = ref(projectStore.currentProject?.name ?? '')
const selectedModel = ref(projectStore.currentProject?.defaultModel ?? 'claude-sonnet-4-6')
</script>

<style scoped>
.placeholder-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: var(--topbar-height);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 8px;
  flex-shrink: 0;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.bc-sep {
  color: var(--text-3);
}
.bc-item {
  color: var(--text-2);
}
.bc-current {
  color: var(--text-1);
  font-weight: 500;
}
.topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  background: white;
  font-size: 12.5px;
  color: var(--text-2);
}
.model-select {
  border: none;
  outline: none;
  font-size: 12.5px;
  color: var(--text-1);
  font-family: var(--font);
  background: transparent;
  cursor: pointer;
}

.placeholder-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-2);
  text-align: center;
}
.placeholder-icon {
  margin-bottom: 8px;
}
.placeholder-body h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.3px;
}
.placeholder-body p {
  font-size: 14px;
  color: var(--text-2);
  max-width: 400px;
  line-height: 1.6;
}
.prerequisite {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-2);
  background: #fffbe6;
  border: 1px solid #febc2e40;
  border-radius: var(--r-xs);
  padding: 8px 14px;
  margin-top: 8px;
}
</style>
