<template>
  <div class="github-content">
    <UiSurface>
      <div class="section-label">GitHub 账号</div>
      <div class="setting-row stacked">
        <div class="setting-info">
          <div class="setting-title">GitHub 用户名</div>
          <div class="setting-desc">绑定你的 GitHub 账号用于 PR / Issue 等操作。</div>
        </div>
        <input v-model="username" class="cfg-input" placeholder="your-username" style="width:100%" />
      </div>
      <div class="setting-row stacked" style="margin-top: 0.75rem">
        <div class="setting-info">
          <div class="setting-title">Personal Access Token</div>
          <div class="setting-desc">需要 repo 和 read:org 权限，令牌仅保存在本地。</div>
        </div>
        <input v-model="token" type="password" class="cfg-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width:100%" />
      </div>
    </UiSurface>

    <UiSurface>
      <div class="section-label">连接状态</div>
      <div class="github-status">
        <div class="github-status-icon" :class="connected ? 'connected' : 'disconnected'">
          <UiIcon :icon="connected ? 'lucide:check-circle-2' : 'lucide:x-circle'" size="lg" />
        </div>
        <div class="github-status-info">
          <div class="setting-title">{{ connected ? '已连接' : '未连接' }}</div>
          <div v-if="connected" class="setting-desc">以 <strong>{{ username }}</strong> 身份连接到 GitHub</div>
          <div v-else class="setting-desc">请填写用户名和 Token 后点击「测试连接」</div>
        </div>
      </div>
      <div class="actions">
        <UiButton variant="ghost" size="sm" @click="testConnection">测试连接</UiButton>
        <UiButton variant="primary" size="sm" @click="save">保存</UiButton>
      </div>
    </UiSurface>

    <UiSurface>
      <div class="section-label">默认配置</div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">默认远程名称</div>
          <div class="setting-desc">git push 时使用的远程名称。</div>
        </div>
        <input v-model="remote" class="cfg-input" placeholder="origin" style="width: 10rem" />
      </div>
      <div class="setting-row" style="margin-top: 0.75rem">
        <div class="setting-info">
          <div class="setting-title">默认分支</div>
          <div class="setting-desc">创建 PR 时默认的目标分支。</div>
        </div>
        <input v-model="defaultBranch" class="cfg-input" placeholder="main" style="width: 10rem" />
      </div>
      <div class="setting-row" style="margin-top: 0.75rem">
        <div class="setting-info">
          <div class="setting-title">SSH 密钥路径</div>
          <div class="setting-desc">自定义 SSH 密钥位置（可选）。</div>
        </div>
        <input v-model="sshKey" class="cfg-input" placeholder="~/.ssh/id_ed25519" style="width: 14rem" />
      </div>
    </UiSurface>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UiButton } from '@/components/ui/Button'
import { UiSurface } from '@/components/ui/Surface'
import { UiIcon } from '@/components/ui/Icon'
import { verifyRepo as verifyRepoApi, saveCredential, getCredential } from '@/api/git'
import { useWorkspaceStore } from '@/stores/workspace'

function toast(msg: string) { alert(msg) }

const workspaceStore = useWorkspaceStore()

const username = ref('')
const token = ref('')
const remote = ref('origin')
const defaultBranch = ref('main')
const sshKey = ref('')
const connected = ref(false)
const testing = ref(false)

onMounted(async () => {
  const ws = workspaceStore.currentWorkspace
  if (!ws) return
  try {
    const saved = await getCredential(ws.path, 'github-pat')
    if (saved) {
      token.value = saved
      connected.value = true
    }
    const savedUser = await getCredential(ws.path, 'github-username')
    if (savedUser) {
      username.value = savedUser
    }
  } catch {
    // Credentials not available yet
  }
})

async function testConnection() {
  if (!token.value) {
    toast('请填写 Token')
    return
  }
  testing.value = true
  try {
    const result = await verifyRepoApi('https://github.com/octocat/Hello-World', token.value)
    connected.value = result.accessible
    toast(result.accessible ? 'GitHub 连接成功' : `连接失败: ${result.message}`)
  } catch (e) {
    connected.value = false
    toast(`连接失败: ${e}`)
  } finally {
    testing.value = false
  }
}

async function save() {
  const ws = workspaceStore.currentWorkspace
  if (!ws) {
    toast('请先打开一个工作区')
    return
  }
  try {
    if (token.value) {
      await saveCredential(ws.path, 'github-pat', token.value)
    }
    if (username.value) {
      await saveCredential(ws.path, 'github-username', username.value)
    }
    toast('GitHub 配置已保存')
  } catch (e) {
    toast(`保存失败: ${e}`)
  }
}
</script>
