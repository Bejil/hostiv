import {
  adminOnboardingStepCount,
  adminOnboardingSteps,
  evaluateOnboardingStep,
  type AdminOnboardingStepId
} from "../data/admin-onboarding-steps"
import type { AdminSectionId } from "../data/admin-nav-sections"
import type { PropertyAdminRecord } from "../types/property-admin"
import {
  loadAdminOnboardingState,
  saveAdminOnboardingState,
  type AdminOnboardingStorageState
} from "../utils/admin-onboarding-storage"

export type AdminOnboardingPhase = "hidden" | "welcome" | "active" | "celebration"

export function useAdminOnboarding(options: {
  slug: Ref<string>
  record: Ref<PropertyAdminRecord | null>
  selectSection: (id: AdminSectionId) => void
  /** Si true, change la section du menu latéral à chaque étape (désactivé pour le wizard en modal). */
  syncSidebar?: boolean
  /** Persiste le brouillon admin (ex. PUT site) avant de changer d’étape. */
  saveDraft?: () => Promise<boolean>
}) {
  const syncSidebar = options.syncSidebar ?? true
  const route = useRoute()
  const router = useRouter()

  const phase = ref<AdminOnboardingPhase>("hidden")
  const stepIndex = ref(0)
  const storage = ref<AdminOnboardingStorageState>(loadAdminOnboardingState(options.slug.value))
  let autoLaunchDone = false

  const currentStep = computed(
    () => adminOnboardingSteps[stepIndex.value] ?? adminOnboardingSteps[0]
  )

  const progressPercent = computed(() => {
    const done = storage.value.completedStepIds.length
    const total = Math.max(adminOnboardingStepCount - 1, 1)

    return Math.min(100, Math.round((done / total) * 100))
  })

  const currentStepComplete = computed(() => {
    const record = options.record.value

    if (!record) {
      return false
    }

    return evaluateOnboardingStep(record, currentStep.value.id)
  })

  const completedCount = computed(() => storage.value.completedStepIds.length)

  function persist(patch: Partial<AdminOnboardingStorageState>) {
    storage.value = { ...storage.value, ...patch }
    saveAdminOnboardingState(options.slug.value, storage.value)
  }

  function stripOnboardingQuery() {
    if (!route.query.onboarding) {
      return
    }

    const query = { ...route.query }

    delete query.onboarding
    router.replace({ path: route.path, query })
  }

  function goToStep(index: number) {
    const step = adminOnboardingSteps[index]

    if (!step) {
      return
    }

    stepIndex.value = index
    persist({ currentStepId: step.id, started: true })

    if (syncSidebar && step.section) {
      options.selectSection(step.section)
    }
  }

  function launchWelcome() {
    phase.value = "welcome"
    stepIndex.value = 0
    stripOnboardingQuery()
  }

  function startTour() {
    markStepDone("welcome")
    phase.value = "active"
    persist({ started: true, dismissed: false })
    goToStep(1)
  }

  function markStepDone(stepId: AdminOnboardingStepId) {
    if (!storage.value.completedStepIds.includes(stepId)) {
      persist({
        completedStepIds: [...storage.value.completedStepIds, stepId]
      })
    }
  }

  async function persistDraftIfNeeded() {
    if (!options.saveDraft) {
      return true
    }

    return options.saveDraft()
  }

  async function nextStep() {
    const record = options.record.value

    if (!record || !evaluateOnboardingStep(record, currentStep.value.id)) {
      return false
    }

    if (!(await persistDraftIfNeeded())) {
      return false
    }

    markStepDone(currentStep.value.id)

    if (stepIndex.value >= adminOnboardingSteps.length - 1) {
      await finishTour()
      return true
    }

    goToStep(stepIndex.value + 1)
    return true
  }

  function prevStep() {
    if (stepIndex.value <= 1) {
      phase.value = "welcome"
      stepIndex.value = 0
      return
    }

    goToStep(stepIndex.value - 1)
  }

  function skipTour() {
    /* Parcours obligatoire — pas de fermeture anticipée */
  }

  async function finishTour() {
    if (!(await persistDraftIfNeeded())) {
      return
    }

    markStepDone("finish")
    persist({ completed: true, started: true })
    phase.value = "celebration"
    stripOnboardingQuery()
  }

  async function closeCelebration() {
    await persistDraftIfNeeded()
    phase.value = "hidden"
  }

  /** Réinitialise et rouvre le parcours (bouton Guide ou ?onboarding=1). */
  function reopenTour() {
    autoLaunchDone = false
    persist({
      dismissed: false,
      completed: false,
      started: false,
      currentStepId: null,
      completedStepIds: []
    })
    launchWelcome()
  }

  function resumeTour() {
    const index = adminOnboardingSteps.findIndex(
      (step) => step.id === storage.value.currentStepId
    )

    phase.value = "active"
    goToStep(index >= 1 ? index : 1)
  }

  function tryAutoLaunch() {
    if (!options.record.value) {
      return
    }

    const forced = route.query.onboarding === "1"

    if (forced) {
      reopenTour()
      autoLaunchDone = true
      return
    }

    if (autoLaunchDone) {
      return
    }

    if (storage.value.completed) {
      autoLaunchDone = true
      return
    }

    if (!storage.value.started) {
      launchWelcome()
    } else if (phase.value === "hidden") {
      resumeTour()
    }

    autoLaunchDone = true
  }

  function isOnboardingTargetSection(sectionId: AdminSectionId) {
    return phase.value === "active" && currentStep.value.section === sectionId
  }

  watch(
    () => options.slug.value,
    (slug) => {
      storage.value = loadAdminOnboardingState(slug)
      autoLaunchDone = false
    }
  )

  watch(
    () => route.query.onboarding,
    (value) => {
      if (value === "1" && options.record.value) {
        reopenTour()
      }
    }
  )

  watch(
    () => options.record.value,
    (record) => {
      if (!record) {
        return
      }

      tryAutoLaunch()
    },
    { immediate: true }
  )

  watch(
    () => options.record.value,
    (record) => {
      if (!record || phase.value !== "active") {
        return
      }

      const step = currentStep.value

      if (step.id !== "welcome" && evaluateOnboardingStep(record, step.id)) {
        markStepDone(step.id)
      }
    },
    { deep: true }
  )

  return {
    phase,
    stepIndex,
    currentStep,
    progressPercent,
    currentStepComplete,
    completedCount,
    steps: adminOnboardingSteps,
    totalSteps: adminOnboardingStepCount,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    closeCelebration,
    reopenTour,
    tryAutoLaunch,
    isOnboardingTargetSection,
    launchWelcome
  }
}
