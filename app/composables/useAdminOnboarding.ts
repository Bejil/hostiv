import {
  getAdminOnboardingStepCount,
  getAdminOnboardingSteps,
  evaluateOnboardingStep,
  getFirstIncompleteOnboardingStepIndex,
  isOnboardingRequired,
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
  const { locale } = useHostivLocale()

  const onboardingSteps = computed(() => getAdminOnboardingSteps(locale.value))
  const onboardingStepCount = computed(() => getAdminOnboardingStepCount(locale.value))

  const phase = ref<AdminOnboardingPhase>("hidden")
  const stepIndex = ref(0)
  const storage = ref<AdminOnboardingStorageState>(loadAdminOnboardingState(options.slug.value))
  let autoLaunchDone = false

  const currentStep = computed(
    () => onboardingSteps.value[stepIndex.value] ?? onboardingSteps.value[0]
  )

  const progressPercent = computed(() => {
    const done = storage.value.completedStepIds.length
    const total = Math.max(onboardingStepCount.value - 1, 1)

    return Math.min(100, Math.round((done / total) * 100))
  })

  const currentStepComplete = computed(() => {
    const record = options.record.value

    if (!record) {
      return false
    }

    return evaluateOnboardingStep(record, currentStep.value.id, locale.value)
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
    const step = onboardingSteps.value[index]

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

    if (!record || !evaluateOnboardingStep(record, currentStep.value.id, locale.value)) {
      return false
    }

    if (!(await persistDraftIfNeeded())) {
      return false
    }

    markStepDone(currentStep.value.id)

    if (stepIndex.value >= onboardingSteps.value.length - 1) {
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

  /** Réinitialise et rouvre le parcours (bouton Guide uniquement). */
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
    const record = options.record.value

    if (!record) {
      return
    }

    phase.value = "active"
    goToStep(getFirstIncompleteOnboardingStepIndex(record, locale.value))
  }

  function markOnboardingCompleteIfDone(record: PropertyAdminRecord) {
    if (isOnboardingRequired(record, locale.value)) {
      return false
    }

    persist({ completed: true, started: true, currentStepId: null })

    if (phase.value !== "celebration") {
      phase.value = "hidden"
    }

    return true
  }

  function tryAutoLaunch() {
    const record = options.record.value

    if (!record) {
      return
    }

    // Jamais de fermeture automatique pendant le parcours — uniquement via le bouton d’étape.
    if (phase.value !== "active" && phase.value !== "welcome") {
      if (markOnboardingCompleteIfDone(record)) {
        stripOnboardingQuery()
        autoLaunchDone = true
        return
      }
    }

    const forced = route.query.onboarding === "1"

    if (forced) {
      stripOnboardingQuery()

      if (storage.value.started) {
        resumeTour()
      } else {
        launchWelcome()
      }

      autoLaunchDone = true
      return
    }

    if (autoLaunchDone) {
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
        autoLaunchDone = false
        tryAutoLaunch()
      }
    }
  )

  watch(
    () => options.record.value,
    (record) => {
      if (!record) {
        return
      }

      if (phase.value === "active" || phase.value === "welcome") {
        return
      }

      if (markOnboardingCompleteIfDone(record)) {
        stripOnboardingQuery()
        return
      }

      if (!autoLaunchDone) {
        tryAutoLaunch()
      }
    },
    { immediate: true }
  )

  return {
    phase,
    stepIndex,
    currentStep,
    progressPercent,
    currentStepComplete,
    completedCount,
    steps: onboardingSteps,
    totalSteps: onboardingStepCount,
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
