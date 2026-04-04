<template>
  <div class="settings-grid">
    <UiSurface>
      <div class="section-label">AI 模型配置</div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">默认 AI 模型</div>
          <div class="setting-desc">新项目默认使用该模型，后续可在项目内按阶段覆盖。</div>
        </div>
        <select v-model="defaultModel" class="setting-select">
          <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
          <option value="claude-opus-4-6">Claude Opus 4.6</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
        </select>
      </div>
    </UiSurface>

    <UiSurface>
      <div class="section-label">API 密钥</div>
      <div class="setting-row stacked">
        <div class="setting-info">
          <div class="setting-title">Anthropic API Key</div>
          <div class="setting-desc">用于访问 Claude 模型，密钥仅保存在本地设备。</div>
        </div>
        <input v-model="anthropicKey" type="password" class="setting-input" placeholder="sk-ant-xxxxxxxxxxxx" />
      </div>
    </UiSurface>

    <UiSurface class="about-card" tone="muted">
      <div class="section-label">关于</div>
      <div class="about-row"><span>产品</span><strong>AI Workflow</strong></div>
      <div class="about-row"><span>版本</span><strong>v0.1.0</strong></div>
    </UiSurface>
  </div>

  <div class="actions">
    <UiButton variant="primary" @click="save">保存设置</UiButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'

const defaultModel = ref(localStorage.getItem('default_model') ?? 'claude-sonnet-4-6')
const anthropicKey = ref(localStorage.getItem('anthropic_api_key') ?? '')

function save() {
  localStorage.setItem('anthropic_api_key', anthropicKey.value)
  localStorage.setItem('default_model', defaultModel.value)
  alert('设置已保存')
}
</script>
