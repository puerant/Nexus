<template>
  <div class="master-detail-layout">
    <div class="list-panel">
      <div class="list-header">
        <div class="section-label">MCP Server 列表</div>
        <UiButton variant="primary" size="sm" @click="add">
          <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
          新建
        </UiButton>
      </div>
      <div class="list-scroll">
        <div
          v-for="(srv, idx) in servers" :key="idx"
          class="item-card" :class="{ active: selectedIdx === idx }"
          @click="selectedIdx = idx"
        >
          <div class="item-icon-box"><UiIcon :icon="getMcpIcon(srv.type)" size="md" /></div>
          <div class="item-info">
            <div class="item-name">{{ srv.name || '未命名' }}</div>
            <div class="item-meta">{{ srv.type }}</div>
          </div>
          <div class="item-status" :class="srv.enabled ? 'on' : 'off'">{{ srv.enabled ? '启用' : '停用' }}</div>
        </div>
        <div v-if="servers.length === 0" class="empty-state">
          <UiIcon icon="lucide:terminal-square" size="lg" />
          <p>还没有 MCP Server</p>
        </div>
      </div>
    </div>

    <!-- Detail -->
    <div class="detail-scroll">
      <template v-if="current">
        <div class="detail-header">
          <div class="detail-identity">
            <div class="detail-avatar" style="background:#10b981"><UiIcon :icon="getMcpIcon(current.type)" size="lg" /></div>
            <div class="detail-title-area">
              <input v-model="current.name" class="inline-title-input" placeholder="Server 名称" />
            </div>
          </div>
          <div class="detail-actions">
            <label class="toggle-wrap">
              <input type="checkbox" v-model="current.enabled" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
              <span class="toggle-label">{{ current.enabled ? '已启用' : '已停用' }}</span>
            </label>
            <UiButton variant="danger" size="sm" @click="remove(selectedIdx!)">
              <template #icon><UiIcon icon="lucide:trash-2" size="sm" /></template>
              删除
            </UiButton>
          </div>
        </div>

        <UiSurface padding="sm">
          <div class="setting-row">
            <div class="setting-info"><div class="setting-title">传输类型</div></div>
            <select v-model="current.type" class="cfg-select">
              <option value="stdio">stdio</option>
              <option value="sse">sse</option>
              <option value="streamableHttp">streamableHttp</option>
            </select>
          </div>
        </UiSurface>
        <UiSurface padding="sm">
          <div class="field-group">
            <label class="field-label">命令 / URL</label>
            <input v-model="current.command" class="cfg-input" :placeholder="current.type === 'stdio' ? 'npx -y @example/mcp-server' : 'http://localhost:3000/mcp'" />
          </div>
        </UiSurface>
        <UiSurface v-if="current.type === 'stdio'" padding="sm">
          <div class="field-group">
            <label class="field-label">参数（每行一个)</label>
            <textarea
              :value="current.args?.join('\n')"
              @input="current.args = ($event.target as HTMLTextAreaElement).value.split('\n').filter(Boolean)"
              class="cfg-textarea" rows="2" placeholder="--port&#10;8080"
            />
          </div>
        </UiSurface>
        <UiSurface padding="sm">
          <div class="field-group">
            <label class="field-label">环境变量（JSON)</label>
            <textarea
              :value="fmtEnv(current.env)"
              @input="current.env = tryParseEnv(($event.target as HTMLTextAreaElement).value)"
              class="cfg-textarea" rows="2" placeholder='{ "API_KEY": "sk-xxx" }'
            />
          </div>
        </UiSurface>
        <UiSurface padding="sm">
          <div class="section-label">描述</div>
          <textarea v-model="current.description" class="cfg-textarea" rows="2" placeholder="描述 MCP Server 的用途..." />
        </UiSurface>
        <UiSurface padding="sm">
          <div class="section-header">
            <div class="section-label" style="margin-bottom:0">关联 Agent</div>
          </div>
          <div class="tag-list">
            <div v-for="a in agentsUsingCurrentServer" :key="a.id" class="tag tag-info">{{ a.name }}</div>
            <div v-if="agentsUsingCurrentServer.length === 0" class="empty-hint">暂无 Agent 使用此 Server</div>
          </div>
        </UiSurface>
        <div class="actions">
          <UiButton variant="primary" @click="toast('MCP Server 已保存')">保存 Server</UiButton>
        </div>
      </template>
      <div v-else class="empty-state">
        <UiIcon icon="lucide:mouse-pointer-click" size="lg" />
        <p>选择左侧 Server 查看配置</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { type McpServer, type Agent, getMcpIcon, fmtEnv, tryParseEnv } from '../types'
function toast(msg: string) { alert(msg) }

const servers = ref<McpServer[]>([
  { name: 'GitHub MCP', type: 'stdio', command: 'npx -y @modelcontextprotocol/server-github', args: [], env: { GITHUB_TOKEN: 'ghp_xxxxx' }, enabled: true, description: 'GitHub API 集成 PR 管理 Issue 等操作' },
  { name: 'Context7', type: 'stdio', command: 'npx -y @context7/mcp-server', args: [], env: {}, enabled: true, description: '访问最新文档和上下文查询 API' },
  { name: 'Filesystem', type: 'stdio', command: 'npx -y @modelcontextprotocol/server-filesystem', args: ['/home/user/projects'], env: {}, enabled: false, description: '本地文件系统访问' },
])
const selectedIdx = ref<number | null>(0)
const current = computed(() => selectedIdx.value !== null ? servers.value[selectedIdx.value] ?? null : null)
const agentsUsingCurrentServer = computed<Agent[]>(() => {
  if (!current.value) return []
  return []
})
function add() {
  servers.value.push({ name: '', type: 'stdio', command: '', args: [], env: {}, enabled: true })
  selectedIdx.value = servers.value.length - 1
}
function remove(idx: number) {
  if (!confirm('确定要删除该 MCP Server 吗？')) return
  servers.value.splice(idx, 1)
  if (selectedIdx.value !== null && selectedIdx.value >= servers.value.length) {
    selectedIdx.value = servers.value.length - 1
  }
  if (selectedIdx.value === idx) selectedIdx.value = null
}
</script>
