<script setup lang="ts">
import AdminAccountingNav from "./AdminAccountingNav.vue"
import AdminAccountingPricingBanner from "./AdminAccountingPricingBanner.vue"
import AdminAccountingRevenuePanel from "./AdminAccountingRevenuePanel.vue"
import AdminBookingCancellationPanel from "./AdminBookingCancellationPanel.vue"
import AdminBookingPricingPanel from "./AdminBookingPricingPanel.vue"
import AdminStripeConnectPanel from "./AdminStripeConnectPanel.vue"
import type { BookingRateTabId } from "./AdminBookingConfigForm.vue"
import type { AdminAccountingSectionId } from "../../data/admin-accounting-sections"
import {
  findAdminAccountingSection,
  isAdminAccountingSectionId
} from "../../data/admin-accounting-sections"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import type { StripeConnectStatus } from "../../types/stripe-connect"
import { normalizeBookingConfig } from "../../utils/booking-config"
import {
  isProductionAdminHost,
  stripeConnectNeedsAttention
} from "../../utils/admin-stripe-connect-attention"

const props = defineProps<{
  slug: string
}>()

const ctx = useAdminEditorContext()
const sectionNav = inject(adminSectionNavKey)

if (!sectionNav) {
  throw new Error("AdminPayoutsEditor requires adminSectionNavKey")
}

const route = useRoute()
const router = useRouter()

const status = ref<StripeConnectStatus | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const revenuePanelRef = ref<InstanceType<typeof AdminAccountingRevenuePanel> | null>(null)
const activePricingSection = ref<BookingRateTabId>("night")
const activeAccountingSection = ref<AdminAccountingSectionId>("pricing")

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const activeAccountingMeta = computed(() =>
  findAdminAccountingSection(activeAccountingSection.value, locale.value)
)

const activeDetailTitle = computed(() => activeAccountingMeta.value.title)

const activeDetailLead = computed(() => activeAccountingMeta.value.lead)

const revenueLoading = computed(() => revenuePanelRef.value?.loading ?? false)

const bookingConfig = computed(() => normalizeBookingConfig(ctx.record.value.booking_config))

const isProductionHost = computed(() => isProductionAdminHost())

const stripeBannerNeedsAttention = computed(() => {
  if (loading.value) {
    return false
  }

  return stripeConnectNeedsAttention(status.value, {
    hasLoadError: Boolean(error.value),
    isProductionHost: isProductionHost.value
  })
})

const paymentsNavDescription = computed(() => {
  if (loading.value) {
    return ext.value.accounting.paymentsNav.verifying
  }

  if (status.value?.paymentsReady) {
    return ext.value.accounting.paymentsNav.paymentsActive
  }

  if (stripeBannerNeedsAttention.value) {
    return ext.value.accounting.paymentsNav.setupIncomplete
  }

  return ext.value.accounting.paymentsNav.stripeConnect
})

function syncAccountingSectionQuery(section: AdminAccountingSectionId) {
  const query = { ...route.query, section: "payouts", accounting: section }

  router.replace({ path: route.path, query })
}

function applyAccountingSectionFromRoute() {
  const raw = route.query.accounting
  const id = (Array.isArray(raw) ? raw[0] : raw) ?? ""

  if (isAdminAccountingSectionId(id)) {
    activeAccountingSection.value = id
  }
}

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
      ext.value.accounting.stripeErrors.load
    status.value = null
  } finally {
    loading.value = false
    sectionNav.updateStripeConnectStatus(status.value, { loadError: Boolean(error.value) })
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
      ext.value.accounting.stripeErrors.onboard
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
      ext.value.accounting.stripeErrors.dashboard
  } finally {
    actionLoading.value = false
  }
}

function clearStripeQuery() {
  const query = { ...route.query }

  delete query.stripe
  router.replace({ path: route.path, query })
}

function selectPricingSection(section: BookingRateTabId) {
  activePricingSection.value = section
}

function selectAccountingSection(section: AdminAccountingSectionId) {
  activeAccountingSection.value = section
  syncAccountingSectionQuery(section)

  if (section === "revenue") {
    void revenuePanelRef.value?.refresh()
  }
}

watch(activeAccountingSection, (section) => {
  if (section === "revenue") {
    void revenuePanelRef.value?.refresh()
  }
})

onMounted(async () => {
  const stripeQuery = route.query.stripe

  if (stripeQuery === "return" || stripeQuery === "refresh") {
    activeAccountingSection.value = "payments"
    syncAccountingSectionQuery("payments")
    actionMessage.value =
      stripeQuery === "return"
        ? ext.value.accounting.stripeReturn.returnPending
        : ext.value.accounting.stripeReturn.refreshPending
    clearStripeQuery()
  }

  await loadStatus()

  if (stripeQuery === "return" || stripeQuery === "refresh") {
    actionMessage.value = status.value?.paymentsReady
      ? ext.value.accounting.stripeReturn.ready
      : ext.value.accounting.stripeReturn.incomplete
  }

  applyAccountingSectionFromRoute()
})

watch(
  () => route.query.accounting,
  () => {
    applyAccountingSectionFromRoute()
  }
)

watch(
  () => props.slug,
  () => {
    void loadStatus()
  }
)
</script>

<template>
  <div class="admin-accounting admin-gallery-editor">
    <div class="admin-gallery-editor__layout">
      <AdminAccountingNav
        :active-section="activeAccountingSection"
        :payments-nav-description="paymentsNavDescription"
        @select="selectAccountingSection"
      />

      <main class="admin-gallery-editor__main">
        <article class="admin-gallery-editor__detail">
          <header class="admin-gallery-editor__detail-head">
            <div class="admin-gallery-editor__detail-copy">
              <h3>{{ activeDetailTitle }}</h3>
              <p class="admin-gallery-editor__detail-hint">
                {{ activeDetailLead }}
              </p>
            </div>

            <button
              v-if="activeAccountingSection === 'revenue'"
              type="button"
              class="admin-btn admin-btn--secondary admin-btn--sm"
              :disabled="revenueLoading"
              @click="revenuePanelRef?.refresh()"
            >
              {{ revenueLoading ? ui.common.loading : ext.accounting.refresh }}
            </button>

            <button
              v-else-if="activeAccountingSection === 'payments'"
              type="button"
              class="admin-btn admin-btn--secondary admin-btn--sm"
              :disabled="loading || actionLoading"
              @click="loadStatus"
            >
              {{ loading ? ui.common.loading : ext.accounting.refresh }}
            </button>
          </header>

          <template v-if="activeAccountingSection === 'pricing'">
            <div class="admin-accounting__pricing-stack">
              <div class="admin-accounting__pricing-card">
                <AdminAccountingPricingBanner
                  :config="bookingConfig"
                  :active-section="activePricingSection"
                  @configure="selectPricingSection"
                />

                <div class="admin-accounting__pricing-card__body">
                  <AdminBookingPricingPanel
                    :model-value="bookingConfig"
                    :section="activePricingSection"
                    @update:model-value="ctx.patch({ booking_config: $event })"
                  />
                </div>
              </div>

              <AdminBookingCancellationPanel
                :model-value="bookingConfig"
                @update:model-value="ctx.patch({ booking_config: $event })"
              />
            </div>
          </template>

          <AdminAccountingRevenuePanel
            v-else-if="activeAccountingSection === 'revenue'"
            ref="revenuePanelRef"
            :slug="slug"
            :platform-fee-percent="status?.platformFeePercent ?? 0"
          />

          <AdminStripeConnectPanel
            v-else
            :status="status"
            :loading="loading"
            :action-loading="actionLoading"
            :error="error"
            :action-message="actionMessage"
            @refresh="loadStatus"
            @start-onboarding="startOnboarding"
            @open-dashboard="openDashboard"
          />
        </article>
      </main>
    </div>
  </div>
</template>
