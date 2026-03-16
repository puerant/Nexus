<template>
  <PlaceholderView
    title="复盘总结"
    description="项目完成后自动聚合数据，AI 生成复盘报告，经验沉淀到四个复用库（提示词/测试用例/任务模板/AI上下文）。"
    prerequisite="任务开发已完成"
  >
    <template #icon>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
        <path d="M8 36L18 24L26 30L38 14" stroke="#B1BAC4" stroke-width="1.5" />
        <path d="M6 42H42" stroke="#B1BAC4" stroke-width="1.5" />
      </svg>
    </template>
  </PlaceholderView>
</template>
<script setup lang="ts">
import PlaceholderView from '@/components/PlaceholderView.vue'
</script>
