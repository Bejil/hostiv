<script setup lang="ts">
import { computed } from "vue"
import type { PropertyReview } from "../../types/property-site"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  reviews: PropertyReview[]
  eyebrow: string
  title: string
  backgroundPath: string
  previewUrl: (path: string) => string
}>()

const displayEyebrow = computed(() => props.eyebrow.trim() || "Sur-titre")
const displayTitle = computed(() => props.title.trim() || "Titre de la section")

const displayReviews = computed(() =>
  props.reviews
    .map((review) => ({
      ...review,
      author: review.author.trim() || "Voyageur",
      date: review.date.trim() || "Date",
      quote: review.quote.trim() || "Citation du témoignage…",
      rating: review.rating.trim(),
      stars: ratingToStars(review.rating)
    }))
    .filter((review) => review.quote || review.author)
)

const sectionStyle = computed(() => ({
  "--admin-reviews-preview-bg": `url('${props.previewUrl(props.backgroundPath)}')`
}))
</script>

<template>
  <div class="admin-reviews-preview" aria-label="Aperçu section témoignages">
    <p class="admin-reviews-preview__label">Aperçu</p>
    <section class="admin-reviews-preview__section" :style="sectionStyle">
      <div class="admin-reviews-preview__head">
        <p class="admin-reviews-preview__eyebrow">{{ displayEyebrow }}</p>
        <h2 class="admin-reviews-preview__title">{{ displayTitle }}</h2>
      </div>

      <p v-if="!displayReviews.length" class="admin-reviews-preview__empty">
        Renseignez au moins un avis pour afficher le carrousel.
      </p>

      <div v-else class="admin-reviews-preview__carousel" aria-label="Aperçu carrousel d’avis">
        <div class="admin-reviews-preview__track">
          <article
            v-for="(review, index) in displayReviews"
            :key="`${review.id}-${index}`"
            class="admin-reviews-preview__card"
          >
            <div
              class="admin-reviews-preview__stars"
              role="img"
              :aria-label="review.rating ? `Évaluation ${review.rating}` : 'Évaluation'"
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
