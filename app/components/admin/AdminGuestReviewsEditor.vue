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
  GuestReviewSortOrder
} from "../../types/guest-review"
import { adminUiFormat } from "../../data/admin-ui"
import { formatDisplayDate } from "../../utils/input-date"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  slug: string
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.guestReviews)

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

const countLabel = computed(() => {
  if (!total.value) {
    return ""
  }

  return adminUiFormat(total.value > 1 ? ext.value.countPlural : ext.value.count, {
    count: String(total.value)
  })
})

const sortOptions = computed(() => [
  { value: "date:desc", label: ext.value.sort.dateDesc },
  { value: "date:asc", label: ext.value.sort.dateAsc },
  { value: "rating:desc", label: ext.value.sort.ratingDesc },
  { value: "rating:asc", label: ext.value.sort.ratingAsc }
])

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
    <p v-if="loading" class="admin-guest-reviews__loading">{{ ext.loading }}</p>
    <AdminAlert v-else-if="error" variant="error" :message="error" />

    <AdminEmptyState
      v-else-if="!reviews.length"
      icon="quote"
      compact
      :title="ext.empty.title"
      :description="ext.empty.description"
    />

    <template v-else>
      <div class="admin-guest-reviews-toolbar">
        <p v-if="countLabel" class="admin-guest-reviews-toolbar__count">{{ countLabel }}</p>

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

      <div class="admin-guest-reviews-bookings">
        <ul class="admin-guest-reviews-list" role="list">
          <li v-for="review in reviews" :key="review.id" class="admin-guest-reviews-list__row">
            <article class="admin-guest-reviews-list__main">
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

                <time class="admin-guest-reviews-list__date" :datetime="review.created_at">
                  {{ formatReviewDate(review.created_at) }}
                </time>
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

              <blockquote class="admin-guest-reviews-list__comment">
                {{ review.comment }}
              </blockquote>
            </article>

            <div class="admin-guest-reviews-list__actions">
              <button
                type="button"
                class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                :aria-label="ui.common.delete"
                @click="openDelete(review)"
              >
                <AdminIcon name="trash" :size="16" />
              </button>
            </div>
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
