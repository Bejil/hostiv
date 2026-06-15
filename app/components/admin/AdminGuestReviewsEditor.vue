<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import AdminAlert from "./AdminAlert.vue"
import AdminConfirmDialog from "./AdminConfirmDialog.vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminIcon from "./AdminIcon.vue"
import type {
  GuestReview,
  GuestReviewListResult,
  GuestReviewSortField,
  GuestReviewSortOrder,
  GuestReviewSummary
} from "../../types/guest-review"
import { adminUiFormat } from "../../data/admin-ui"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { formatDisplayDate } from "../../utils/input-date"
import {
  importedGuestReviewIds,
  mapGuestReviewToPropertyReview
} from "../../utils/guest-review-verbatim"
import { formatRatingOnFive, ratingToStars } from "../../utils/platform-rating-stars"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  slug: string
}>()

const { ui, locale } = useAdminUi()
const editorCtx = useAdminEditorContext()
const ext = computed(() => ui.value.extended.guestReviews)
const summaryCopy = computed(() => ext.value.summary)

const PAGE_SIZE = 25

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<GuestReviewListResult | null>(null)
const page = ref(1)
const sortField = ref<GuestReviewSortField>("date")
const sortOrder = ref<GuestReviewSortOrder>("desc")
const pendingDelete = ref<GuestReview | null>(null)
const deleteLoading = ref(false)

const sortValue = computed({
  get: () => `${sortField.value}:${sortOrder.value}`,
  set: (value: string) => {
    const [field, order] = value.split(":") as [GuestReviewSortField, GuestReviewSortOrder]

    sortField.value = field === "rating" ? "rating" : "date"
    sortOrder.value = order === "asc" ? "asc" : "desc"
    page.value = 1
    void loadReviews()
  }
})

const reviews = computed(() => result.value?.reviews ?? [])
const summary = computed<GuestReviewSummary | null>(() => result.value?.summary ?? null)
const total = computed(() => result.value?.total ?? 0)
const pageCount = computed(() => result.value?.pageCount ?? 1)

const showPagination = computed(() => total.value > PAGE_SIZE)

const paginationLabel = computed(() => {
  if (!showPagination.value) {
    return ""
  }

  const start = (page.value - 1) * PAGE_SIZE + 1
  const end = Math.min(page.value * PAGE_SIZE, total.value)

  return adminUiFormat(ext.value.paginationRange, {
    start: String(start),
    end: String(end),
    total: String(total.value)
  })
})

const sortOptions = computed(() => [
  { value: "date:desc", label: ext.value.sort.dateDesc },
  { value: "date:asc", label: ext.value.sort.dateAsc },
  { value: "rating:desc", label: ext.value.sort.ratingDesc },
  { value: "rating:asc", label: ext.value.sort.ratingAsc }
])

const averageRatingDisplay = computed(() => {
  const value = summary.value?.averageRating ?? 0

  if (!value) {
    return "—"
  }

  const decimal = locale.value === "en" ? "." : ","

  return value.toFixed(1).replace(".", decimal)
})

const averageStars = computed(() => {
  const value = summary.value?.averageRating ?? 0

  if (!value) {
    return ""
  }

  return ratingToStars(formatRatingOnFive(value))
})

const withCommentRate = computed(() => {
  const current = summary.value

  if (!current?.total) {
    return 0
  }

  return Math.round((current.withComment / current.total) * 100)
})

const latestReviewLabel = computed(() => {
  const value = summary.value?.latestReviewAt

  if (!value) {
    return summaryCopy.value.noDate
  }

  return new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(value))
})

const distributionRows = computed(() => {
  const dist = summary.value?.distribution

  if (!dist) {
    return []
  }

  const max = Math.max(...Object.values(dist), 1)

  return (["5", "4", "3", "2", "1"] as const).map((stars) => ({
    stars,
    count: dist[stars],
    widthPercent: Math.round((dist[stars] / max) * 100)
  }))
})

function distributionCountLabel(count: number) {
  if (count === 1) {
    return summaryCopy.value.starCountOne
  }

  return adminUiFormat(summaryCopy.value.starCount, { count: String(count) })
}

const importedVerbatimIds = computed(() =>
  importedGuestReviewIds(editorCtx.getContentList("reviews"))
)

function isVerbatimImported(review: GuestReview) {
  return importedVerbatimIds.value.has(review.id)
}

function canAddVerbatim(review: GuestReview) {
  return Boolean(review.comment.trim()) && !isVerbatimImported(review)
}

function addVerbatimHint(review: GuestReview) {
  if (isVerbatimImported(review)) {
    return ext.value.addVerbatimAlready
  }

  if (!review.comment.trim()) {
    return ext.value.addVerbatimDisabled
  }

  return ext.value.addVerbatim
}

function addVerbatim(review: GuestReview) {
  if (!canAddVerbatim(review)) {
    return
  }

  const current = editorCtx.getContentList("reviews")
  const verbatim = mapGuestReviewToPropertyReview(review, editorCtx.siteEditLocale.value)

  editorCtx.patchContentList("reviews", [...current, verbatim])
}

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

async function loadReviews() {
  loading.value = true
  error.value = null

  try {
    result.value = await $fetch<GuestReviewListResult>(
      `/api/admin/${props.slug}/guest-reviews`,
      {
        headers: await authHeaders(),
        query: {
          page: page.value,
          sort: sortField.value,
          order: sortOrder.value
        }
      }
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    result.value = null
    error.value = e.data?.message || e.message || ext.value.errors.load
  } finally {
    loading.value = false
  }
}

function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > pageCount.value) {
    return
  }

  page.value = nextPage
  void loadReviews()
}

function openDelete(review: GuestReview) {
  pendingDelete.value = review
}

function closeDelete() {
  pendingDelete.value = null
}

async function confirmDelete() {
  const review = pendingDelete.value

  if (!review) {
    return
  }

  deleteLoading.value = true

  try {
    await $fetch(`/api/admin/${props.slug}/guest-reviews/${review.id}`, {
      method: "DELETE",
      headers: await authHeaders()
    })

    closeDelete()

    if (reviews.value.length === 1 && page.value > 1) {
      page.value -= 1
    }

    await loadReviews()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.errors.delete
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  void loadReviews()
})
</script>

<template>
  <div class="admin-guest-reviews">
    <p v-if="loading && !result" class="admin-guest-reviews__loading">{{ ext.loading }}</p>
    <AdminAlert v-else-if="error" variant="error" :message="error" />

    <AdminEmptyState
      v-else-if="!summary?.total"
      icon="quote"
      compact
      :title="ext.empty.title"
      :description="ext.empty.description"
    />

    <template v-else>
      <section class="admin-guest-reviews-summary" :aria-label="summaryCopy.ariaLabel">
        <div class="admin-guest-reviews-summary__stats">
          <article class="admin-guest-reviews-summary__stat admin-guest-reviews-summary__stat--accent">
            <p class="admin-guest-reviews-summary__stat-label">{{ summaryCopy.averageRating }}</p>
            <strong class="admin-guest-reviews-summary__stat-value">{{ averageRatingDisplay }}</strong>
            <span class="admin-guest-reviews-summary__stat-meta">{{ summaryCopy.outOfFive }}</span>
            <span
              v-if="averageStars"
              class="admin-guest-reviews-summary__stars"
              role="img"
              :aria-label="`${averageRatingDisplay} ${summaryCopy.outOfFive}`"
            >
              {{ averageStars }}
            </span>
          </article>

          <article class="admin-guest-reviews-summary__stat">
            <p class="admin-guest-reviews-summary__stat-label">{{ summaryCopy.totalReviews }}</p>
            <strong class="admin-guest-reviews-summary__stat-value">{{ summary?.total ?? 0 }}</strong>
            <span class="admin-guest-reviews-summary__stat-meta">
              {{
                adminUiFormat(total > 1 ? ext.countPlural : ext.count, {
                  count: String(summary?.total ?? 0)
                })
              }}
            </span>
          </article>

          <article class="admin-guest-reviews-summary__stat">
            <p class="admin-guest-reviews-summary__stat-label">{{ summaryCopy.withComment }}</p>
            <strong class="admin-guest-reviews-summary__stat-value">{{ summary?.withComment ?? 0 }}</strong>
            <span class="admin-guest-reviews-summary__stat-meta">
              {{
                adminUiFormat(summaryCopy.withCommentRate, {
                  percent: String(withCommentRate)
                })
              }}
            </span>
          </article>

          <article class="admin-guest-reviews-summary__stat">
            <p class="admin-guest-reviews-summary__stat-label">{{ summaryCopy.latestReview }}</p>
            <strong class="admin-guest-reviews-summary__stat-value admin-guest-reviews-summary__stat-value--date">
              {{ latestReviewLabel }}
            </strong>
          </article>

          <article class="admin-guest-reviews-summary__stat admin-guest-reviews-summary__stat--distribution">
            <p class="admin-guest-reviews-summary__stat-label">{{ summaryCopy.distribution }}</p>
            <ul class="admin-guest-reviews-summary__distribution-list" role="list">
              <li
                v-for="row in distributionRows"
                :key="row.stars"
                class="admin-guest-reviews-summary__distribution-row"
              >
                <span class="admin-guest-reviews-summary__distribution-label">
                  <AdminIcon name="star" :size="12" />
                  {{ row.stars }}
                </span>
                <span class="admin-guest-reviews-summary__distribution-track" aria-hidden="true">
                  <span
                    class="admin-guest-reviews-summary__distribution-bar"
                    :style="{ width: `${row.widthPercent}%` }"
                  />
                </span>
                <span class="admin-guest-reviews-summary__distribution-count">
                  {{ distributionCountLabel(row.count) }}
                </span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <div class="admin-guest-reviews-toolbar admin-guest-reviews-toolbar--sort-only">
        <label class="admin-guest-reviews-toolbar__sort">
          <span class="admin-guest-reviews-toolbar__sort-label">{{ ext.sort.label }}</span>
          <span class="admin-guest-reviews-sort-select">
            <select
              v-model="sortValue"
              class="admin-guest-reviews-sort-select__input"
              :aria-label="ext.sort.label"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <ChevronDown
              class="admin-guest-reviews-sort-select__chevron"
              :size="16"
              stroke-width="2"
              aria-hidden="true"
            />
          </span>
        </label>
      </div>

      <div class="admin-guest-reviews-bookings" :class="{ 'admin-guest-reviews-bookings--loading': loading }">
        <ul class="admin-guest-reviews-list" role="list">
          <li v-for="review in reviews" :key="review.id" class="admin-guest-reviews-list__row">
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

                    <a
                      :href="`mailto:${review.guest_email}`"
                      class="admin-guest-reviews-list__meta-stat admin-guest-reviews-list__email"
                    >
                      <AdminIcon name="mail" :size="15" />
                      {{ review.guest_email }}
                    </a>
                  </div>
                </div>

                <div class="admin-guest-reviews-list__aside">
                  <time class="admin-guest-reviews-list__date" :datetime="review.created_at">
                    {{ formatReviewDate(review.created_at) }}
                  </time>

                  <div class="admin-guest-reviews-list__actions">
                    <button
                      type="button"
                      class="admin-btn admin-btn--secondary admin-btn--sm admin-guest-reviews-list__verbatim-btn"
                      :disabled="!canAddVerbatim(review)"
                      :title="addVerbatimHint(review)"
                      @click="addVerbatim(review)"
                    >
                      <AdminIcon name="plus" :size="14" />
                      {{ isVerbatimImported(review) ? ext.addVerbatimAlready : ext.addVerbatim }}
                    </button>
                    <button
                      type="button"
                      class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                      :aria-label="ui.common.delete"
                      @click="openDelete(review)"
                    >
                      <AdminIcon name="trash" :size="16" />
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

      <nav
        v-if="showPagination"
        class="admin-reservations-pagination"
        :aria-label="ext.paginationAria"
      >
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="page <= 1"
          @click="goToPage(page - 1)"
        >
          {{ ext.paginationPrev }}
        </button>
        <p class="admin-reservations-pagination__meta">
          <span class="admin-reservations-pagination__range">{{ paginationLabel }}</span>
          <span class="admin-reservations-pagination__pages">
            {{
              adminUiFormat(ext.paginationPage, {
                page: String(page),
                total: String(pageCount)
              })
            }}
          </span>
        </p>
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="page >= pageCount"
          @click="goToPage(page + 1)"
        >
          {{ ext.paginationNext }}
        </button>
      </nav>
    </template>

    <AdminConfirmDialog
      :open="Boolean(pendingDelete)"
      :title="ext.deleteConfirmTitle"
      :message="ext.deleteConfirmBody"
      :confirm-label="ui.common.delete"
      :cancel-label="ui.common.cancel"
      :loading="deleteLoading"
      variant="danger"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
