<script setup lang="ts">
import { getSiteUiLabels, siteUiFormat } from "../data/site-ui-labels"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyReview } from "../types/property-site"
import {
  formatRatingOnFive,
  normalizeReviewRatingValue,
  parseRatingValue,
  ratingToStars
} from "../utils/platform-rating-stars"

const props = defineProps<{
  reviews: PropertyReview[]
  locale: HostivLocale
  variant: "admin-preview" | "admin-panel"
}>()

const ui = computed(() => getSiteUiLabels(props.locale))

const summary = computed(() => {
  const ratings = props.reviews
    .map((review) => parseRatingValue(normalizeReviewRatingValue(review.rating)))
    .filter((value): value is number => value !== null)

  const ratedCount = ratings.length
  const average =
    ratedCount > 0 ? ratings.reduce((sum, value) => sum + value, 0) / ratedCount : null
  const averageLabel = average !== null ? formatRatingOnFive(average) : ""

  return {
    total: props.reviews.length,
    ratedCount,
    averageLabel,
    stars: averageLabel ? ratingToStars(averageLabel) : ""
  }
})

const rootClass = computed(() => {
  const base = "reviews-summary"

  if (props.variant === "admin-preview") {
    return `${base} reviews-summary--admin-preview`
  }

  if (props.variant === "admin-panel") {
    return `${base} reviews-summary--admin-panel`
  }

  return `${base} reviews-summary--admin-preview`
})

const reviewCountLabel = computed(() => {
  const count = summary.value.total
  const template =
    count > 1 ? ui.value.reviews.reviewCountPlural : ui.value.reviews.reviewCount

  return siteUiFormat(template, { count: String(count) })
})

const basedOnLabel = computed(() => {
  const count = summary.value.ratedCount

  if (!count) {
    return ""
  }

  const template =
    count > 1 ? ui.value.reviews.basedOnRatedPlural : ui.value.reviews.basedOnRated

  return siteUiFormat(template, { count: String(count) })
})

const starsAriaLabel = computed(() => {
  if (!summary.value.averageLabel) {
    return ""
  }

  return siteUiFormat(ui.value.reviews.starsAria, { rating: summary.value.averageLabel })
})
</script>

<template>
  <aside :class="rootClass" :aria-label="ui.reviews.summaryAria">
    <p class="reviews-summary__label">{{ ui.reviews.averageLabel }}</p>
    <p
      class="reviews-summary__score"
      :class="{ 'reviews-summary__score--muted': !summary.averageLabel }"
    >
      {{ summary.averageLabel || "—" }}
    </p>
    <p v-if="summary.stars" class="reviews-summary__stars" role="img" :aria-label="starsAriaLabel">
      {{ summary.stars }}
    </p>
    <ul v-if="summary.total" class="reviews-summary__meta">
      <li>{{ reviewCountLabel }}</li>
      <li v-if="basedOnLabel">{{ basedOnLabel }}</li>
    </ul>
  </aside>
</template>
