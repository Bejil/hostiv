<script setup lang="ts">
import type { HostivAccountSubscriptionsPayload } from "../../types/hostiv-account-subscriptions"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import AdminAlert from "./AdminAlert.vue"
import AdminGeneralSubscriptionCard from "./AdminGeneralSubscriptionCard.vue"

const props = defineProps<{
  slug: string
}>()

const { ui, formatDate, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.account.plans)

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<HostivAccountSubscriptionsPayload | null>(null)

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

function checkoutTypeLabel(checkoutType: string) {
  const labels = ext.value.checkoutTypes

  if (checkoutType === "hostiv_signup") {
    return labels.hostiv_signup
  }

  if (checkoutType === "hostiv_premium_tools") {
    return labels.hostiv_premium_tools
  }

  return labels.hostiv_subscription
}

function formatPaymentAmount(amountEur: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase() || "EUR"

  return new Intl.NumberFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: normalizedCurrency
  }).format(amountEur)
}

function formatPropertySlug(slug: string | null) {
  if (!slug) {
    return "—"
  }

  return `/${slug}`
}

async function loadSubscriptions() {
  loading.value = true
  error.value = null

  try {
    const headers = await authHeaders()

    data.value = await $fetch<HostivAccountSubscriptionsPayload>(
      `/api/admin/${props.slug}/account/subscriptions`,
      { headers }
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.loadFailed
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadSubscriptions()
})

watch(
  () => props.slug,
  () => {
    void loadSubscriptions()
  }
)
</script>

<template>
  <div class="admin-account-plans admin-subpanel">
    <p v-if="loading" class="admin-account__loading">{{ ext.loading }}</p>

    <AdminAlert v-else-if="error" variant="error" :message="error" />

    <template v-else-if="data">
      <section class="admin-account-plans__properties" aria-labelledby="admin-account-plans-properties-title">
        <header class="admin-account-plans__section-head">
          <div>
            <h3 id="admin-account-plans-properties-title">{{ ext.propertiesTitle }}</h3>
            <p class="admin-account__lead">{{ ext.propertiesLead }}</p>
          </div>
        </header>

        <div class="admin-account-plans__property-list">
          <article
            v-for="property in data.properties"
            :key="property.slug"
            class="admin-account-plans__property"
          >
            <header class="admin-account-plans__property-head">
              <div class="admin-account-plans__property-copy">
                <h4 class="admin-account-plans__property-name">
                  {{ property.brand_name }}
                  <span class="admin-account-plans__property-slug">/{{ property.slug }}</span>
                </h4>
              </div>

              <div class="admin-account-plans__property-badges">
                <span
                  v-if="property.slug === slug"
                  class="admin-account-plans__badge admin-account-plans__badge--current"
                >
                  {{ ext.currentPropertyBadge }}
                </span>
                <span
                  v-if="!property.published"
                  class="admin-account-plans__badge admin-account-plans__badge--muted"
                >
                  {{ ext.unpublishedBadge }}
                </span>
              </div>
            </header>

            <AdminGeneralSubscriptionCard
              compact
              :slug="property.slug"
              :access="property.access"
            />
          </article>
        </div>
      </section>

      <section class="admin-account-plans__payments" aria-labelledby="admin-account-plans-payments-title">
        <header class="admin-account-plans__section-head">
          <div>
            <h3 id="admin-account-plans-payments-title">{{ ext.paymentsTitle }}</h3>
            <p class="admin-account__lead">{{ ext.paymentsLead }}</p>
          </div>
        </header>

        <p v-if="!data.payments.length" class="admin-account-plans__empty">
          {{ ext.paymentsEmpty }}
        </p>

        <ul v-else class="admin-account-plans__payment-list">
          <li
            v-for="payment in data.payments"
            :key="payment.id"
            class="admin-account-plans__payment"
          >
            <div class="admin-account-plans__payment-main">
              <p class="admin-account-plans__payment-product">{{ payment.product_label }}</p>
              <p class="admin-account-plans__payment-meta">
                <span>{{ checkoutTypeLabel(payment.checkout_type) }}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {{
                    formatDate(payment.paid_at, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })
                  }}
                </span>
              </p>
            </div>

            <div class="admin-account-plans__payment-side">
              <p class="admin-account-plans__payment-amount">
                {{ formatPaymentAmount(payment.amount_eur, payment.currency) }}
              </p>
              <p class="admin-account-plans__payment-property">
                {{ formatPropertySlug(payment.property_slug) }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
