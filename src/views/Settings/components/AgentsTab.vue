<template>
  <div class="master-detail-layout">
    <!-- List -->
    <div class="list-panel">
      <div class="list-header">
        <div class="section-label">Agent 列表</div>
        <UiButton variant="primary" size="sm" @click="add">
          <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
          新建
        </UiButton>
      </div>
      <div class="list-scroll">
        <div
          v-for="agent in agents" :key="agent.id"
          class="item-card" :class="{ active: selectedId === agent.id }"
          @click="selectedId = agent.id"
        >
          <div class="item-avatar" :style="{ background: agent.color }">{{ agent.name.charAt(0) }}</div>
          <div class="item-info">
            <div class="item-name">{{ agent.name }}</div>
            <div class="item-meta">{{ agent.skills.length }} Skills · {{ agent.mcpServers.length }} MCP</div>
          </div>
          <div class="item-status" :class="agent.enabled ? 'on' : 'off'">{{ agent.enabled ? '启用' : '停用' }}</div>
        </div>
        <div v-if="agents.length === 0" class="empty-state">
          <UiIcon icon="lucide:bot" size="lg" />
          <p>还没有 Agent，点击上方按钮创建</p>
        </div>
      </div>
    </div>

    <!-- Detail -->
    <div class="detail-scroll">
      <template v-if="current">
        <!-- Header -->
        <div class="detail-header">
          <div class="detail-identity">
            <div class="detail-avatar" :style="{ background: current.color }">{{ current.name.charAt(0) }}</div>
            <div class="detail-title-area">
              <input v-model="current.name" class="inline-title-input" placeholder="Agent 名称" />
              <div class="detail-subtitle">ID: {{ current.id }}</div>
            </div>
          </div>
          <div class="detail-actions">
            <label class="toggle-wrap">
              <input type="checkbox" v-model="current.enabled" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
              <span class="toggle-label">{{ current.enabled ? '已启用' : '已停用' }}</span>
            </label>
            <UiButton variant="danger" size="sm" @click="remove(current.id)">
              <template #icon><UiIcon icon="lucide:trash-2" size="sm" /></template>
              删除
            </UiButton>
          </div>
        </div>

        <!-- Description -->
        <UiSurface padding="sm">
          <div class="section-label">描述</div>
          <textarea v-model="current.description" class="cfg-textarea" rows="2" placeholder="描述该 Agent 的角色和职责..." />
        </UiSurface>

        <!-- Model -->
        <UiSurface padding="sm">
          <div class="section-label">模型</div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-title">Agent 使用的模型</div>
              <div class="setting-desc">可覆盖全局默认模型。</div>
            </div>
            <select v-model="current.model" class="cfg-select">
              <option value="inherit">继承全局默认</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-opus-4-6">Claude Opus 4.6</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            </select>
          </div>
        </UiSurface>

        <!-- Skills -->
        <UiSurface padding="sm">
          <div class="section-header">
            <div class="section-label" style="margin-bottom:0">Skills</div>
            <UiButton variant="ghost" size="sm" @click="pickerOpen = true">
              <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
              添加
            </UiButton>
          </div>
          <div class="tag-list">
            <div v-for="sk in current.skills" :key="sk" class="tag">
              <UiIcon :icon="getSkillIcon(sk)" size="sm" />
              <span>{{ sk }}</span>
              <button class="tag-remove" @click="current!.skills.splice(current!.skills.indexOf(sk), 1)"><UiIcon icon="lucide:x" size="sm" /></button>
            </div>
            <div v-if="current.skills.length === 0" class="empty-hint">暂无 Skill</div>
          </div>
          <div v-if="pickerOpen" class="picker-overlay" @click.self="pickerOpen = false">
            <div class="picker-dropdown">
              <input v-model="pickerQ" class="cfg-input" placeholder="搜索 Skill..." style="width:100%;margin-bottom:0.35rem" />
              <div class="picker-options">
                <button v-for="s in pickerFiltered" :key="s" class="picker-option" @click="current!.skills.push(s); pickerOpen = false; pickerQ = ''">
                  <UiIcon :icon="getSkillIcon(s)" size="sm" />
                  <span>{{ s }}</span>
                </button>
                <div v-if="pickerFiltered.length === 0" class="picker-empty">没有可添加的 Skill</div>
              </div>
            </div>
          </div>
        </UiSurface>

        <!-- MCP -->
        <UiSurface padding="sm">
          <div class="section-header">
            <div class="section-label" style="margin-bottom:0">MCP Servers</div>
            <UiButton variant="ghost" size="sm" @click="current!.mcpServers.push({ name: '', type: 'stdio', command: '', args: [], env: {}, enabled: true })">
              <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
              添加
            </UiButton>
          </div>
          <div class="mcp-list">
            <div v-for="(srv, idx) in current.mcpServers" :key="idx" class="mcp-item">
              <div class="mcp-row">
                <div class="mcp-icon"><UiIcon :icon="getMcpIcon(srv.type)" size="md" /></div>
                <input v-model="srv.name" class="cfg-input" placeholder="Server 名称" style="flex:1" />
                <select v-model="srv.type" class="cfg-select-sm">
                  <option value="stdio">stdio</option>
                  <option value="sse">sse</option>
                  <option value="streamableHttp">streamableHttp</option>
                </select>
                <label class="toggle-wrap toggle-sm">
                  <input type="checkbox" v-model="srv.enabled" class="toggle-input" />
                  <span class="toggle-track"><span class="toggle-thumb" /></span>
                </label>
                <button class="tag-remove" @click="current!.mcpServers.splice(idx,1)"><UiIcon icon="lucide:trash-2" size="sm" /></button>
              </div>
              <div class="mcp-fields">
                <div class="field-group">
                  <label class="field-label">命令 / URL</label>
                  <input v-model="srv.command" class="cfg-input" :placeholder="srv.type === 'stdio' ? 'npx -y @example/mcp-server' : 'http://localhost:3000/mcp'" />
                </div>
                <div v-if="srv.type === 'stdio'" class="field-group">
                  <label class="field-label">参数（每行一个）</label>
                  <textarea :value="srv.args?.join('\n')" @input="srv.args = ($event.target as HTMLTextAreaElement).value.split('\n').filter(Boolean)" class="cfg-textarea" rows="2" placeholder="--port&#10;8080" />
                </div>
                <div class="field-group">
                  <label class="field-label">环境变量（JSON）</label>
                  <textarea :value="fmtEnv(srv.env)" @input="srv.env = tryParseEnv(($event.target as HTMLTextAreaElement).value)" class="cfg-textarea" rows="2" placeholder='{ "API_KEY": "sk-xxx" }' />
                </div>
              </div>
            </div>
            <div v-if="current.mcpServers.length === 0" class="empty-hint">暂无 MCP Server</div>
          </div>
        </UiSurface>

        <!-- System Prompt -->
        <UiSurface padding="sm">
          <div class="section-label">System Prompt</div>
          <textarea v-model="current.systemPrompt" class="cfg-textarea" rows="5" placeholder="自定义 System Prompt..." />
        </UiSurface>

        <div class="actions">
          <UiButton variant="primary" @click="toast('Agent 配置已保存')">保存 Agent</UiButton>
        </div>
      </template>
      <div v-else class="empty-state">
        <UiIcon icon="lucide:mouse-pointer-click" size="lg" />
        <p>选择左侧 Agent 查看配置</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { type Agent, getSkillIcon, getMcpIcon, fmtEnv, tryParseEnv, SKILL_ICON_MAP } from '../types'

function toast(msg: string) { alert(msg) }

const agentColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
let colorIdx = 0
let idSeq = 100
function uid() { return `agent-${idSeq++}` }

const agents = ref<Agent[]>([
  {
    id: 'agent-1', name: 'Code Reviewer', description: '专注于代码审查，自动发现潜在问题和改进建议。',
    color: '#6366f1', enabled: true, model: 'claude-sonnet-4-6',
    skills: ['code-review', 'file-read', 'search', 'code-search'],
    mcpServers: [{ name: 'GitHub MCP', type: 'stdio', command: 'npx -y @modelcontextprotocol/server-github', args: ['--owner', 'my-org'], env: { GITHUB_TOKEN: 'ghp_xxxxx' }, enabled: true }],
    systemPrompt: '你是一个专业的代码审查助手。\n1. 代码质量和可读性\n2. 潜在的 bug 和安全漏洞\n3. 性能优化建议\n4. 测试覆盖度',
  },
  {
    id: 'agent-2', name: 'Requirement Analyst', description: '分析用户需求，将模糊的需求转化为清晰的技术文档。',
    color: '#ec4899', enabled: true, model: 'inherit',
    skills: ['doc-gen', 'file-edit', 'search', 'api-design'],
    mcpServers: [
      { name: 'Context7', type: 'stdio', command: 'npx -y @context7/mcp-server', args: [], env: {}, enabled: true },
      { name: 'Web Reader', type: 'sse', command: 'http://localhost:3001/mcp', args: [], env: {}, enabled: false },
    ],
    systemPrompt: '你是一个需求分析专家。将用户需求转化为结构化的技术文档。',
  },
  {
    id: 'agent-3', name: 'Test Engineer', description: '自动生成和运行测试用例。',
    color: '#f59e0b', enabled: false, model: 'claude-haiku-4-5-20251001',
    skills: ['test-gen', 'bash-run', 'file-edit', 'code-search'], mcpServers: [],
    systemPrompt: '你是一个测试工程师。根据代码自动生成测试。',
  },
])

const selectedId = ref<string | null>('agent-1')
const current = computed(() => agents.value.find(a => a.id === selectedId.value) ?? null)

// Skill picker
const pickerOpen = ref(false)
const pickerQ = ref('')
const pickerFiltered = computed(() => {
  if (!current.value) return []
  const q = pickerQ.value.toLowerCase()
  return Object.keys(SKILL_ICON_MAP).filter(s => !current.value!.skills.includes(s) && s.includes(q))
})

function add() {
  const a: Agent = { id: uid(), name: 'New Agent', description: '', color: agentColors[colorIdx++ % agentColors.length], enabled: true, model: 'inherit', skills: [], mcpServers: [], systemPrompt: '' }
  agents.value.push(a); selectedId.value = a.id
}

function remove(id: string) {
  if (!confirm('确定要删除该 Agent 吗？')) return
  const idx = agents.value.findIndex(a => a.id === id)
  if (idx !== -1) agents.value.splice(idx, 1)
  if (selectedId.value === id) selectedId.value = agents.value[0]?.id ?? null
}
</script>
