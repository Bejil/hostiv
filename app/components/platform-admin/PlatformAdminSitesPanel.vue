<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import AdminIcon from "../admin/AdminIcon.vue"
import PlatformAdminMemberDetailModal from "./PlatformAdminMemberDetailModal.vue"
import PlatformAdminSiteDeleteModal from "./PlatformAdminSiteDeleteModal.vue"
import type { PlatformAdminSiteRow } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
  platformRequest: (
    path: string,
    options?: { method?: "GET" | "DELETE" | "PATCH" | "POST"; body?: unknown }
  ) => Promise<unknown>
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminSiteRow[]>(
  props.platformFetch,
  "/api/platform-admin/sites"
)

const search = ref("")
const filter = ref<"all" | "published" | "draft" | "active" | "expired">("all")

const deleteModalOpen = ref(false)
const deleteTarget = ref<PlatformAdminSiteRow | null>(null)
const deleteConfirmSlug = ref("")
const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)

const memberDetailOpen = ref(false)
const memberDetailUserId = ref<string | null>(null)

onMounted(load)

defineExpose({ load })

const filteredSites = computed(() => {
  const rows = data.value ?? []
  const query = search.value.trim().toLowerCase()

  return rows.filter((site) => {
    if (filter.value === "published" && !site.published) return false
    if (filter.value === "draft" && site.published) return false
    if (filter.value === "active" && !site.subscription_active) return false
    if (filter.value === "expired" && (site.subscription_active || !site.paid_until)) return false

    if (!query) return true

    return (
      site.slug.toLowerCase().includes(query) ||
      site.brand_name.toLowerCase().includes(query) ||
      (site.owner_email ?? "").toLowerCase().includes(query) ||
      (site.owner_full_name ?? "").toLowerCase().includes(query)
    )
  })
})

function openMemberDetail(site: PlatformAdminSiteRow) {
  if (!site.owner_user_id) {
    return
  }

  memberDetailUserId.value = site.owner_user_id
  memberDetailOpen.value = true
}

function closeMemberDetail() {
  memberDetailOpen.value = false
  memberDetailUserId.value = null
}

function onMemberChanged() {
  void load()
}

function openDeleteModal(site: PlatformAdminSiteRow) {
  deleteTarget.value = site
  deleteConfirmSlug.value = ""
  deleteError.value = null
  deleteModalOpen.value = true
}

function closeDeleteModal(force = false) {
  if (!force && deleteLoading.value) {
    return
  }

  deleteModalOpen.value = false
  deleteTarget.value = null
  deleteConfirmSlug.value = ""
  deleteError.value = null
}

async function confirmDeleteSite() {
  if (!deleteTarget.value) {
    return
  }

  deleteLoading.value = true
  deleteError.value = null

  try {
    await props.platformRequest(
      `/api/platform-admin/sites/${encodeURIComponent(deleteTarget.value.slug)}`,
      {
        method: "DELETE",
        body: { confirm_slug: deleteConfirmSlug.value }
      }
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
  <section class="platform-admin-panel">
    <header class="platform-admin-panel__head">
      <h2 class="platform-admin-panel__title">{{ ui.sites.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.sites.intro }}</p>
    </header>

    <div class="platform-admin-toolbar">
      <input
        v-model="search"
        type="search"
        class="platform-admin-toolbar__search"
        :placeholder="ui.sites.searchPlaceholder"
      />
      <div class="platform-admin-toolbar__filters">
        <button
          v-for="item in [
            { id: 'all', label: ui.filters.all },
            { id: 'published', label: ui.filters.published },
            { id: 'draft', label: ui.filters.draft },
            { id: 'active', label: ui.filters.active },
            { id: 'expired', label: ui.filters.expired }
          ]"
          :key="item.id"
          type="button"
          class="platform-admin-filter-chip"
          :class="{ 'platform-admin-filter-chip--active': filter === item.id }"
          @click="filter = item.id as typeof filter"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <AdminEmptyState v-else-if="!filteredSites.length" icon="home" :title="ui.sites.empty" description="" />

    <div v-else class="platform-admin-table-wrap">
      <table class="platform-admin-table platform-admin-table--align-middle">
        <thead>
          <tr>
            <th>{{ ui.sites.columns.site }}</th>
            <th>{{ ui.sites.columns.member }}</th>
            <th>{{ ui.sites.columns.status }}</th>
            <th>{{ ui.sites.columns.reservations }}</th>
            <th>{{ ui.sites.columns.reviews }}</th>
            <th>{{ ui.sites.columns.stripe }}</th>
            <th>{{ ui.sites.columns.created }}</th>
            <th>{{ ui.sites.columns.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in filteredSites" :key="site.id">
            <td>{{ site.brand_name }}</td>
            <td>
              <button
                v-if="site.owner_user_id && (site.owner_full_name || site.owner_email)"
                type="button"
                class="platform-admin-table__name-btn"
                :aria-label="ui.members.viewMember"
                @click="openMemberDetail(site)"
              >
                {{ site.owner_full_name || site.owner_email }}
              </button>
              <span v-else>{{ site.owner_full_name || site.owner_email || "—" }}</span>
            </td>
            <td>
              <span
                class="platform-admin-badge"
                :class="
                  site.published ? 'platform-admin-badge--status-ok' : 'platform-admin-badge--status-muted'
                "
              >
                {{ site.published ? ui.sites.published : ui.sites.draft }}
              </span>
            </td>
            <td>{{ site.reservations_count }}</td>
            <td>{{ site.guest_reviews_count }}</td>
            <td>
              {{ site.stripe_account_id ? ui.sites.stripeOk : ui.sites.stripeMissing }}
            </td>
            <td>{{ formatDate(site.created_at) }}</td>
            <td>
              <div class="platform-admin-table__actions">
                <NuxtLink
                  :to="`/${site.slug}/admin`"
                  target="_blank"
                  rel="noopener"
                  class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.sites.openAdmin"
                  :title="ui.sites.openAdmin"
                >
                  <AdminIcon name="layout" :size="16" />
                </NuxtLink>
                <NuxtLink
                  :to="`/${site.slug}`"
                  target="_blank"
                  rel="noopener"
                  class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.sites.openSite"
                  :title="ui.sites.openSite"
                >
                  <AdminIcon name="external" :size="16" />
                </NuxtLink>
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.sites.deleteSite"
                  :title="ui.sites.deleteSite"
                  @click="openDeleteModal(site)"
                >
                  <AdminIcon name="trash" :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PlatformAdminMemberDetailModal
      :open="memberDetailOpen"
      :user-id="memberDetailUserId"
      :platform-request="platformRequest"
      @close="closeMemberDetail"
      @changed="onMemberChanged"
    />

    <PlatformAdminSiteDeleteModal
      v-if="deleteTarget"
      :open="deleteModalOpen"
      :slug="deleteTarget.slug"
      :brand-name="deleteTarget.brand_name"
      :loading="deleteLoading"
      :error="deleteError"
      :confirm-slug="deleteConfirmSlug"
      @update:confirm-slug="deleteConfirmSlug = $event"
      @cancel="closeDeleteModal"
      @confirm="confirmDeleteSite"
    />
  </section>
</template>
