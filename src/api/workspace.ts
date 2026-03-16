import { invoke } from '@tauri-apps/api/core'

export interface WorkspaceInfo {
  path: string
  name: string
  hasAiWorkflow: boolean
}

export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  children?: FileEntry[]
}

/**
 * Open a native folder-picker dialog and return the selected path.
 */
export async function openWorkspace(): Promise<string | null> {
  return await invoke<string | null>('open_workspace')
}

/**
 * Scan a workspace directory and return its file tree.
 */
export async function scanWorkspace(path: string): Promise<FileEntry[]> {
  return await invoke<FileEntry[]>('scan_workspace', { path })
}

/**
 * Read a file within the workspace (path must be inside workspace root).
 */
export async function readFile(workspacePath: string, relativePath: string): Promise<string> {
  return await invoke<string>('read_file', { workspacePath, relativePath })
}

/**
 * Write content to a file within the workspace (path must be inside workspace root).
 */
export async function writeFile(
  workspacePath: string,
  relativePath: string,
  content: string,
): Promise<void> {
  return await invoke<void>('write_file', { workspacePath, relativePath, content })
}

/**
 * Initialize the .ai-workflow/ directory structure in the workspace.
 */
export async function initProjectStructure(workspacePath: string, projectName: string): Promise<void> {
  return await invoke<void>('init_project_structure', { workspacePath, projectName })
}

/**
 * Read project.json config file.
 */
export async function readProjectConfig(workspacePath: string): Promise<Record<string, unknown> | null> {
  return await invoke<Record<string, unknown> | null>('read_project_config', { workspacePath })
}

/**
 * Write project.json config file.
 */
export async function writeProjectConfig(
  workspacePath: string,
  config: Record<string, unknown>,
): Promise<void> {
  return await invoke<void>('write_project_config', { workspacePath, config })
}
