<template>
  <div class="settings-view">
    <div class="topbar">
      <div class="breadcrumb">
        <span class="bc-current">设置</span>
      </div>
    </div>

    <div class="content">
      <h2>全局设置</h2>

      <div class="settings-section">
        <div class="section-title">AI 模型配置</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">默认 AI 模型</div>
            <div class="setting-desc">新项目将使用此模型，可在项目中按阶段覆盖</div>
          </div>
          <select class="setting-select" v-model="defaultModel">
            <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-6">Claude Opus 4.6</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">API 密钥</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Anthropic API Key</div>
            <div class="setting-desc">用于访问 Claude 模型，密钥仅存储在本地</div>
          </div>
          <input
            v-model="anthropicKey"
            type="password"
            class="setting-input"
            placeholder="sk-ant-xxxxxxxxxxxx"
          />
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">关于</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">版本</div>
            <div class="setting-desc">AI Workflow v0.1.0</div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary save-btn" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const defaultModel = ref('claude-sonnet-4-6')
const anthropicKey = ref(localStorage.getItem('anthropic_api_key') ?? '')

function saveSettings() {
  localStorage.setItem('anthropic_api_key', anthropicKey.value)
  localStorage.setItem('default_model', defaultModel.value)
  alert('设置已保存')
}
</script>

<style scoped>
.settings-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.topbar {
  height: var(--topbar-height);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}
.breadcrumb { font-size: 13px; }
.bc-current { color: var(--text-1); font-weight: 500; }
.content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  max-width: 600px;
}
h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 28px;
  letter-spacing: -0.4px;
}
.settings-section {
  margin-bottom: 28px;
}
.section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}
.setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.setting-row:last-child { border-bottom: none; }
.setting-info { flex: 1; }
.setting-label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 3px;
}
.setting-desc {
  font-size: 12px;
  color: var(--text-2);
}
.setting-select, .setting-input {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  font-size: 13px;
  font-family: var(--font);
  color: var(--text-1);
  background: white;
  outline: none;
  width: 220px;
}
.setting-select:focus, .setting-input:focus {
  border-color: var(--accent);
}
.save-btn {
  margin-top: 8px;
  padding: 10px 24px;
}
</style>
