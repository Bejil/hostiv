<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import AdminAlert from "./AdminAlert.vue"
import AdminIcon from "./AdminIcon.vue"
import type { StripeConnectStatus } from "../../types/stripe-connect"
import { labelStripeRequirements } from "../../utils/stripe-requirement-labels"

const props = defineProps<{
  status: StripeConnectStatus | null
  loading: boolean
  actionLoading: boolean
  error: string | null
  actionMessage: string | null
}>()

const emit = defineEmits<{
  refresh: []
  "start-onboarding": []
  "open-dashboard": []
}>()

const { ui, locale, formatDate } = useAdminUi()
const ext = computed(() => ui.value.extended)

const isProductionHost = computed(() => {
  if (import.meta.server) {
    return false
  }

  const host = window.location.hostname

  return host !== "localhost" && host !== "127.0.0.1"
})

const statusLabel = computed(() => {
  if (!props.status?.accountId) {
    return ext.value.stripeConnect.status.notConfigured
  }

  if (props.status.paymentsReady) {
    return ext.value.stripeConnect.status.paymentsActive
  }

  if (props.status.detailsSubmitted) {
    return ext.value.stripeConnect.status.verificationPending
  }

  return ext.value.stripeConnect.status.setupIncomplete
})

const statusVariant = computed(() => {
  if (props.status?.paymentsReady) {
    return "success"
  }

  if (props.status?.accountId) {
    return "info"
  }

  return "error"
})

const showTestKeysWarning = computed(
  () => isProductionHost.value && props.status?.connectKeyMode === "test"
)

const pendingRequirements = computed(() => {
  const requirements = props.status?.requirements

  if (!requirements) {
    return []
  }

  const keys = [
    ...requirements.pastDue,
    ...requirements.currentlyDue,
    ...requirements.eventuallyDue
  ].filter((value, index, list) => list.indexOf(value) === index)

  return labelStripeRequirements(keys, locale.value)
})

const setupSteps = computed(() => {
  const current = props.status

  if (!current) {
    return []
  }

  return [
    {
      id: "account",
      label: ext.value.stripeConnect.steps.account,
      done: Boolean(current.accountId)
    },
    {
      id: "identity",
      label: ext.value.stripeConnect.steps.identity,
      done: current.detailsSubmitted
    },
    {
      id: "charges",
      label: ext.value.stripeConnect.steps.charges,
      done: current.chargesEnabled
    },
    {
      id: "payouts",
      label: ext.value.stripeConnect.steps.payouts,
      done: current.payoutsEnabled
    }
  ]
})

const completedSteps = computed(
  () => setupSteps.value.filter((step) => step.done).length
)

const onboardingProgress = computed(() => {
  if (!setupSteps.value.length) {
    return 0
  }

  return Math.round((completedSteps.value / setupSteps.value.length) * 100)
})

const formattedOnboardingDate = computed(() => {
  if (!props.status?.onboardingCompletedAt) {
    return null
  }

  return formatDate(props.status.onboardingCompletedAt, {
    dateStyle: "medium",
    timeStyle: "short"
  })
})

const platformFeeLabel = computed(() =>
  props.status?.platformFeePercent
    ? adminUiFormat(ext.value.stripeConnect.meta.platformFeeValue, {
        percent: props.status.platformFeePercent
      })
    : ""
)
</script>

<template>
  <div class="admin-stripe-connect-panel">
    <AdminAlert v-if="error" variant="error" :message="error" />
    <AdminAlert v-else-if="actionMessage && !status" variant="success" :message="actionMessage" />

    <p v-if="loading" class="admin-accounting__loading">{{ ext.stripeConnect.loading }}</p>

    <template v-else-if="status">
      <AdminAlert
        v-if="showTestKeysWarning"
        variant="error"
        :message="ext.stripeConnect.alerts.testKeysWarning"
      />
      <AdminAlert
        v-else-if="status.connectModeMismatch"
        variant="info"
        :message="ext.stripeConnect.alerts.connectModeMismatch"
      />
      <AdminAlert v-else-if="actionMessage" variant="success" :message="actionMessage" />

      <div class="admin-accounting__status-card">
        <div class="admin-accounting__status-top">
          <span
            class="admin-accounting__badge"
            :class="`admin-accounting__badge--${statusVariant}`"
          >
            {{ statusLabel }}
          </span>
          <span v-if="status.accountId" class="admin-accounting__account-id" :title="status.accountId">
            {{ status.accountId }}
          </span>
        </div>

        <div v-if="!status.paymentsReady" class="admin-accounting__progress">
          <div class="admin-accounting__progress-head">
            <span>{{ ext.stripeConnect.progressLabel }}</span>
            <strong>{{ completedSteps }}/{{ setupSteps.length }}</strong>
          </div>
          <div
            class="admin-accounting__progress-bar"
            role="progressbar"
            :aria-valuenow="onboardingProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span
              class="admin-accounting__progress-fill"
              :style="{ width: `${onboardingProgress}%` }"
            />
          </div>
        </div>

        <p v-else class="admin-accounting__ready-note">
          {{ ext.stripeConnect.readyNote }}
        </p>

        <ol v-if="!status.paymentsReady" class="admin-accounting__steps">
          <li
            v-for="step in setupSteps"
            :key="step.id"
            class="admin-accounting__step"
            :class="{ 'admin-accounting__step--done': step.done }"
          >
            <span class="admin-accounting__step-icon" aria-hidden="true">
              <AdminIcon v-if="step.done" name="check" :size="14" />
              <span v-else>·</span>
            </span>
            <span>{{ step.label }}</span>
          </li>
        </ol>

        <dl v-if="status.platformFeePercent > 0 || formattedOnboardingDate" class="admin-accounting__meta">
          <div v-if="status.platformFeePercent > 0">
            <dt>{{ ext.stripeConnect.meta.platformFee }}</dt>
            <dd>{{ platformFeeLabel }}</dd>
          </div>
          <div v-if="formattedOnboardingDate">
            <dt>{{ ext.stripeConnect.meta.activatedOn }}</dt>
            <dd>{{ formattedOnboardingDate }}</dd>
          </div>
        </dl>
      </div>

      <AdminAlert
        v-if="!status.paymentsReady"
        variant="info"
        :message="ext.stripeConnect.alerts.paymentsBlocked"
      />

      <footer class="admin-stripe-connect-panel__footer">
        <button
          v-if="!status.paymentsReady"
          type="button"
          class="hostiv-btn hostiv-btn--primary"
          :disabled="actionLoading"
          @click="emit('start-onboarding')"
        >
          <AdminIcon name="external" :size="16" />
          {{
            status.accountId ? ext.stripeConnect.cta.resume : ext.stripeConnect.cta.connect
          }}
        </button>

        <button
          v-if="status.accountId"
          type="button"
          class="hostiv-btn"
          :class="status.paymentsReady ? 'hostiv-btn--primary' : 'hostiv-btn--secondary'"
          :disabled="actionLoading"
          @click="emit('open-dashboard')"
        >
          <AdminIcon name="external" :size="16" />
          {{ ext.stripeConnect.cta.dashboard }}
        </button>
      </footer>

      <details v-if="pendingRequirements.length" class="admin-accounting__requirements">
        <summary class="admin-accounting__requirements-summary">
          <span class="admin-accounting__requirements-title">
            {{ ext.stripeConnect.requirements.title }}
            <span class="admin-accounting__requirements-meta">({{ pendingRequirements.length }})</span>
          </span>
          <ChevronDown
            class="admin-accounting__requirements-chevron"
            :size="16"
            stroke-width="2"
            aria-hidden="true"
          />
        </summary>
        <ul>
          <li v-for="item in pendingRequirements" :key="item">{{ item }}</li>
        </ul>
      </details>

      <details
        v-if="status.requirements.disabledReason"
        class="admin-accounting__requirements admin-accounting__requirements--warning"
      >
        <summary class="admin-accounting__requirements-summary">
          <span class="admin-accounting__requirements-title">{{ ext.stripeConnect.requirements.accountRestricted }}</span>
          <ChevronDown
            class="admin-accounting__requirements-chevron"
            :size="16"
            stroke-width="2"
            aria-hidden="true"
          />
        </summary>
        <p>{{ status.requirements.disabledReason }}</p>
      </details>
    </template>

    <div v-else class="admin-accounting__status-card">
      <div class="admin-accounting__status-top">
        <span class="admin-accounting__badge admin-accounting__badge--error">
          {{ ext.stripeConnect.status.notConfigured }}
        </span>
      </div>
      <footer class="admin-stripe-connect-panel__footer">
        <button
          type="button"
          class="hostiv-btn hostiv-btn--primary"
          :disabled="actionLoading"
          @click="emit('start-onboarding')"
        >
          <AdminIcon name="external" :size="16" />
          {{ ext.stripeConnect.cta.connect }}
        </button>
      </footer>
    </div>
  </div>
</template>
