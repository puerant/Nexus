<template>
  <div class="ui-markdown-editor" :class="{ 'is-readonly': readonly, 'is-preview-only': previewOnly }">
    <MdEditor
      :model-value="modelValue"
      :theme="theme"
      :language="language"
      :preview-only="previewOnly"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :toolbars="toolbarItems"
      :placeholder="placeholder"
      :disabled="readonly"
      :max-length="maxLength"
      :auto-focus="autoFocus"
      :width="width"
      :height="height"
      :style="{ height: computedHeight }"
      @update:model-value="handleUpdate"
      @on-save="handleSave"
      @on-upload-img="handleUploadImg"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MdEditor, ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { Themes, PreviewThemes } from 'md-editor-v3'

export interface ToolbarItem {
  name: string
  icon?: string
  title?: string
  onClick?: () => void
}

export interface Props {
  modelValue: string
  /** 只读模式 */
  readonly?: boolean
  /** 仅预览模式 */
  previewOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 主题 */
  theme?: Themes
  /** 预览主题 */
  previewTheme?: PreviewThemes
  /** 代码高亮主题 */
  codeTheme?: string
  /** 语言 */
  language?: 'en-US' | 'zh-CN'
  /** 最大长度 */
  maxLength?: number
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 宽度 */
  width?: string
  /** 高度 */
  height?: string
  /** 紧凑模式 */
  compact?: boolean
  /** 隐藏工具栏 */
  hideToolbar?: boolean
  /** 自定义工具栏 */
  customToolbars?: ToolbarItem[]
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  previewOnly: false,
  placeholder: '',
  theme: 'light',
  previewTheme: 'default',
  codeTheme: 'atom',
  language: 'zh-CN',
  autoFocus: false,
  width: '100%',
  compact: false,
  hideToolbar: false,
  customToolbars: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': [value: string]
  'upload-img': [files: File[], callback: (urls: string[]) => void]
}>()

const computedHeight = computed(() => {
  if (props.height) return props.height
  return props.compact ? '300px' : 'auto'
})

const toolbarItems = computed((): ToolbarNames[] => {
  if (props.hideToolbar || props.previewOnly) return []

  const defaultToolbars: ToolbarNames[] = [
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    '-',
    'revoke',
    'next',
    '=',
    'pageFullscreen',
    'fullscreen',
    'preview',
  ]

  // 目前不支持自定义工具栏与默认工具栏混合使用
  // 如需自定义工具栏，请直接使用 MdEditor 组件
  return defaultToolbars
})

function handleUpdate(value: string) {
  emit('update:modelValue', value)
}

function handleSave(value: string) {
  emit('save', value)
}

function handleUploadImg(files: File[], callback: (urls: string[]) => void) {
  emit('upload-img', files, callback)
}

// 暴露编辑器实例（通过 ref 获取）
defineExpose({})
</script>

<style scoped>
.ui-markdown-editor {
  --md-bk-color: var(--color-surface-raised);
  width: 100%;
  height: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.ui-markdown-editor :deep(.md-editor) {
  border-radius: var(--radius-xl);
  border: 1px solid color-mix(in oklab, var(--color-border-soft) 82%, var(--color-accent-soft) 18%);
  box-shadow: inset 0 1px 0 color-mix(in oklab, white 75%, var(--color-accent-soft) 25%);
}

.ui-markdown-editor :deep(.md-editor:focus-within) {
  border-color: color-mix(in oklab, var(--color-accent) 30%, white 70%);
}

.ui-markdown-editor :deep(.md-editor-toolbar-wrapper) {
  background: var(--color-surface-soft);
  border-bottom: 1px solid var(--color-border-soft);
}

.ui-markdown-editor :deep(.md-editor-content) {
  background: var(--color-surface-raised);
}

.ui-markdown-editor :deep(.md-editor-input) {
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.ui-markdown-editor :deep(.md-editor-input::placeholder) {
  color: var(--color-text-tertiary);
}

.ui-markdown-editor :deep(.md-editor-scrullbar) {
  background: transparent;
}

/* 只读模式样式 */
.ui-markdown-editor.is-readonly :deep(.md-editor-toolbar-wrapper) {
  display: none;
}

.ui-markdown-editor.is-readonly :deep(.md-editor-input) {
  color: var(--color-text-secondary);
  background: var(--color-surface-soft);
}

/* 紧凑模式 */
.ui-markdown-editor .editor-compact :deep(.md-editor-toolbar-wrapper) {
  padding: 0.25rem 0.5rem;
}

.ui-markdown-editor .editor-compact :deep(.md-editor-input) {
  padding: 0.75rem;
}

/* 预览模式样式适配 */
.ui-markdown-editor :deep(.md-editor-preview) {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.ui-markdown-editor :deep(.md-editor-preview h1),
.ui-markdown-editor :deep(.md-editor-preview h2),
.ui-markdown-editor :deep(.md-editor-preview h3) {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border-soft);
}

.ui-markdown-editor :deep(.md-editor-preview code) {
  background: var(--color-surface-soft);
  color: var(--color-text-primary);
}

.ui-markdown-editor :deep(.md-editor-preview blockquote) {
  border-left-color: var(--color-accent);
  color: var(--color-text-secondary);
}
</style>
