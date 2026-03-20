<template>
  <AppLayout title="设置" subtitle="管理模型、密钥和应用偏好">
    <template #topbar-actions>
      <button class="topbar-chip" type="button" @click="router.back()">返回</button>
    </template>

    <div class="settings-screen">
      <section class="settings-panel">
        <div class="hero-row">
          <div>
            <div class="eyebrow">Preferences</div>
            <h1>全局设置</h1>
            <p class="subtitle">统一管理默认模型、API 密钥与应用信息。这些设置会影响新建项目的初始行为。</p>
          </div>

          <div class="version-card">
            <span class="version-label">当前版本</span>
            <strong>AI Workflow v0.1.0</strong>
          </div>
        </div>

        <div class="settings-grid">
          <section class="surface-card">
            <div class="section-title">AI 模型配置</div>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">默认 AI 模型</div>
                <div class="setting-desc">新项目默认使用该模型，后续可在项目内按阶段覆盖。</div>
              </div>
              <select v-model="defaultModel" class="setting-select">
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
              </select>
            </div>
          </section>

          <section class="surface-card">
            <div class="section-title">API 密钥</div>
            <div class="setting-row stacked">
              <div class="setting-info">
                <div class="setting-label">Anthropic API Key</div>
                <div class="setting-desc">用于访问 Claude 模型，密钥仅保存在本地设备。</div>
              </div>
              <input
                v-model="anthropicKey"
                type="password"
                class="setting-input"
                placeholder="sk-ant-xxxxxxxxxxxx"
              />
            </div>
          </section>

          <section class="surface-card about-card">
            <div class="section-title">关于</div>
            <div class="about-row">
              <span class="about-label">产品</span>
              <span class="about-value">AI Workflow</span>
            </div>
            <div class="about-row">
              <span class="about-label">版本</span>
              <span class="about-value">v0.1.0</span>
            </div>
          </section>
        </div>

        <div class="actions">
          <button class="btn btn-primary save-btn" type="button" @click="saveSettings">保存设置</button>
        </div>
      </section>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <button class="toolbar-btn" type="button" @click="router.push({ name: 'workspace' })">工作区首页</button>
        <button class="toolbar-btn" type="button" @click="router.push({ name: 'sync' })">同步配置</button>
      </div>
      <div class="toolbar-group toolbar-meta">
        <span class="toolbar-hint">本地设置立即生效</span>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const defaultModel = ref(localStorage.getItem('default_model') ?? 'claude-sonnet-4-6')
const anthropicKey = ref(localStorage.getItem('anthropic_api_key') ?? '')

function saveSettings() {
  localStorage.setItem('anthropic_api_key', anthropicKey.value)
  localStorage.setItem('default_model', defaultModel.value)
  alert('设置已保存')
}
</script>

<style scoped>
.settings-screen {
  min-height: 100%;
  padding: clamp(22px, 3vw, 32px);
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 100%;
}

.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

h1 {
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 10px;
}

.subtitle {
  max-width: 600px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-2);
}

.version-card {
  min-width: 180px;
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.version-label,
.section-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.surface-card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(13, 17, 23, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.about-card {
  grid-column: 1 / -1;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.setting-row.stacked {
  align-items: flex-start;
  flex-direction: column;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-2);
}

.setting-select,
.setting-input {
  width: min(320px, 100%);
  padding: 10px 12px;
  border: 1px solid rgba(13, 17, 23, 0.12);
  border-radius: 12px;
  font-size: 13px;
  font-family: var(--font);
  color: var(--text-1);
  background: white;
  outline: none;
}

.setting-select:focus,
.setting-input:focus {
  border-color: rgba(0, 122, 255, 0.3);
}

.about-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(13, 17, 23, 0.08);
}

.about-row:last-child {
  border-bottom: none;
}

.about-label {
  color: var(--text-2);
}

.about-value {
  font-weight: 600;
  color: var(--text-1);
}

.actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.save-btn,
.topbar-chip,
.toolbar-btn {
  padding: 8px 14px;
  font-size: 12px;
}

.topbar-chip,
.toolbar-btn {
  border: 1px solid rgba(13, 17, 23, 0.08);
  background: white;
  color: var(--text-1);
  border-radius: 999px;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    background 0.14s ease;
}

.topbar-chip:hover,
.toolbar-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 122, 255, 0.22);
  background: var(--accent-bg);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-meta {
  color: var(--text-2);
}

.toolbar-hint {
  font-size: 12px;
}

@media (max-width: 960px) {
  .hero-row,
  .settings-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .about-card {
    grid-column: auto;
  }
}

@media (max-width: 720px) {
  .settings-screen {
    padding: 16px;
  }

  .surface-card,
  .version-card {
    padding: 16px;
    border-radius: 18px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
