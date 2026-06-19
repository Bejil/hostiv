<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import AdminIcon from "../admin/AdminIcon.vue"
import PlatformAdminPromoCodeDeleteModal from "./PlatformAdminPromoCodeDeleteModal.vue"
import PlatformAdminPromoCodeEditModal from "./PlatformAdminPromoCodeEditModal.vue"
import { platformAdminUiFormat } from "../../data/platform-admin-ui"
import type { HostivPromoCode } from "../../types/hostiv-promo-code"

const PAGE_SIZE = 25

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
  platformRequest: (
    path: string,
    options?: { method?: "GET" | "DELETE" | "PATCH" | "POST"; body?: unknown }
  ) => Promise<unknown>
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<HostivPromoCode[]>(
  props.platformFetch,
  "/api/platform-admin/promo-codes"
)

const page = ref(1)
const editModalOpen = ref(false)
const editTarget = ref<HostivPromoCode | null>(null)
const deleteModalOpen = ref(false)
const deleteTarget = ref<HostivPromoCode | null>(null)
const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)

onMounted(load)

defineExpose({ load })

function promoStatus(row: HostivPromoCode) {
  const now = Date.now()
  const start = new Date(row.valid_from).getTime()
  const end = new Date(row.valid_until).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return "unknown"
  }

  if (now < start) {
    return "upcoming"
  }

  if (now > end) {
    return "expired"
  }

  return "active"
}

function promoStatusLabel(status: ReturnType<typeof promoStatus>) {
  return ui.value.promoCodes.status[status]
}

function promoStatusClass(status: ReturnType<typeof promoStatus>) {
  if (status === "active") {
    return "platform-admin-promo-status--active"
  }

  if (status === "upcoming") {
    return "platform-admin-promo-status--upcoming"
  }

  if (status === "expired") {
    return "platform-admin-promo-status--expired"
  }

  return "platform-admin-promo-status--unknown"
}

const promoCodes = computed(() => data.value ?? [])

const pageCount = computed(() => Math.max(1, Math.ceil(promoCodes.value.length / PAGE_SIZE)))

const paginatedPromoCodes = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE

  return promoCodes.value.slice(start, start + PAGE_SIZE)
})

const showPagination = computed(() => promoCodes.value.length > PAGE_SIZE)

const paginationRangeLabel = computed(() => {
  if (!promoCodes.value.length) {
    return ""
  }

  const start = (page.value - 1) * PAGE_SIZE + 1
  const end = Math.min(page.value * PAGE_SIZE, promoCodes.value.length)

  return platformAdminUiFormat(ui.value.promoCodes.pagination.range, {
    start: String(start),
    end: String(end),
    total: String(promoCodes.value.length)
  })
})

watch(
  () => promoCodes.value.length,
  () => {
    if (page.value > pageCount.value) {
      page.value = pageCount.value
    }
  }
)

function goToPage(nextPage: number) {
  page.value = Math.min(pageCount.value, Math.max(1, nextPage))
}

function openCreateModal() {
  editTarget.value = null
  editModalOpen.value = true
}

function openEditModal(row: HostivPromoCode) {
  editTarget.value = row
  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editTarget.value = null
}

function onSaved() {
  closeEditModal()
  void load()
}

function openDeleteModal(row: HostivPromoCode) {
  deleteTarget.value = row
  deleteError.value = null
  deleteModalOpen.value = true
}

function closeDeleteModal(force = false) {
  if (!force && deleteLoading.value) {
    return
  }

  deleteModalOpen.value = false
  deleteTarget.value = null
  deleteError.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    return
  }

  deleteLoading.value = true
  deleteError.value = null

  try {
    await props.platformRequest(
      `/api/platform-admin/promo-codes/${encodeURIComponent(deleteTarget.value.id)}`,
      { method: "DELETE" }
    )

    closeDeleteModal(true)
    await load()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    deleteError.value = e.data?.message || e.message || ui.value.shell.errorGeneric
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <section class="platform-admin-panel platform-admin-dashboard">
    <header class="platform-admin-dashboard__head">
      <div>
        <h2 class="platform-admin-panel__title">{{ ui.promoCodes.title }}</h2>
        <p class="platform-admin-panel__intro">{{ ui.promoCodes.intro }}</p>
      </div>

      <button type="button" class="admin-btn admin-btn--primary admin-btn--sm" @click="openCreateModal">
        <AdminIcon name="plus" :size="15" />
        {{ ui.promoCodes.createCta }}
      </button>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <section
      v-else-if="!promoCodes.length"
      class="platform-admin-dashboard__panel platform-admin-dashboard__panel--wide"
    >
      <AdminEmptyState icon="key" :title="ui.promoCodes.empty" :description="ui.promoCodes.emptyHint" />
    </section>

    <div v-else class="platform-admin-table-wrap">
      <table class="platform-admin-table platform-admin-table--align-middle">
        <thead>
          <tr>
            <th>{{ ui.promoCodes.columns.title }}</th>
            <th>{{ ui.promoCodes.columns.code }}</th>
            <th>{{ ui.promoCodes.columns.discount }}</th>
            <th>{{ ui.promoCodes.columns.validity }}</th>
            <th>{{ ui.promoCodes.columns.emails }}</th>
            <th>{{ ui.promoCodes.columns.status }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedPromoCodes" :key="row.id">
            <td>
              <strong>{{ row.title }}</strong>
              <p v-if="row.description" class="platform-admin-table__meta">{{ row.description }}</p>
            </td>
            <td><code>{{ row.code }}</code></td>
            <td>-{{ row.discount_percent }} %</td>
            <td>
              {{ formatDate(row.valid_from, { dateStyle: "medium" }) }}
              →
              {{ formatDate(row.valid_until, { dateStyle: "medium" }) }}
            </td>
            <td>{{ row.allowed_emails === "*" ? ui.promoCodes.allEmails : row.allowed_emails }}</td>
            <td>
              <span
                class="platform-admin-promo-status"
                :class="promoStatusClass(promoStatus(row))"
              >
                <span class="platform-admin-promo-status__dot" aria-hidden="true" />
                {{ promoStatusLabel(promoStatus(row)) }}
              </span>
            </td>
            <td>
              <div class="platform-admin-table__actions">
                <button
                  type="button"
                  class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.common.edit"
                  :title="ui.common.edit"
                  @click="openEditModal(row)"
                >
                  <AdminIcon name="pencil" :size="16" />
                </button>
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.common.delete"
                  :title="ui.common.delete"
                  @click="openDeleteModal(row)"
                >
                  <AdminIcon name="trash" :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <nav
        v-if="showPagination"
        class="platform-admin-pagination"
        :aria-label="ui.promoCodes.pagination.aria"
      >
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="page <= 1"
          @click="goToPage(page - 1)"
        >
          {{ ui.promoCodes.pagination.prev }}
        </button>
        <p class="platform-admin-pagination__meta">
          <span class="platform-admin-pagination__range">{{ paginationRangeLabel }}</span>
          <span class="platform-admin-pagination__pages">
            {{
              platformAdminUiFormat(ui.promoCodes.pagination.page, {
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
          {{ ui.promoCodes.pagination.next }}
        </button>
      </nav>
    </div>

    <PlatformAdminPromoCodeEditModal
      :open="editModalOpen"
      :promo-code="editTarget"
      :platform-request="platformRequest"
      @close="closeEditModal"
      @saved="onSaved"
    />

    <PlatformAdminPromoCodeDeleteModal
      :open="deleteModalOpen"
      :promo-code="deleteTarget"
      :loading="deleteLoading"
      :error="deleteError"
      @cancel="closeDeleteModal()"
      @confirm="confirmDelete"
    />
  </section>
</template>
