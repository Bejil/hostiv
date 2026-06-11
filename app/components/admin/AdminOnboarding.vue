<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, PartyPopper, Rocket, Sparkles } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import {
  getAdminOnboardingSteps,
  getOnboardingStepMissingLabels
} from "../../data/admin-onboarding-steps"
import type { AdminSectionId } from "../../data/admin-nav-sections"
import type { PropertyAdminRecord } from "../../types/property-admin"
import { useAdminOnboarding } from "../../composables/useAdminOnboarding"
import AdminAlert from "./AdminAlert.vue"
import AdminOnboardingStepFields from "./AdminOnboardingStepFields.vue"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
  selectSection: (id: AdminSectionId) => void
  saveDraft?: () => Promise<boolean>
  saveError?: string | null
}>()

const recordRef = computed(() => props.record)
const stepSaving = ref(false)
const { ui, locale } = useAdminUi()

const onboardingSteps = computed(() => getAdminOnboardingSteps(locale.value))

const {
  phase,
  stepIndex,
  currentStep,
  progressPercent,
  currentStepComplete,
  completedCount,
  startTour,
  nextStep,
  prevStep,
  closeCelebration,
  reopenTour,
  tryAutoLaunch
} = useAdminOnboarding({
  slug: computed(() => props.slug),
  record: recordRef,
  selectSection: props.selectSection,
  syncSidebar: false,
  saveDraft: props.saveDraft
})

const progressSteps = computed(() =>
  onboardingSteps.value.filter((step) => step.id !== "welcome")
)
const displayStepTotal = computed(() => progressSteps.value.length)

const displayStepNumber = computed(() => {
  if (phase.value === "welcome") {
    return 0
  }

  if (phase.value === "celebration") {
    return displayStepTotal.value
  }

  return Math.max(stepIndex.value, 1)
})

const progressLabelText = computed(() => {
  if (phase.value === "welcome") {
    return ui.value.onboardingUi.progressWelcome
  }

  if (phase.value === "celebration") {
    return ui.value.onboardingUi.progressDone
  }

  return adminUiFormat(ui.value.onboardingUi.progressStep, {
    current: String(displayStepNumber.value),
    total: String(displayStepTotal.value)
  })
})

const modalOpen = computed(() => phase.value !== "hidden")

const showStepFields = computed(
  () =>
    phase.value === "active" &&
    currentStep.value.id !== "welcome" &&
    currentStep.value.id !== "finish"
)

const isFinishStep = computed(() => phase.value === "active" && currentStep.value.id === "finish")

function isStepDotComplete(index: number) {
  const step = progressSteps.value[index]

  return step
    ? getOnboardingStepMissingLabels(props.record, step.id, locale.value).length === 0
    : false
}

function isStepDotCurrent(index: number) {
  if (phase.value !== "active") {
    return false
  }

  return stepIndex.value === index + 1
}

async function onPrimaryAction() {
  if (phase.value === "welcome") {
    startTour()
    return
  }

  if (!currentStepComplete.value || stepSaving.value) {
    return
  }

  stepSaving.value = true

  try {
    await nextStep()
  } finally {
    stepSaving.value = false
  }
}

async function onCloseCelebration() {
  if (stepSaving.value) {
    return
  }

  stepSaving.value = true

  try {
    await closeCelebration()
  } finally {
    stepSaving.value = false
  }
}

watch(modalOpen, (open) => {
  if (import.meta.server) {
    return
  }

  document.body.style.overflow = open ? "hidden" : ""
})

function onKeydown(event: KeyboardEvent) {
  if (!modalOpen.value || phase.value === "celebration") {
    return
  }

  if (event.key === "Escape") {
    event.preventDefault()
  }
}

onMounted(() => {
  tryAutoLaunch()

  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
    window.removeEventListener("keydown", onKeydown)
  }
})

defineExpose({
  reopenTour,
  tryAutoLaunch
})
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-onboarding-fade">
      <div
        v-if="modalOpen"
        class="admin-onboarding-overlay admin-onboarding-overlay--locked"
        role="presentation"
      >
        <div
          class="admin-onboarding-wizard"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`admin-onboarding-title-${currentStep.id}`"
        >
          <header class="admin-onboarding-wizard__head">
            <div class="admin-onboarding-wizard__progress-wrap">
              <p class="admin-onboarding-wizard__kicker">{{ progressLabelText }}</p>
              <div
                class="admin-onboarding-wizard__progress"
                role="progressbar"
                :aria-valuenow="progressPercent"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="admin-onboarding-wizard__progress-fill"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
              <div
                v-if="phase === 'active' || phase === 'celebration'"
                class="admin-onboarding-wizard__dots"
                aria-hidden="true"
              >
                <span
                  v-for="(step, index) in progressSteps"
                  :key="step.id"
                  class="admin-onboarding-wizard__dot"
                  :class="{
                    'admin-onboarding-wizard__dot--current': isStepDotCurrent(index),
                    'admin-onboarding-wizard__dot--done':
                      isStepDotComplete(index) && !isStepDotCurrent(index)
                  }"
                />
              </div>
            </div>
          </header>

          <div class="admin-onboarding-wizard__body">
            <Transition name="admin-onboarding-panel" mode="out-in">
              <div
                v-if="phase === 'welcome'"
                key="welcome"
                class="admin-onboarding-wizard__intro"
              >
                <div class="admin-onboarding-wizard__badge">
                  <Sparkles :size="20" />
                  <span>{{ ui.onboardingUi.badge }}</span>
                </div>
                <h2
                  id="admin-onboarding-title-welcome"
                  class="admin-onboarding-wizard__title"
                >
                  {{ ui.onboardingUi.welcomeTitle }}
                </h2>
                <p class="admin-onboarding-wizard__lead">
                  {{
                    adminUiFormat(ui.onboardingUi.welcomeLead, {
                      total: String(displayStepTotal.value)
                    })
                  }}
                </p>
                <ul class="admin-onboarding-wizard__highlights">
                  <li><Check :size="15" /> <span>{{ ui.onboardingUi.highlightForms }}</span></li>
                  <li><Check :size="15" /> <span>{{ ui.onboardingUi.highlightValidation }}</span></li>
                  <li><Check :size="15" /> <span>{{ ui.onboardingUi.highlightRequired }}</span></li>
                </ul>
              </div>

              <div
                v-else-if="phase === 'celebration'"
                key="celebration"
                class="admin-onboarding-wizard__intro admin-onboarding-wizard__intro--center"
              >
                <div class="admin-onboarding-wizard__celebration-icon" aria-hidden="true">
                  <PartyPopper :size="34" />
                </div>
                <h2 id="admin-onboarding-title-done" class="admin-onboarding-wizard__title">
                  {{ ui.onboardingUi.celebrationTitle }}
                </h2>
                <p class="admin-onboarding-wizard__lead">
                  {{
                    adminUiFormat(ui.onboardingUi.celebrationLead, {
                      total: String(displayStepTotal.value)
                    })
                  }}
                </p>
              </div>

              <div v-else key="active" class="admin-onboarding-wizard__step">
                <div class="admin-onboarding-wizard__step-head">
                  <h2
                    :id="`admin-onboarding-title-${currentStep.id}`"
                    class="admin-onboarding-wizard__title"
                  >
                    {{ currentStep.title }}
                  </h2>
                  <p class="admin-onboarding-wizard__lead">{{ currentStep.subtitle }}</p>
                </div>

                <AdminOnboardingStepFields
                  v-if="showStepFields || isFinishStep"
                  :step-id="currentStep.id"
                />

                <AdminAlert
                  v-if="saveError"
                  variant="error"
                  class="admin-onboarding-wizard__save-error"
                  :message="saveError"
                />
              </div>
            </Transition>
          </div>

          <footer class="admin-onboarding-wizard__foot">
            <button
              v-if="phase === 'active' && stepIndex > 1"
              type="button"
              class="admin-btn admin-btn--ghost"
              @click="prevStep"
            >
              <ArrowLeft :size="16" />
              {{ ui.onboardingUi.previous }}
            </button>

            <div class="admin-onboarding-wizard__foot-spacer" />

            <button
              v-if="phase === 'welcome'"
              type="button"
              class="admin-btn admin-btn--primary"
              @click="startTour"
            >
              <Rocket :size="17" />
              {{ ui.onboardingUi.start }}
            </button>

            <button
              v-else-if="phase === 'celebration'"
              type="button"
              class="admin-btn admin-btn--primary"
              :disabled="stepSaving"
              @click="onCloseCelebration"
            >
              {{ stepSaving ? ui.common.saving : ui.onboardingUi.openBackoffice }}
            </button>

            <button
              v-else-if="phase === 'active'"
              type="button"
              class="admin-btn admin-btn--primary"
              :disabled="!currentStepComplete || stepSaving"
              @click="onPrimaryAction"
            >
              {{
                stepSaving
                  ? ui.common.saving
                  : currentStep.id === "finish"
                    ? ui.onboardingUi.finishTour
                    : ui.onboardingUi.nextStep
              }}
              <ArrowRight :size="16" />
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
