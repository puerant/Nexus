<template>
  <PlaceholderView
    title="任务开发"
    description="AI 将需求拆解为里程碑、模块和任务层级结构，并支持生成执行方案与代码输出。"
    prerequisite="技术选型文档已生成"
  >
    <template #icon>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
        <rect x="6" y="6" width="10" height="36" rx="2" stroke="#B1BAC4" stroke-width="1.5" />
        <rect x="20" y="6" width="10" height="24" rx="2" stroke="#B1BAC4" stroke-width="1.5" />
        <rect x="34" y="6" width="10" height="30" rx="2" stroke="#B1BAC4" stroke-width="1.5" />
      </svg>
    </template>
  </PlaceholderView>
</template>
<script setup lang="ts">
import PlaceholderView from '@/components/Layout/components/PlaceholderView.vue'
</script>
