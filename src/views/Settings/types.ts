export interface McpServer {
  name: string
  type: 'stdio' | 'sse' | 'streamableHttp'
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
  description?: string
}

export interface Agent {
  id: string
  name: string
  description: string
  color: string
  enabled: boolean
  model: string
  skills: string[]
  mcpServers: McpServer[]
  systemPrompt: string
}

export interface Skill {
  id: string
  name: string
  icon: string
  type: 'builtin' | 'custom'
  description: string
  command: string
  enabled: boolean
}

export interface Hook {
  id: string
  name: string
  event: string
  description: string
  command: string
  pattern: string
  enabled: boolean
  blocking: boolean
}

export const SKILL_ICON_MAP: Record<string, string> = {
  'code-review': 'lucide:code-2',
  'commit': 'lucide:git-commit-horizontal',
  'search': 'lucide:search',
  'file-edit': 'lucide:file-pen',
  'file-read': 'lucide:file-text',
  'bash-run': 'lucide:terminal',
  'web-fetch': 'lucide:globe',
  'code-search': 'lucide:scan-search',
  'refactor': 'lucide:layers',
  'debug': 'lucide:bug',
  'test-gen': 'lucide:test-tubes',
  'doc-gen': 'lucide:book-open',
  'api-design': 'lucide:route',
  'schema-gen': 'lucide:database',
  'deploy': 'lucide:rocket',
}

export function getSkillIcon(id: string) {
  return SKILL_ICON_MAP[id] || 'lucide:puzzle'
}

export function getMcpIcon(type: string) {
  if (type === 'sse') return 'lucide:radio-tower'
  if (type === 'streamableHttp') return 'lucide:cloud'
  return 'lucide:terminal-square'
}

export function getHookIcon(event: string) {
  if (event.startsWith('pre')) return 'lucide:shield-check'
  if (event.startsWith('post')) return 'lucide:check-circle-2'
  if (event.startsWith('on-file')) return 'lucide:file-sync'
  return 'lucide:webhook'
}

export function fmtEnv(env?: Record<string, string>) {
  if (!env || Object.keys(env).length === 0) return ''
  return JSON.stringify(env, null, 2)
}

export function tryParseEnv(raw: string): Record<string, string> {
  try { return JSON.parse(raw) } catch { return {} }
}
