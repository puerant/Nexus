<template>
  <PlaceholderView
    title="技术选型"
    description="AI 分析需求特征，结合技术栈偏好，输出包含推荐方案、备选方案、理由和风险的决策文档。"
    prerequisite="需求文档已锁定"
  >
    <template #icon>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
        <path d="M6 12L18 24L6 36" stroke="#B1BAC4" stroke-width="1.5" />
        <path d="M24 36H42" stroke="#B1BAC4" stroke-width="1.5" />
      </svg>
    </template>
  </PlaceholderView>
</template>
<script setup lang="ts">
import PlaceholderView from '@/components/PlaceholderView.vue'
</script>
