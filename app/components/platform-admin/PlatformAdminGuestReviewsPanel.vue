<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import type { PlatformAdminGuestReviewRow } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminGuestReviewRow[]>(
  props.platformFetch,
  "/api/platform-admin/guest-reviews"
)

onMounted(load)

defineExpose({ load })
</script>

<template>
  <section class="platform-admin-panel">
    <header class="platform-admin-panel__head">
      <h2 class="platform-admin-panel__title">{{ ui.guestReviews.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.guestReviews.intro }}</p>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <AdminEmptyState v-else-if="!data?.length" icon="star" :title="ui.guestReviews.empty" description="" />

    <div v-else class="platform-admin-reviews-list">
      <article v-for="review in data" :key="review.id" class="platform-admin-review-card">
        <header class="platform-admin-review-card__head">
          <div>
            <strong>{{ review.guest_name }}</strong>
            <span class="platform-admin-muted">
              {{ review.brand_name }} · /{{ review.property_slug }}
            </span>
          </div>
          <div class="platform-admin-review-card__meta">
            <span class="platform-admin-rating">{{ review.rating }}/5</span>
            <time>{{ formatDate(review.created_at) }}</time>
          </div>
        </header>
        <p class="platform-admin-muted">
          {{ formatDate(review.arrival_date) }} → {{ formatDate(review.departure_date) }}
        </p>
        <blockquote v-if="review.comment" class="platform-admin-review-card__comment">
          {{ review.comment }}
        </blockquote>
      </article>
    </div>
  </section>
</template>
