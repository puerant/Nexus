<template>
  <div class="master-detail-layout">
    <!-- List -->
    <div class="list-panel">
      <div class="list-header">
        <div class="section-label">Hook 列表</div>
        <UiButton variant="primary" size="sm" @click="add">
          <template #icon><UiIcon icon="lucide:plus" size="sm" /></template>
          新建
        </UiButton>
      </div>
      <div class="list-scroll">
        <div
          v-for="hook in hooks" :key="hook.id"
          class="item-card" :class="{ active: selectedId === hook.id }"
          @click="selectedId = hook.id"
        >
          <div class="item-icon-box"><UiIcon :icon="getHookIcon(hook.event)" size="md" /></div>
          <div class="item-info">
            <div class="item-name">{{ hook.name }}</div>
            <div class="item-meta">{{ hook.event }}</div>
          </div>
          <div class="item-status" :class="hook.enabled ? 'on' : 'off'">{{ hook.enabled ? '启用' : '停用' }}</div>
        </div>
        <div v-if="hooks.length === 0" class="empty-state">
          <UiIcon icon="lucide:webhook" size="lg" />
          <p>还没有 Hook</p>
        </div>
      </div>
    </div>

    <!-- Detail -->
    <div class="detail-scroll">
      <template v-if="current">
        <div class="detail-header">
          <div class="detail-identity">
            <div class="detail-avatar" style="background:#8b5cf6"><UiIcon icon="lucide:webhook" size="lg" /></div>
            <div class="detail-title-area">
              <input v-model="current.name" class="inline-title-input" placeholder="Hook 名称" />
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
            <div class="setting-info">
              <div class="setting-title">触发事件</div>
              <div class="setting-desc">Hook 在该事件发生时时自动执行。</div>
            </div>
            <select v-model="current.event" class="cfg-select">
              <option value="pre-commit">pre-commit（提交前）</option>
              <option value="post-commit">post-commit（提交后）</option>
              <option value="pre-push">pre-push（推送前）</option>
              <option value="post-merge">post-merge（合并后）</option>
              <option value="on-file-change">on-file-change（文件变更）</option>
              <option value="on-task-start">on-task-start（任务开始）</option>
              <option value="on-task-complete">on-task-complete（任务完成）</option>
            </select>
          </div>
        </UiSurface>

        <UiSurface padding="sm">
          <div class="section-label">描述</div>
          <textarea v-model="current.description" class="cfg-textarea" rows="2" placeholder="描述 Hook 的作用..." />
        </UiSurface>
        <UiSurface padding="sm">
          <div class="field-group">
            <label class="field-label">执行命令</label>
            <input v-model="current.command" class="cfg-input" placeholder="npm run lint" />
          </div>
        </UiSurface>
        <UiSurface padding="sm">
          <div class="field-group">
            <label class="field-label">条件（可选，正则匹配文件路径）</label>
            <input v-model="current.pattern" class="cfg-input" placeholder="src/.*\.ts$" />
          </div>
        </UiSurface>
        <UiSurface padding="sm">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-title">阻止执行</div>
              <div class="setting-desc">Hook 失败时阻止后续操作（如阻止提交）。</div>
            </div>
            <label class="toggle-wrap">
              <input type="checkbox" v-model="current.blocking" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </label>
          </div>
        </UiSurface>

        <div class="actions">
          <UiButton variant="primary" @click="toast('Hook 已保存')">保存 Hook</UiButton>
        </div>
      </template>
      <div v-else class="empty-state">
        <UiIcon icon="lucide:mouse-pointer-click" size="lg" />
        <p>选择左侧 Hook 查看配置</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSurface from '@/components/ui/UiSurface.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { type Hook, getHookIcon } from '../types'

function toast(msg: string) { alert(msg) }

let idSeq = 200
function uid() { return `hk-${idSeq++}` }

const hooks = ref<Hook[]>([
  { id: 'hk-1', name: 'Lint Check', event: 'pre-commit', description: '提交前自动运行 ESLint 检查。', command: 'npm run lint', pattern: 'src/.*\\.(ts|vue)$', enabled: true, blocking: true },
  { id: 'hk-2', name: 'Type Check', event: 'pre-push', description: '推送前运行 TypeScript 类型检查。', command: 'npx vue-tsc --noEmit', pattern: '', enabled: true, blocking: true },
  { id: 'hk-3', name: 'Notify Build', event: 'post-merge', description: '合并后通知 CI 开始构建。', command: 'curl -X POST https://ci.example.com/build', pattern: '', enabled: false, blocking: false },
  { id: 'hk-4', name: 'Auto Test', event: 'on-file-change', description: '文件变更时自动运行相关测试。', command: 'npm run test:related $FILE', pattern: 'src/.*\\.ts$', enabled: true, blocking: false },
])

const selectedId = ref<string | null>('hk-1')
const current = computed(() => hooks.value.find(h => h.id === selectedId.value) ?? null)

function add() {
  const h: Hook = { id: uid(), name: '', event: 'pre-commit', description: '', command: '', pattern: '', enabled: true, blocking: false }
  hooks.value.push(h); selectedId.value = h.id
}
function remove(id: string) {
  const idx = hooks.value.findIndex(h => h.id === id)
  if (idx !== -1) hooks.value.splice(idx, 1)
  if (selectedId.value === id) selectedId.value = hooks.value[0]?.id ?? null
}
</script>
