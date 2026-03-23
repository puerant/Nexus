<template>
  <UiSurface class="assistant-pane" tone="muted">
    <div class="assistant-top">
      <div>
        <div class="panel-label">AI 需求助手</div>
        <h2>追问式控制台</h2>
      </div>
      <div class="mode-switch">
        <span class="mode-pill active">{{ modeLabel }}</span>
      </div>
    </div>

    <div class="assistant-summary">
      <div class="summary-item">
        <span class="summary-label">当前模式</span>
        <strong>{{ modeLabel }}</strong>
      </div>
      <div class="summary-item">
        <span class="summary-label">已收集问题数</span>
        <strong>{{ collectedCount }}/{{ totalQuestions }}</strong>
      </div>
    </div>

    <div class="assistant-actions">
      <UiButton variant="secondary" size="sm" :disabled="locked" @click="$emit('toggle-drawer')">
        {{ drawerOpen ? '收起追问台' : '展开追问台' }}
      </UiButton>
      <UiButton
        variant="ghost"
        size="sm"
        :disabled="locked || generating"
        @click="$emit('generate-prd')"
      >
        {{ generating ? '生成中...' : '生成 PRD.md' }}
      </UiButton>
    </div>

    <div class="coverage-grid">
      <div
        v-for="item in coverage"
        :key="item.label"
        class="coverage-item"
        :class="{ done: item.done }"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.done ? '已完成' : '待追问' }}</strong>
      </div>
    </div>

    <transition name="drawer">
      <section v-if="drawerOpen" class="terminal-drawer">
        <div class="terminal-head">
          <div class="terminal-dots">
            <span />
            <span />
            <span />
          </div>
          <div class="terminal-title">requirements.ai / {{ mode }}</div>
        </div>

        <div class="terminal-body">
          <article
            v-for="message in messages"
            :key="message.id"
            class="terminal-line"
            :class="`role-${message.role}`"
          >
            <span class="line-prefix">{{ message.role === 'assistant' ? 'ai>' : 'you>' }}</span>
            <p>{{ message.content }}</p>
          </article>
        </div>

        <div class="quick-prompts">
          <button
            v-for="prompt in quickPrompts"
            :key="prompt"
            class="quick-prompt"
            type="button"
            :disabled="locked"
            @click="$emit('use-prompt', prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <div class="terminal-input-row">
          <textarea
            :model-value="draft"
            class="terminal-input"
            rows="3"
            :readonly="locked"
            placeholder="输入你对当前问题的补充，或直接描述业务背景、目标用户和约束条件"
            @input="$emit('update:draft', ($event.target as HTMLTextAreaElement).value)"
          />
          <UiButton variant="primary" :disabled="locked || !draft.trim()" @click="$emit('send')"
            >发送</UiButton
          >
        </div>
      </section>
    </transition>
  </UiSurface>
</template>

<script setup lang="ts">
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'

interface CoverageItem {
  label: string
  done: boolean
}

interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
}

defineProps<{
  mode: string
  modeLabel: string
  draft: string
  drawerOpen: boolean
  generating: boolean
  locked: boolean
  totalQuestions: number
  collectedCount: number
  coverage: CoverageItem[]
  messages: ChatMessage[]
  quickPrompts: string[]
}>()

defineEmits<{
  'update:draft': [value: string]
  'toggle-drawer': []
  'generate-prd': []
  send: []
  'use-prompt': [value: string]
}>()
</script>

<style scoped>
.assistant-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
}

.assistant-top,
.assistant-actions,
.terminal-input-row,
.assistant-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.assistant-top {
  align-items: flex-start;
}

.panel-label,
.summary-label {
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

.mode-pill {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
}

.mode-pill.active {
  background: color-mix(in oklab, var(--color-accent-soft) 82%, white 18%);
  color: var(--color-accent);
}

.assistant-summary {
  align-items: stretch;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-lg);
  background: color-mix(in oklab, var(--color-surface-raised) 86%, var(--color-accent-soft) 14%);
  border: 1px solid var(--color-border-soft);
}

.summary-item strong {
  font-size: 1rem;
}

.coverage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.coverage-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-soft);
  background: color-mix(in oklab, var(--color-surface-soft) 78%, white 22%);
  color: var(--color-text-secondary);
}

.coverage-item.done {
  border-style: solid;
  border-color: color-mix(in oklab, var(--color-accent) 24%, white 76%);
  color: var(--color-text-primary);
}

.coverage-item strong {
  font-size: 0.8125rem;
}

.terminal-drawer {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-height: 30rem;
  padding: 0.95rem;
  border-radius: calc(var(--radius-xl) - 0.25rem);
  background: linear-gradient(180deg, oklch(0.19 0.025 258), oklch(0.15 0.02 258));
  color: oklch(0.95 0.01 255);
  border: 1px solid color-mix(in oklab, var(--color-accent) 20%, black 80%);
  box-shadow: inset 0 1px 0 color-mix(in oklab, white 8%, transparent);
}

.terminal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in oklab, white 10%, transparent);
}

.terminal-dots {
  display: flex;
  gap: 0.35rem;
}

.terminal-dots span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: color-mix(in oklab, white 24%, transparent);
}

.terminal-dots span:nth-child(1) {
  background: oklch(0.7 0.17 28);
}
.terminal-dots span:nth-child(2) {
  background: oklch(0.82 0.16 95);
}
.terminal-dots span:nth-child(3) {
  background: oklch(0.74 0.16 150);
}

.terminal-title {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in oklab, white 74%, var(--color-accent-soft) 26%);
}

.terminal-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 0;
  max-height: 21rem;
  overflow: auto;
  padding-right: 0.25rem;
}

.terminal-line {
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.line-prefix {
  color: oklch(0.76 0.11 245);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.role-user .line-prefix {
  color: oklch(0.82 0.1 140);
}

.terminal-line p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
  color: oklch(0.93 0.01 255);
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.quick-prompt {
  min-height: 2rem;
  padding: 0 0.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in oklab, white 16%, transparent);
  background: color-mix(in oklab, white 6%, transparent);
  color: inherit;
  cursor: pointer;
}

.quick-prompt:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.terminal-input-row {
  align-items: flex-end;
}

.terminal-input {
  flex: 1;
  min-height: 5.25rem;
  resize: none;
  border: 1px solid color-mix(in oklab, white 14%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in oklab, black 28%, transparent);
  color: inherit;
  padding: 0.85rem 0.9rem;
  outline: none;
  font: inherit;
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity var(--motion-fast),
    transform var(--motion-fast);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 820px) {
  .coverage-grid {
    grid-template-columns: 1fr;
  }

  .assistant-summary,
  .assistant-actions,
  .terminal-input-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
