<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminAlert from "./AdminAlert.vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminIcon from "./AdminIcon.vue"
import type { GuestReview, GuestReviewListResult } from "../../types/guest-review"
import type { PropertyReview } from "../../types/property-site"
import { adminUiFormat } from "../../data/admin-ui"
import { formatDisplayDate } from "../../utils/input-date"
import { importedGuestReviewIds } from "../../utils/guest-review-verbatim"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  open: boolean
  slug: string
  existingReviews: PropertyReview[]
}>()

const emit = defineEmits<{
  close: []
  select: [review: GuestReview]
}>()

const { ui, locale } = useAdminUi()

const copy = computed(() => ui.value.editors.reviews.guestPicker)
const ext = computed(() => ui.value.extended.guestReviews)

const loading = ref(false)
const error = ref<string | null>(null)
const guestReviews = ref<GuestReview[]>([])

const importedIds = computed(() => importedGuestReviewIds(props.existingReviews))

const availableReviews = computed(() =>
  guestReviews.value.filter(
    (review) => review.comment.trim() && !importedIds.value.has(review.id)
  )
)

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

function guestName(review: GuestReview) {
  return `${review.guest_first_name} ${review.guest_last_name}`.trim()
}

function ratingPillClass(rating: number) {
  const safe = Math.max(1, Math.min(5, Math.round(rating)))

  if (safe >= 5) {
    return "admin-guest-reviews-rating-pill--5"
  }

  if (safe >= 4) {
    return "admin-guest-reviews-rating-pill--4"
  }

  if (safe >= 3) {
    return "admin-guest-reviews-rating-pill--3"
  }

  return "admin-guest-reviews-rating-pill--low"
}

function stayDatesLabel(review: GuestReview) {
  if (!review.arrival_date || !review.departure_date) {
    return ""
  }

  return `${formatDisplayDate(review.arrival_date, locale.value)} → ${formatDisplayDate(review.departure_date, locale.value)}`
}

function formatReviewDate(value: string) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

async function loadGuestReviews() {
  loading.value = true
  error.value = null

  try {
    const result = await $fetch<GuestReviewListResult>(`/api/admin/${props.slug}/guest-reviews`, {
      headers: await authHeaders(),
      query: {
        page: 1,
        sort: "date",
        order: "desc",
        pageSize: 100
      }
    })

    guestReviews.value = result.reviews
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    guestReviews.value = []
    error.value = e.data?.message || e.message || ext.value.errors.load
  } finally {
    loading.value = false
  }
}

function onSelect(review: GuestReview) {
  emit("select", review)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""

    if (isOpen) {
      void loadGuestReviews()
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close")
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--review-guest-picker"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--review-guest-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-guest-picker-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-review-guest-picker-title" class="hostiv-modal__title">
                  {{ copy.title }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ copy.subtitle }}
                </p>
              </div>
            </header>

            <p v-if="loading" class="admin-review-guest-picker__loading">{{ copy.loading }}</p>
            <AdminAlert v-else-if="error" variant="error" :message="error" />

            <AdminEmptyState
              v-else-if="!guestReviews.length"
              icon="quote"
              compact
              :title="ext.empty.title"
              :description="ext.empty.description"
            />

            <AdminEmptyState
              v-else-if="!availableReviews.length"
              icon="quote"
              compact
              :title="copy.emptyTitle"
              :description="copy.emptyDescription"
            />

            <div v-else class="admin-review-guest-picker__list-wrap">
              <p class="admin-review-guest-picker__count">
                {{
                  adminUiFormat(availableReviews.length > 1 ? copy.countPlural : copy.count, {
                    count: String(availableReviews.length)
                  })
                }}
              </p>

              <ul class="admin-guest-reviews-list admin-review-guest-picker__list" role="list">
                <li
                  v-for="review in availableReviews"
                  :key="review.id"
                  class="admin-guest-reviews-list__row admin-review-guest-picker__row"
                >
                  <article class="admin-guest-reviews-list__main">
                    <div class="admin-guest-reviews-list__head">
                      <div class="admin-guest-reviews-list__info">
                        <div class="admin-guest-reviews-list__line admin-guest-reviews-list__line--primary">
                          <span
                            class="admin-guest-reviews-rating-pill"
                            :class="ratingPillClass(review.rating)"
                            :aria-label="`${review.rating} / 5`"
                          >
                            <AdminIcon name="star" :size="12" />
                            {{ review.rating }}/5
                          </span>

                          <p class="admin-guest-reviews-list__author">
                            {{ guestName(review) }}
                          </p>
                        </div>

                        <div class="admin-guest-reviews-list__line admin-guest-reviews-list__line--meta">
                          <span v-if="stayDatesLabel(review)" class="admin-guest-reviews-list__meta-stat">
                            <AdminIcon name="calendar" :size="15" />
                            {{ stayDatesLabel(review) }}
                          </span>
                        </div>
                      </div>

                      <div class="admin-guest-reviews-list__aside">
                        <time class="admin-guest-reviews-list__date" :datetime="review.created_at">
                          {{ formatReviewDate(review.created_at) }}
                        </time>

                        <div class="admin-guest-reviews-list__actions">
                          <button
                            type="button"
                            class="admin-btn admin-btn--secondary admin-btn--sm"
                            @click="onSelect(review)"
                          >
                            {{ copy.select }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <blockquote class="admin-guest-reviews-list__comment">
                      {{ review.comment }}
                    </blockquote>
                  </article>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
