<template>
  <aside class="ai-drawer">
    <header class="ai-drawer__header">
      <div class="ai-drawer__title">
        <UiIcon icon="lucide:sparkles" size="sm" />
        <span>AI 原型助手</span>
      </div>
      <button class="ai-drawer__close" type="button" @click="$emit('close')">
        <UiIcon icon="lucide:x" size="sm" />
      </button>
    </header>

    <!-- Context: selected element -->
    <div v-if="selectedElement" class="ai-drawer__context">
      <div class="context-label">已选中元素</div>
      <div class="context-card">
        <code class="context-tag">&lt;{{ selectedElement.tagName }}&gt;</code>
        <span v-if="selectedElement.id" class="context-id">#{{ selectedElement.id }}</span>
        <span v-if="selectedElement.className" class="context-cls">{{ truncateClass(selectedElement.className) }}</span>
      </div>
      <details class="context-details">
        <summary>查看代码</summary>
        <pre class="context-code"><code>{{ selectedElement.outerHTML }}</code></pre>
      </details>
      <button class="context-remove" type="button" @click="$emit('clear-element')">
        移除
      </button>
    </div>

    <!-- Messages -->
    <div class="ai-drawer__messages" ref="messagesRef">
      <article
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="message.role"
      >
        <div class="message__avatar">
          <UiIcon :icon="message.role === 'assistant' ? 'lucide:bot' : 'lucide:user'" size="sm" />
        </div>
        <div class="message__content">
          <!-- Element card message -->
          <template v-if="message.elementInfo">
            <div class="message__element-card">
              <code>&lt;{{ message.elementInfo.tagName }}&gt;</code>
              <span class="message__element-selector">{{ message.elementInfo.cssSelector }}</span>
            </div>
          </template>
          <span>{{ message.content }}</span>
        </div>
      </article>
    </div>

    <!-- Quick prompts -->
    <div class="ai-drawer__quick">
      <button
        v-for="prompt in quickPrompts"
        :key="prompt"
        class="quick-btn"
        type="button"
        @click="applyPrompt(prompt)"
      >
        {{ prompt }}
      </button>
    </div>

    <!-- Input -->
    <div class="ai-drawer__input">
      <textarea
        v-model="draftMessage"
        class="input-area"
        rows="2"
        placeholder="描述你的修改需求..."
        @keydown.enter.exact.prevent="handleSend"
      />
      <div class="input-actions">
        <UiButton variant="primary" size="sm" :disabled="!draftMessage.trim() || isSending" @click="handleSend">
          {{ isSending ? '发送中...' : '发送' }}
        </UiButton>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import type { ElementInfo } from '@/components/ui/IFramePreview'

export interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
  elementInfo?: ElementInfo | null
}

defineProps<{
  messages: ChatMessage[]
  selectedElement: ElementInfo | null
  isSending: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  close: []
  'clear-element': []
}>()

const draftMessage = ref('')
const messagesRef = ref<HTMLElement | null>(null)

const quickPrompts = [
  '修改选中的元素样式',
  '优化整体布局',
  '替换文案内容',
]

function applyPrompt(prompt: string) {
  draftMessage.value = prompt
}

function handleSend() {
  const content = draftMessage.value.trim()
  if (!content) return
  emit('send', content)
  draftMessage.value = ''
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function truncateClass(cls: string): string {
  const parts = cls.trim().split(/\s+/)
  if (parts.length <= 2) return '.' + parts.join('.')
  return '.' + parts.slice(0, 2).join('.') + '...'
}
</script>

<style scoped>
.ai-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 24rem;
  height: 100%;
  background: var(--color-surface-raised);
  border-left: 1px solid var(--color-border-soft);
  display: flex;
  flex-direction: column;
  z-index: 200;
  box-shadow: var(--shadow-xl);
}

.ai-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.ai-drawer__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-accent);
}

.ai-drawer__close {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.ai-drawer__close:hover {
  background: var(--color-surface-soft);
}

/* Context: selected element */
.ai-drawer__context {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  background: color-mix(in oklab, var(--color-accent) 4%, var(--color-surface));
  flex-shrink: 0;
}

.context-label {
  font-size: 0.6875rem;
  color: var(--color-accent);
  font-weight: 600;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.context-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.context-tag {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-surface-soft);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.context-id {
  font-size: 0.75rem;
  color: var(--color-accent);
  font-weight: 500;
}

.context-cls {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.context-details {
  margin-top: 0.5rem;
}

.context-details summary {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0.25rem 0;
}

.context-code {
  margin-top: 0.375rem;
  padding: 0.5rem;
  background: var(--color-canvas);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  overflow-x: auto;
  max-height: 6rem;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.context-remove {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: color 0.15s;
}

.context-remove:hover {
  color: var(--color-danger);
}

/* Messages */
.ai-drawer__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message__avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.assistant .message__avatar {
  background: color-mix(in oklab, var(--color-accent) 15%, white);
  color: var(--color-accent);
}

.message.user .message__avatar {
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
}

.message__content {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  padding-top: 0.125rem;
}

.message__element-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
}

.message__element-card code {
  color: var(--color-accent);
  font-weight: 600;
}

.message__element-selector {
  color: var(--color-text-tertiary);
  font-size: 0.6875rem;
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Quick prompts */
.ai-drawer__quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.quick-btn {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-soft);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* Input */
.ai-drawer__input {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.input-area {
  width: 100%;
  min-height: 3.5rem;
  resize: none;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.input-area:focus {
  border-color: var(--color-accent);
}

.input-area::placeholder {
  color: var(--color-text-tertiary);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 0.5rem;
}
</style>
