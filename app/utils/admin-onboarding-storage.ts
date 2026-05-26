import type { AdminOnboardingStepId } from "../data/admin-onboarding-steps"

export type AdminOnboardingStorageState = {
  started: boolean
  completed: boolean
  dismissed: boolean
  currentStepId: AdminOnboardingStepId | null
  completedStepIds: AdminOnboardingStepId[]
}

const STORAGE_VERSION = 1

function storageKey(slug: string) {
  return `hostiv-admin-onboarding:v${STORAGE_VERSION}:${slug.trim().toLowerCase()}`
}

const defaultState = (): AdminOnboardingStorageState => ({
  started: false,
  completed: false,
  dismissed: false,
  currentStepId: null,
  completedStepIds: []
})

export function loadAdminOnboardingState(slug: string): AdminOnboardingStorageState {
  if (typeof localStorage === "undefined") {
    return defaultState()
  }

  try {
    const raw = localStorage.getItem(storageKey(slug))

    if (!raw) {
      return defaultState()
    }

    const parsed = JSON.parse(raw) as Partial<AdminOnboardingStorageState>

    return {
      ...defaultState(),
      ...parsed,
      completedStepIds: Array.isArray(parsed.completedStepIds)
        ? parsed.completedStepIds.filter(Boolean)
        : []
    }
  } catch {
    return defaultState()
  }
}

export function saveAdminOnboardingState(slug: string, state: AdminOnboardingStorageState) {
  if (typeof localStorage === "undefined") {
    return
  }

  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(state))
  } catch {
    /* quota / mode privé */
  }
}
