<template>
  <PlaceholderView
    title="原型设计"
    description="AI 读取需求文档，自动生成可交互的原型页面，支持迭代修改和版本沉淀。"
    prerequisite="需求分析已完成"
  >
    <template #icon>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
        <rect x="6" y="8" width="36" height="32" rx="3" stroke="#B1BAC4" stroke-width="1.5" />
        <path d="M6 16H42" stroke="#B1BAC4" stroke-width="1.5" />
        <circle cx="12" cy="12" r="2" fill="#B1BAC4" />
        <circle cx="20" cy="12" r="2" fill="#B1BAC4" />
      </svg>
    </template>
  </PlaceholderView>
</template>
<script setup lang="ts">
import PlaceholderView from '@/components/Layout/components/PlaceholderView.vue'
</script>
