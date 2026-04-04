<template>
  <AppLayout title="设置" subtitle="管理模型、密钥和应用偏好">
    <template #topbar-actions>
      <UiButton variant="ghost" size="sm" @click="router.back()">返回</UiButton>
    </template>

    <div class="settings-page">
      <UiPageIntro
        eyebrow="Preferences"
        title="全局设置"
        description="统一管理默认模型、API 密钥、Agent / Skills / MCP / Hooks 配置与应用信息。"
      >
        <template #aside>
          <UiSurface class="version-card" tone="accent" padding="sm">
            <span class="version-label">当前版本</span>
            <strong style="font-size: 0.8125rem">AI Workflow v0.1.0</strong>
          </UiSurface>
        </template>
      </UiPageIntro>

      <UiTabGroup :tabs="tabs" v-model="activeTab">
        <GeneralTab v-if="activeTab === 'general'" />
        <AgentsTab v-if="activeTab === 'agents'" />
        <SkillsTab v-if="activeTab === 'skills'" />
        <McpTab v-if="activeTab === 'mcp'" />
        <HooksTab v-if="activeTab === 'hooks'" />
        <GithubTab v-if="activeTab === 'github'" />
      </UiTabGroup>
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
import UiTabGroup from '@/components/ui/UiTabGroup.vue'
import type { TabItem } from '@/components/ui/UiTabGroup.vue'

import GeneralTab from './components/GeneralTab.vue'
import AgentsTab from './components/AgentsTab.vue'
import SkillsTab from './components/SkillsTab.vue'
import McpTab from './components/McpTab.vue'
import HooksTab from './components/HooksTab.vue'
import GithubTab from './components/GithubTab.vue'

import './shared.css'

const router = useRouter()
type TabKey = 'general' | 'agents' | 'skills' | 'mcp' | 'hooks' | 'github'
const activeTab = ref<TabKey>('general')

const tabs: TabItem[] = [
  { key: 'general', label: '通用', icon: 'lucide:settings' },
  { key: 'agents', label: 'Agents', icon: 'lucide:bot' },
  { key: 'skills', label: 'Skills', icon: 'lucide:puzzle' },
  { key: 'mcp', label: 'MCP', icon: 'lucide:terminal-square' },
  { key: 'hooks', label: 'Hooks', icon: 'lucide:webhook' },
  { key: 'github', label: 'GitHub', icon: 'lucide:github' },
]
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  height: 100%;
  overflow: hidden;
}
.version-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
}
.version-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.7;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.toolbar-meta {
  margin-left: auto;
}
.toolbar-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>
