<script setup lang="ts">
import { computed } from "vue"
import { adminUiFormat } from "../../data/admin-ui"
import type { PropertyReview } from "../../types/property-site"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  reviews: PropertyReview[]
  eyebrow: string
  title: string
  backgroundPath: string
  previewUrl: (path: string) => string
}>()

const { ui } = useAdminUi()

const displayEyebrow = computed(
  () => props.eyebrow.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ui.value.previews.common.sectionTitle
)

const displayReviews = computed(() =>
  props.reviews
    .map((review) => ({
      ...review,
      author: review.author.trim() || ui.value.previews.reviews.guest,
      date: review.date.trim() || ui.value.previews.reviews.date,
      quote: review.quote.trim() || ui.value.previews.reviews.quote,
      rating: review.rating.trim(),
      stars: ratingToStars(review.rating)
    }))
    .filter((review) => review.quote || review.author)
)

const sectionStyle = computed(() => ({
  "--admin-reviews-preview-bg": `url('${props.previewUrl(props.backgroundPath)}')`
}))

function ratingAriaLabel(rating: string) {
  if (!rating) {
    return ui.value.previews.common.rating
  }

  return adminUiFormat(ui.value.previews.common.ratingWithValue, { rating })
}
</script>

<template>
  <div class="admin-reviews-preview" :aria-label="ui.previews.reviews.ariaLabel">
    <p class="admin-reviews-preview__label">{{ ui.previews.common.label }}</p>
    <section class="admin-reviews-preview__section" :style="sectionStyle">
      <div class="admin-reviews-preview__head">
        <p class="admin-reviews-preview__eyebrow">{{ displayEyebrow }}</p>
        <h2 class="admin-reviews-preview__title">{{ displayTitle }}</h2>
      </div>

      <p v-if="!displayReviews.length" class="admin-reviews-preview__empty">
        {{ ui.previews.reviews.empty }}
      </p>

      <div v-else class="admin-reviews-preview__carousel" :aria-label="ui.previews.reviews.carouselAria">
        <div class="admin-reviews-preview__track">
          <article
            v-for="(review, index) in displayReviews"
            :key="`${review.id}-${index}`"
            class="admin-reviews-preview__card"
          >
            <div
              class="admin-reviews-preview__stars"
              role="img"
              :aria-label="ratingAriaLabel(review.rating)"
            >
              {{ review.stars || "☆☆☆☆☆" }}
            </div>
            <p class="admin-reviews-preview__quote">“{{ review.quote }}”</p>
            <p class="admin-reviews-preview__author">{{ review.author }}</p>
            <span class="admin-reviews-preview__date">{{ review.date }}</span>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
