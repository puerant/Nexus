import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Workspace {
  path: string
  name: string
  lastOpened: string
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const recentWorkspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)

  function addRecentWorkspace(workspace: Workspace) {
    const existing = recentWorkspaces.value.findIndex((w) => w.path === workspace.path)
    if (existing !== -1) {
      recentWorkspaces.value.splice(existing, 1)
    }
    recentWorkspaces.value.unshift(workspace)
    // Keep only last 10
    if (recentWorkspaces.value.length > 10) {
      recentWorkspaces.value = recentWorkspaces.value.slice(0, 10)
    }
    saveToStorage()
  }

  function setCurrentWorkspace(workspace: Workspace | null) {
    currentWorkspace.value = workspace
    if (workspace) {
      addRecentWorkspace(workspace)
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('recentWorkspaces')
      if (saved) {
        recentWorkspaces.value = JSON.parse(saved)
      }
    } catch {
      // ignore
    }
  }

  function saveToStorage() {
    localStorage.setItem('recentWorkspaces', JSON.stringify(recentWorkspaces.value))
  }

  // Initialize
  loadFromStorage()

  return { recentWorkspaces, currentWorkspace, setCurrentWorkspace, addRecentWorkspace }
})
