<template>
  <div class="master-detail-layout">
    <!-- List -->
    <div class="list-panel">
      <div class="list-header">
        <div class="section-label">Skill 列表</div>
        <UiButton variant="primary" size="sm" @click="add">
          <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
          新建
        </UiButton>
      </div>
      <div class="list-scroll">
        <div
          v-for="sk in skills" :key="sk.id"
          class="item-card" :class="{ active: selectedId === sk.id }"
          @click="selectedId = sk.id"
        >
          <div class="item-icon-box"><UiIcon :icon="sk.icon" size="md" /></div>
          <div class="item-info">
            <div class="item-name">{{ sk.name }}</div>
            <div class="item-meta">{{ sk.type }} · {{ sk.enabled ? '启用' : '停用' }}</div>
          </div>
        </div>
        <div v-if="skills.length === 0" class="empty-state">
          <UiIcon icon="lucide:puzzle" size="lg" />
          <p>还没有 Skill</p>
        </div>
      </div>
    </div>

    <!-- Detail -->
    <div class="detail-scroll">
      <template v-if="current">
        <div class="detail-header">
          <div class="detail-identity">
            <div class="detail-avatar" style="background:var(--color-accent)"><UiIcon :icon="current.icon" size="lg" /></div>
            <div class="detail-title-area">
              <input v-model="current.name" class="inline-title-input" placeholder="Skill 名称" />
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

        <UiSurface padding="sm">
          <div class="setting-row">
            <div class="setting-info"><div class="setting-title">类型</div></div>
            <select v-model="current.type" class="cfg-select">
              <option value="builtin">内置</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </UiSurface>

        <UiSurface padding="sm">
          <div class="section-label">图标</div>
          <input v-model="current.icon" class="cfg-input" placeholder="lucide:puzzle" />
        </UiSurface>

        <UiSurface padding="sm">
          <div class="section-label">描述</div>
          <textarea v-model="current.description" class="cfg-textarea" rows="2" placeholder="描述该 Skill 的功能..." />
        </UiSurface>

        <UiSurface v-if="current.type === 'custom'" padding="sm">
          <div class="section-label">执行命令</div>
          <input v-model="current.command" class="cfg-input" placeholder="bash 脚本或可执行命令" />
        </UiSurface>

        <UiSurface padding="sm">
          <div class="section-label">关联 Agent</div>
          <div class="tag-list">
            <div v-for="a in agentsUsingSkill" :key="a.id" class="tag tag-info">{{ a.name }}</div>
            <div v-if="agentsUsingSkill.length === 0" class="empty-hint">暂无 Agent 使用此 Skill</div>
          </div>
        </UiSurface>

        <div class="actions">
          <UiButton variant="primary" @click="toast('Skill 配置已保存')">保存 Skill</UiButton>
        </div>
      </template>
      <div v-else class="empty-state">
        <UiIcon icon="lucide:mouse-pointer-click" size="lg" />
        <p>选择左侧 Skill 查看配置</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { type Skill, type Agent } from '../types'

function toast(msg: string) { alert(msg) }

let idSeq = 200
function uid() { return `sk-${idSeq++}` }

// Mock agents for cross-reference display
const agents = ref<Agent[]>([
  {
    id: 'agent-1', name: 'Code Reviewer', description: '', color: '#6366f1', enabled: true,
    model: 'claude-sonnet-4-6',
    skills: ['code-review', 'file-read', 'search', 'code-search'],
    mcpServers: [],
    systemPrompt: '',
  },
  {
    id: 'agent-2', name: 'Requirement Analyst', description: '', color: '#ec4899', enabled: true,
    model: 'inherit',
    skills: ['doc-gen', 'file-edit', 'search', 'api-design'],
    mcpServers: [],
    systemPrompt: '',
  },
  {
    id: 'agent-3', name: 'Test Engineer', description: '', color: '#f59e0b', enabled: false,
    model: 'claude-haiku-4-5-20251001',
    skills: ['test-gen', 'bash-run', 'file-edit', 'code-search'],
    mcpServers: [],
    systemPrompt: '',
  },
])

const skills = ref<Skill[]>([
  { id: 'sk-1', name: 'code-review', icon: 'lucide:code-2', type: 'builtin', description: '审查代码质量、安全性和最佳实践。', command: '', enabled: true },
  { id: 'sk-2', name: 'commit', icon: 'lucide:git-commit-horizontal', type: 'builtin', description: '生成规范的 commit message 并提交。', command: '', enabled: true },
  { id: 'sk-3', name: 'search', icon: 'lucide:search', type: 'builtin', description: '在代码库中搜索关键字。', command: '', enabled: true },
  { id: 'sk-4', name: 'file-edit', icon: 'lucide:file-pen', type: 'builtin', description: '编辑文件内容。', command: '', enabled: true },
  { id: 'sk-5', name: 'file-read', icon: 'lucide:file-text', type: 'builtin', description: '读取文件内容。', command: '', enabled: true },
  { id: 'sk-6', name: 'bash-run', icon: 'lucide:terminal', type: 'builtin', description: '执行 bash 命令。', command: '', enabled: true },
  { id: 'sk-7', name: 'web-fetch', icon: 'lucide:globe', type: 'builtin', description: '获取网页内容。', command: '', enabled: true },
  { id: 'sk-8', name: 'deploy', icon: 'lucide:rocket', type: 'custom', description: '自定义部署脚本。', command: './scripts/deploy.sh', enabled: true },
])

const selectedId = ref<string | null>('sk-1')
const current = computed(() => skills.value.find(s => s.id === selectedId.value) ?? null)

const agentsUsingSkill = computed(() => {
  if (!current.value) return []
  return agents.value.filter(a => a.skills.includes(current.value!.name))
})

function add() {
  const s: Skill = { id: uid(), name: '', icon: 'lucide:puzzle', type: 'custom', description: '', command: '', enabled: true }
  skills.value.push(s); selectedId.value = s.id
}

function remove(id: string) {
  const idx = skills.value.findIndex(s => s.id === id)
  if (idx !== -1) skills.value.splice(idx, 1)
  if (selectedId.value === id) selectedId.value = skills.value[0]?.id ?? null
}
</script>
