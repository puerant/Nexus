import { invoke } from '@tauri-apps/api/core'

export type TerminalType = 'powershell' | 'cmd'

/**
 * Open a terminal application with an optional working directory.
 * Falls back to the user's home directory if no working directory is provided.
 */
export async function openTerminal(terminal: TerminalType, workingDir?: string): Promise<void> {
  return await invoke('open_terminal', { terminal, workingDir })
}

/**
 * Open the system file explorer at the given path.
 * Falls back to the user's home directory if no path is provided.
 */
export async function openFileExplorer(path?: string): Promise<void> {
  return await invoke('open_file_explorer', { path })
}
