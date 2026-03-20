<template>
  <AppLayout title="设置" subtitle="管理模型、密钥和应用偏好">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" @click="router.back()">返回</UiButton>
    </template>

    <div class="settings-screen">
      <div class="settings-stack">
        <UiPageIntro
          eyebrow="Preferences"
          title="全局设置"
          description="统一管理默认模型、API 密钥与应用信息。这些设置会影响新建项目的初始行为。"
        >
          <template #aside>
            <UiSurface class="version-card" tone="accent">
              <span class="version-label">当前版本</span>
              <strong>AI Workflow v0.1.0</strong>
            </UiSurface>
          </template>
        </UiPageIntro>

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
          <UiButton variant="primary" @click="saveSettings">保存设置</UiButton>
        </div>
      </div>
    </div>

    <template #toolbar>
      <div class="toolbar-group">
        <UiButton variant="ghost" size="sm" :to="{ name: 'workspace' }">工作区首页</UiButton>
        <UiButton variant="ghost" size="sm" :to="{ name: 'sync' }">同步配置</UiButton>
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
import AppLayout from '@/components/Layout/components/AppLayout.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPageIntro from '@/components/ui/UiPageIntro.vue'
import UiSurface from '@/components/ui/UiSurface.vue'

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
  padding: clamp(1.25rem, 2.8vw, 2rem);
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.version-card {
  min-width: 11rem;
}

.version-label,
.section-label {
  display: block;
  margin-bottom: 0.65rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.about-card {
  grid-column: 1 / -1;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.setting-row.stacked {
  align-items: flex-start;
  flex-direction: column;
}

.setting-info { flex: 1; }
.setting-title { font-weight: 700; color: var(--color-text-primary); }
.setting-desc { margin-top: 0.25rem; font-size: 0.8125rem; line-height: 1.6; }

.setting-select,
.setting-input {
  width: min(20rem, 100%);
  min-height: 2.4rem;
  padding: 0 0.85rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.about-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-soft);
}

.about-row:last-child { border-bottom: none; }
.actions,
.toolbar-group { display: flex; align-items: center; gap: 0.75rem; }
.actions { justify-content: flex-end; }
.toolbar-hint { font-size: 0.75rem; color: var(--color-text-tertiary); }

@media (max-width: 960px) {
  .settings-grid { grid-template-columns: 1fr; }
  .about-card { grid-column: auto; }
}

@media (max-width: 720px) {
  .settings-screen { padding: 1rem; }
  .setting-row { flex-direction: column; align-items: flex-start; }
}
</style>
