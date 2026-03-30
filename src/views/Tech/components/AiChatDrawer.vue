<template>
  <aside class="ai-drawer">
    <header class="ai-drawer__header">
      <div class="ai-drawer__title">
        <UiIcon icon="lucide:sparkles" size="sm" />
        <span>AI 技术助手</span>
      </div>
      <button class="ai-drawer__close" type="button" @click="$emit('close')">
        <UiIcon icon="lucide:x" size="sm" />
      </button>
    </header>

    <!-- 进度指示 -->
    <div class="ai-drawer__progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(completedAnswers / totalQuestions) * 100}%` }" />
      </div>
      <span class="progress-text">{{ completedAnswers }}/{{ totalQuestions }} 已完成</span>
    </div>

    <!-- 消息区域 -->
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
        <div class="message__content">{{ message.content }}</div>
      </article>
    </div>

    <!-- 快捷提示 -->
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

    <!-- 输入区 -->
    <div class="ai-drawer__input">
      <textarea
        v-model="draftMessage"
        class="input-area"
        rows="2"
        placeholder="回复 AI 的问题..."
        @keydown.enter.exact.prevent="handleSend"
      />
      <div class="input-actions">
        <UiButton
          variant="ghost"
          size="sm"
          :disabled="isSending"
          @click="$emit('generate')"
        >
          生成技术选型文档
        </UiButton>
        <UiButton
          variant="primary"
          size="sm"
          :disabled="!draftMessage.trim() || isSending"
          @click="handleSend"
        >
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

export interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
}

defineProps<{
  messages: ChatMessage[]
  isSending: boolean
  completedAnswers: number
  totalQuestions: number
}>()

const emit = defineEmits<{
  send: [message: string]
  close: []
  generate: []
}>()

const draftMessage = ref('')
const messagesRef = ref<HTMLElement | null>(null)

const quickPrompts = [
  '帮我分析技术挑战',
  '推荐适合的技术栈',
  '对比主流方案优劣',
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

/* 进度条 */
.ai-drawer__progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 0.375rem;
  border-radius: 1rem;
  background: var(--color-surface-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 1rem;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

/* 消息区域 */
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

/* 快捷提示 */
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

/* 输入区 */
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
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .ai-drawer {
    width: 100%;
  }
}
</style>
