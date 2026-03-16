<template>
  <PlaceholderView
    title="需求分析"
    description="通过 AI 对话将模糊需求转化为结构化文档，支持多轮追问和思维导图可视化。"
  >
    <template #icon>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
        <path d="M12 6H30L42 18V42H12V6Z" stroke="#B1BAC4" stroke-width="1.5" />
        <path d="M30 6V18H42" stroke="#B1BAC4" stroke-width="1.5" />
        <path d="M18 24H34M18 30H28M18 36H30" stroke="#B1BAC4" stroke-width="1.5" />
      </svg>
    </template>
  </PlaceholderView>
</template>
<script setup lang="ts">
import PlaceholderView from '@/components/PlaceholderView.vue'
</script>
