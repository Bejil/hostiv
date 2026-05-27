<script setup lang="ts">
import AdminAlert from "./AdminAlert.vue"
import AdminIcon from "./AdminIcon.vue"
import type { StripeConnectStatus } from "../../types/stripe-connect"

const props = defineProps<{
  slug: string
}>()

const route = useRoute()
const router = useRouter()

const status = ref<StripeConnectStatus | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const actionMessage = ref<string | null>(null)

const statusLabel = computed(() => {
  if (!status.value?.accountId) {
    return "Non configuré"
  }

  if (status.value.paymentsReady) {
    return "Paiements actifs"
  }

  if (status.value.detailsSubmitted) {
    return "Vérification en cours"
  }

  return "Configuration à terminer"
})

const statusVariant = computed(() => {
  if (status.value?.paymentsReady) {
    return "success"
  }

  if (status.value?.accountId) {
    return "info"
  }

  return "error"
})

const isProductionHost = computed(() => {
  if (import.meta.server) {
    return false
  }

  const host = window.location.hostname

  return host !== "localhost" && host !== "127.0.0.1"
})

const showTestKeysWarning = computed(
  () => isProductionHost.value && status.value?.connectKeyMode === "test"
)

const connectModeMismatchMessage =
  "Votre compte Stripe Connect a été créé en mode test. Les clés de production (Live) ne peuvent pas l’utiliser : cliquez sur « Connecter mon compte Stripe » pour refaire l’onboarding en mode réel."

const testKeysWarningMessage =
  "Les clés Stripe du serveur sont encore en mode test (sk_test_). Sur Vercel, utilisez STRIPE_SECRET_KEY et NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en sk_live_ / pk_live_, puis redéployez."

const pendingRequirements = computed(() => {
  const requirements = status.value?.requirements

  if (!requirements) {
    return []
  }

  return [
    ...requirements.pastDue,
    ...requirements.currentlyDue,
    ...requirements.eventuallyDue
  ].filter((value, index, list) => list.indexOf(value) === index)
})

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function loadStatus() {
  loading.value = true
  error.value = null

  try {
    const headers = await authHeaders()

    status.value = await $fetch<StripeConnectStatus>(`/api/admin/${props.slug}/stripe-connect`, {
      headers
    })
  } catch (err: unknown) {
    const e = err as {
      data?: { message?: string; statusMessage?: string }
      statusMessage?: string
      message?: string
    }

    error.value =
      e.data?.message ||
      e.data?.statusMessage ||
      e.statusMessage ||
      e.message ||
      "Impossible de charger le statut Stripe."
    status.value = null
  } finally {
    loading.value = false
  }
}

async function startOnboarding() {
  actionLoading.value = true
  actionMessage.value = null
  error.value = null

  try {
    const headers = await authHeaders()
    const { url } = await $fetch<{ url: string }>(
      `/api/admin/${props.slug}/stripe-connect/onboard`,
      { method: "POST", headers }
    )

    window.location.assign(url)
  } catch (err: unknown) {
    const e = err as {
      data?: { message?: string; statusMessage?: string }
      statusMessage?: string
      message?: string
    }

    error.value =
      e.data?.message ||
      e.data?.statusMessage ||
      e.statusMessage ||
      e.message ||
      "Impossible d’ouvrir l’onboarding Stripe."
  } finally {
    actionLoading.value = false
  }
}

async function openDashboard() {
  actionLoading.value = true
  actionMessage.value = null
  error.value = null

  try {
    const headers = await authHeaders()
    const { url } = await $fetch<{ url: string }>(
      `/api/admin/${props.slug}/stripe-connect/dashboard`,
      { method: "POST", headers }
    )

    window.open(url, "_blank", "noopener,noreferrer")
  } catch (err: unknown) {
    const e = err as {
      data?: { message?: string; statusMessage?: string }
      statusMessage?: string
      message?: string
    }

    error.value =
      e.data?.message ||
      e.data?.statusMessage ||
      e.statusMessage ||
      e.message ||
      "Impossible d’ouvrir le tableau de bord Stripe."
  } finally {
    actionLoading.value = false
  }
}

function clearStripeQuery() {
  const query = { ...route.query }

  delete query.stripe
  router.replace({ path: route.path, query })
}

onMounted(async () => {
  const stripeQuery = route.query.stripe

  if (stripeQuery === "return" || stripeQuery === "refresh") {
    actionMessage.value =
      stripeQuery === "return"
        ? "Retour depuis Stripe. Actualisation du statut…"
        : "Reprise de la configuration Stripe…"
    clearStripeQuery()
  }

  await loadStatus()

  if (stripeQuery === "return" || stripeQuery === "refresh") {
    actionMessage.value = status.value?.paymentsReady
      ? "Votre compte est prêt à recevoir les paiements."
      : "Configuration enregistrée. Terminez les étapes indiquées par Stripe si nécessaire."
  }
})

watch(
  () => props.slug,
  () => {
    void loadStatus()
  }
)
</script>

<template>
  <div class="admin-payouts">
    <div class="admin-subpanel admin-general-card admin-payouts__card">
      <div class="admin-subpanel__head admin-general-card__head">
        <div>
          <p class="admin-general-card__kicker">Stripe Connect</p>
          <h3>Versements</h3>
        </div>
        <p class="admin-general-card__hint">
          Connectez un compte Stripe Express pour recevoir les paiements des réservations directement
          sur votre compte bancaire.
        </p>
      </div>

      <AdminAlert v-if="error" variant="error" :message="error" />
      <AdminAlert v-else-if="actionMessage && !status" variant="success" :message="actionMessage" />

      <p v-if="loading" class="admin-payouts__loading">Chargement du statut…</p>

      <template v-else-if="status">
        <AdminAlert
          v-if="showTestKeysWarning"
          variant="error"
          :message="testKeysWarningMessage"
        />
        <AdminAlert
          v-else-if="status.connectModeMismatch"
          variant="info"
          :message="connectModeMismatchMessage"
        />
        <AdminAlert v-else-if="actionMessage" variant="success" :message="actionMessage" />

        <div class="admin-payouts__status-row">
          <span class="admin-payouts__badge" :class="`admin-payouts__badge--${statusVariant}`">
            {{ statusLabel }}
          </span>
          <span v-if="status.accountId" class="admin-payouts__account-id">
            {{ status.accountId }}
          </span>
        </div>

        <ul class="admin-payouts__facts">
          <li>
            <strong>Paiements carte</strong>
            {{ status.chargesEnabled ? "Activés" : "En attente" }}
          </li>
          <li>
            <strong>Virements bancaires</strong>
            {{ status.payoutsEnabled ? "Activés" : "En attente" }}
          </li>
          <li v-if="status.platformFeePercent > 0">
            <strong>Commission plateforme</strong>
            {{ status.platformFeePercent }}&nbsp;% par réservation
          </li>
          <li v-if="status.onboardingCompletedAt">
            <strong>Activé le</strong>
            {{
              new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short"
              }).format(new Date(status.onboardingCompletedAt))
            }}
          </li>
        </ul>

        <AdminAlert
          v-if="!status.paymentsReady"
          variant="info"
          message="Les voyageurs ne pourront pas payer par carte tant que Stripe n’a pas validé votre compte. Les demandes sans paiement en ligne restent possibles si vous les gérez autrement."
        />

        <div v-if="pendingRequirements.length" class="admin-payouts__requirements">
          <p class="admin-payouts__requirements-title">Informations demandées par Stripe</p>
          <ul>
            <li v-for="item in pendingRequirements" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="status.requirements.disabledReason" class="admin-payouts__requirements">
          <p class="admin-payouts__requirements-title">Compte restreint</p>
          <p>{{ status.requirements.disabledReason }}</p>
        </div>

        <div class="admin-payouts__actions">
          <button
            type="button"
            class="admin-btn admin-btn--primary"
            :disabled="actionLoading"
            @click="startOnboarding"
          >
            <AdminIcon name="external" :size="16" />
            {{
              status.accountId ? "Reprendre la configuration Stripe" : "Connecter mon compte Stripe"
            }}
          </button>

          <button
            v-if="status.accountId"
            type="button"
            class="admin-btn admin-btn--ghost"
            :disabled="actionLoading"
            @click="openDashboard"
          >
            <AdminIcon name="external" :size="16" />
            Tableau de bord Stripe
          </button>

          <button
            type="button"
            class="admin-btn admin-btn--ghost"
            :disabled="loading || actionLoading"
            @click="loadStatus"
          >
            Actualiser
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
