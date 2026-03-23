<template>
  <UiSurface class="requirements-editor" :tone="locked ? 'muted' : 'default'">
    <div class="panel-head">
      <div>
        <div class="panel-label">需求文档</div>
        <h2>结构化 Markdown</h2>
      </div>
      <div class="panel-meta">
        <span class="meta-chip">{{ prdPath }}</span>
        <span v-if="locked" class="meta-chip locked">已锁定</span>
      </div>
    </div>

    <div class="editor-toolbar">
      <button
        v-for="item in snippets"
        :key="item.label"
        class="snippet-chip"
        type="button"
        :disabled="locked"
        @click="$emit('insert-snippet', item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <textarea
      :value="modelValue"
      class="editor-textarea"
      :readonly="locked"
      spellcheck="false"
      placeholder="# PRD

在这里整理 AI 追问结果、用户补充内容和最终结构化需求文档"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </UiSurface>
</template>

<script setup lang="ts">
import UiSurface from '@/components/ui/UiSurface.vue'

defineProps<{
  modelValue: string
  locked: boolean
  prdPath: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'insert-snippet': [value: string]
}>()

const snippets = [
  { label: '目标用户', value: '## 目标用户\n- \n' },
  { label: '核心场景', value: '## 核心场景\n- \n' },
  { label: '功能范围', value: '## 功能范围\n### Must Have\n- \n\n### Nice to Have\n- \n' },
  { label: '验收标准', value: '## 验收标准\n- [ ] \n' },
]
</script>

<style scoped>
.requirements-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.panel-label {
  margin-bottom: 0.45rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

h2 {
  font-size: var(--type-heading-lg);
  letter-spacing: -0.03em;
}

.panel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.meta-chip.locked {
  color: color-mix(in oklab, var(--color-accent) 75%, black 20%);
  background: color-mix(in oklab, var(--color-accent-soft) 85%, white 15%);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.snippet-chip {
  min-height: 2rem;
  padding: 0 0.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    transform var(--motion-fast),
    border-color var(--motion-fast),
    color var(--motion-fast),
    background var(--motion-fast);
}

.snippet-chip:hover:not(:disabled) {
  transform: translateY(-1px);
  color: var(--color-text-primary);
  border-color: color-mix(in oklab, var(--color-accent) 24%, white 76%);
}

.snippet-chip:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.editor-textarea {
  flex: 1;
  min-height: 36rem;
  resize: none;
  border: 1px solid color-mix(in oklab, var(--color-border-soft) 82%, var(--color-accent-soft) 18%);
  border-radius: calc(var(--radius-xl) - 0.25rem);
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-surface-soft) 40%, white 60%),
      transparent 4rem
    ),
    var(--color-surface-raised);
  color: var(--color-text-primary);
  padding: 1.2rem 1.15rem;
  font:
    500 0.92rem/1.7 'Segoe UI',
    'PingFang SC',
    sans-serif;
  outline: none;
  box-shadow: inset 0 1px 0 color-mix(in oklab, white 75%, var(--color-accent-soft) 25%);
}

.editor-textarea:focus {
  border-color: color-mix(in oklab, var(--color-accent) 30%, white 70%);
}

.editor-textarea:read-only {
  color: var(--color-text-secondary);
}

@media (max-width: 720px) {
  .editor-textarea {
    min-height: 24rem;
  }
}
</style>
