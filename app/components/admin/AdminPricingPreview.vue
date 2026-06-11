<script setup lang="ts">
import { computed } from "vue"
import type { PropertyBookingConfig } from "../../types/property-site"
import { formatCancellationRefundPolicy } from "../../utils/cancellation-policy"
import { buildPricingDisplayCards } from "../../utils/pricing-display-cards"

const props = defineProps<{
  bookingConfig: PropertyBookingConfig
  eyebrow: string
  title: string
  intro: string
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const displayEyebrow = computed(
  () => props.eyebrow.trim() || ext.value.pricingPreview.fallback.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ext.value.pricingPreview.fallback.title
)
const displayIntro = computed(
  () => props.intro.trim() || ext.value.pricingPreview.fallback.intro
)

const pricingCards = computed(() =>
  buildPricingDisplayCards(props.bookingConfig, locale.value)
)

const cancellationText = computed(() =>
  formatCancellationRefundPolicy(props.bookingConfig, locale.value)
)
</script>

<template>
  <div class="admin-pricing-preview" :aria-label="ext.pricingPreview.ariaLabel">
    <p class="admin-pricing-preview__label">{{ ext.pricingPreview.label }}</p>
    <section class="admin-pricing-preview__section">
      <div class="admin-pricing-preview__head">
        <p class="admin-pricing-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-pricing-preview__head-row">
          <h2 class="admin-pricing-preview__title">{{ displayTitle }}</h2>
          <p class="admin-pricing-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <div class="admin-pricing-preview__grid">
        <article
          v-for="card in pricingCards"
          :key="card.title"
          class="admin-pricing-preview__card"
        >
          <span class="admin-pricing-preview__icon" aria-hidden="true">
            <svg
              v-if="card.icon === 'night'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <svg
              v-else-if="card.icon === 'week'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
            </svg>
            <svg
              v-else-if="card.icon === 'month'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 2v4M16 2v4M3 10h18" />
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M7 15h2M11 15h2M15 15h2M7 19h2M11 19h2" />
            </svg>
          </span>
          <span class="admin-pricing-preview__card-label">{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.text }}</p>
        </article>
      </div>

      <p v-if="cancellationText" class="admin-pricing-preview__cancellation">
        {{ cancellationText }}
      </p>
    </section>
  </div>
</template>
