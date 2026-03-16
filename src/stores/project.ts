import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'locked'
export type ModelProvider = 'anthropic' | 'openai'

export interface PhaseState {
  status: PhaseStatus
  model?: string
  lockedAt?: string
}

export interface ProjectConfig {
  id: string
  name: string
  description: string
  workspacePath: string
  createdAt: string
  updatedAt: string
  defaultModel: string
  phases: {
    requirements: PhaseState
    prototype: PhaseState
    tech: PhaseState
    tasks: PhaseState
    retrospective: PhaseState
  }
  sync?: {
    type: 'github' | 'none'
    repoUrl?: string
    lastSynced?: string
  }
}

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<ProjectConfig | null>(null)
  const projects = ref<ProjectConfig[]>([])
  const activePhase = ref<string>('overview')

  const currentPhaseModel = computed(() => {
    if (!currentProject.value) return null
    const phase = activePhase.value as keyof ProjectConfig['phases']
    if (phase in (currentProject.value.phases || {})) {
      return (
        (currentProject.value.phases as Record<string, PhaseState>)[phase]?.model ||
        currentProject.value.defaultModel
      )
    }
    return currentProject.value.defaultModel
  })

  function setCurrentProject(project: ProjectConfig | null) {
    currentProject.value = project
    if (project) {
      activePhase.value = 'overview'
    }
  }

  function setActivePhase(phase: string) {
    activePhase.value = phase
  }

  function updateProject(updates: Partial<ProjectConfig>) {
    if (!currentProject.value) return
    currentProject.value = { ...currentProject.value, ...updates, updatedAt: new Date().toISOString() }
  }

  return {
    currentProject,
    projects,
    activePhase,
    currentPhaseModel,
    setCurrentProject,
    setActivePhase,
    updateProject,
  }
})
