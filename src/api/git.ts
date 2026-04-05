import { invoke } from '@tauri-apps/api/core'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VerifyResult {
  accessible: boolean
  isEmpty: boolean
  defaultBranch: string | null
  message: string
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: number
  unstaged: number
  untracked: number
  clean: boolean
}

export interface GitInitResult {
  path: string
  alreadyExisted: boolean
}

export interface GitLogEntry {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}

// ─── Git Operations ─────────────────────────────────────────────────────────

/** Verify that a remote repository is accessible */
export async function verifyRepo(
  url: string,
  token?: string,
): Promise<VerifyResult> {
  return await invoke<VerifyResult>('verify_repo', { url, token: token ?? null })
}

/** Initialize a git repository at the given path */
export async function gitInit(path: string): Promise<GitInitResult> {
  return await invoke<GitInitResult>('git_init', { path })
}

/** Clone a remote repository */
export async function gitClone(
  url: string,
  path: string,
  token?: string,
): Promise<void> {
  return await invoke<void>('git_clone', { url, path, token: token ?? null })
}

/** Stage all changes and commit */
export async function gitAddCommit(path: string, message: string): Promise<void> {
  return await invoke<void>('git_add_commit', { path, message })
}

/** Push to remote */
export async function gitPush(
  path: string,
  remote: string,
  branch: string,
  token?: string,
): Promise<void> {
  return await invoke<void>('git_push', { path, remote, branch, token: token ?? null })
}

/** Pull from remote */
export async function gitPull(
  path: string,
  remote: string,
  branch: string,
  token?: string,
): Promise<void> {
  return await invoke<void>('git_pull', { path, remote, branch, token: token ?? null })
}

/** Get repository status */
export async function gitStatus(path: string): Promise<GitStatus> {
  return await invoke<GitStatus>('git_status', { path })
}

/** Set or update a remote URL */
export async function gitSetRemote(
  path: string,
  name: string,
  url: string,
): Promise<void> {
  return await invoke<void>('git_set_remote', { path, name, url })
}

/** Get commit log entries */
export async function gitLog(path: string, count?: number): Promise<GitLogEntry[]> {
  return await invoke<GitLogEntry[]>('git_log', { path, count: count ?? null })
}

// ─── Credential Management ──────────────────────────────────────────────────

/** Save a credential (encrypted locally) */
export async function saveCredential(
  workspacePath: string,
  key: string,
  value: string,
): Promise<void> {
  return await invoke<void>('save_credential', { workspacePath, key, value })
}

/** Get a credential by key */
export async function getCredential(
  workspacePath: string,
  key: string,
): Promise<string | null> {
  return await invoke<string | null>('get_credential', { workspacePath, key })
}

/** Delete a credential by key */
export async function deleteCredential(
  workspacePath: string,
  key: string,
): Promise<void> {
  return await invoke<void>('delete_credential', { workspacePath, key })
}
