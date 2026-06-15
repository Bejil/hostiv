<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import AdminIcon from "../admin/AdminIcon.vue"
import PlatformAdminMemberDeleteModal from "./PlatformAdminMemberDeleteModal.vue"
import PlatformAdminMemberDetailModal from "./PlatformAdminMemberDetailModal.vue"
import PlatformAdminMemberEditModal from "./PlatformAdminMemberEditModal.vue"
import type { PlatformAdminMemberRow } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
  platformRequest: (
    path: string,
    options?: { method?: "GET" | "DELETE" | "PATCH" | "POST"; body?: unknown }
  ) => Promise<unknown>
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminMemberRow[]>(
  props.platformFetch,
  "/api/platform-admin/members"
)

const search = ref("")

const detailModalOpen = ref(false)
const detailTarget = ref<PlatformAdminMemberRow | null>(null)

const editModalOpen = ref(false)
const editTargetId = ref<string | null>(null)

const deleteModalOpen = ref(false)
const deleteTarget = ref<PlatformAdminMemberRow | null>(null)
const deleteConfirmEmail = ref("")
const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)

onMounted(load)

defineExpose({ load })

const filteredMembers = computed(() => {
  const rows = data.value ?? []
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return rows
  }

  return rows.filter(
    (member) =>
      member.email.toLowerCase().includes(query) ||
      (member.full_name ?? "").toLowerCase().includes(query) ||
      (member.property_slug ?? "").toLowerCase().includes(query)
  )
})

function openDetailModal(member: PlatformAdminMemberRow) {
  detailTarget.value = member
  detailModalOpen.value = true
}

function closeDetailModal() {
  detailModalOpen.value = false
  detailTarget.value = null
}

function onMemberChanged() {
  void load()
}

function openEditModal(member: PlatformAdminMemberRow) {
  editTargetId.value = member.user_id
  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editTargetId.value = null
}

function onMemberSaved() {
  closeEditModal()
  void load()
}

function openDeleteModal(member: PlatformAdminMemberRow) {
  deleteTarget.value = member
  deleteConfirmEmail.value = ""
  deleteError.value = null
  deleteModalOpen.value = true
}

function closeDeleteModal(force = false) {
  if (!force && deleteLoading.value) {
    return
  }

  deleteModalOpen.value = false
  deleteTarget.value = null
  deleteConfirmEmail.value = ""
  deleteError.value = null
}

async function confirmDeleteMember() {
  if (!deleteTarget.value) {
    return
  }

  deleteLoading.value = true
  deleteError.value = null

  try {
    await props.platformRequest(
      `/api/platform-admin/members/${encodeURIComponent(deleteTarget.value.user_id)}`,
      {
        method: "DELETE",
        body: { confirm_email: deleteConfirmEmail.value }
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
      <h2 class="platform-admin-panel__title">{{ ui.members.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.members.intro }}</p>
    </header>

    <div class="platform-admin-toolbar">
      <input
        v-model="search"
        type="search"
        class="platform-admin-toolbar__search"
        :placeholder="ui.members.searchPlaceholder"
      />
    </div>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <AdminEmptyState v-else-if="!filteredMembers.length" icon="user" :title="ui.members.empty" description="" />

    <div v-else class="platform-admin-table-wrap">
      <table class="platform-admin-table platform-admin-table--align-middle">
        <thead>
          <tr>
            <th>{{ ui.members.columns.member }}</th>
            <th>{{ ui.members.columns.plan }}</th>
            <th>{{ ui.members.columns.subscription }}</th>
            <th>{{ ui.members.columns.site }}</th>
            <th>{{ ui.members.columns.registeredAt }}</th>
            <th>{{ ui.members.columns.stripe }}</th>
            <th>{{ ui.members.columns.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.user_id">
            <td>
              <button
                type="button"
                class="platform-admin-table__name-btn"
                :aria-label="ui.members.viewMember"
                @click="openDetailModal(member)"
              >
                {{ member.full_name || member.email }}
              </button>
            </td>
            <td>
              <span class="platform-admin-badge">{{ member.subscription_plan }}</span>
              <span v-if="member.has_starter_plus" class="platform-admin-badge platform-admin-badge--plus">+</span>
            </td>
            <td>
              <div class="platform-admin-table__inline">
                <span
                  class="platform-admin-badge"
                  :class="
                    member.subscription_active
                      ? 'platform-admin-badge--status-ok'
                      : 'platform-admin-badge--status-warn'
                  "
                >
                  {{ member.subscription_active ? ui.sites.active : ui.sites.expired }}
                </span>
                <span v-if="member.paid_until" class="platform-admin-muted">
                  {{ formatDate(member.paid_until) }}
                </span>
              </div>
            </td>
            <td>
              <template v-if="member.property_slug">
                <div class="platform-admin-table__inline">
                  <NuxtLink
                    :to="`/${member.property_slug}`"
                    target="_blank"
                    rel="noopener"
                    class="platform-admin-link"
                  >
                    /{{ member.property_slug }}
                  </NuxtLink>
                  <span
                    class="platform-admin-badge"
                    :class="
                      member.property_published
                        ? 'platform-admin-badge--status-ok'
                        : 'platform-admin-badge--status-muted'
                    "
                  >
                    {{ member.property_published ? ui.sites.published : ui.sites.draft }}
                  </span>
                </div>
              </template>
              <span v-else>{{ ui.members.noSite }}</span>
            </td>
            <td>{{ formatDate(member.created_at) }}</td>
            <td>
              <span
                v-if="member.property_slug"
                class="platform-admin-badge"
                :class="
                  member.stripe_account_id
                    ? 'platform-admin-badge--status-ok'
                    : 'platform-admin-badge--status-muted'
                "
              >
                {{ member.stripe_account_id ? ui.sites.stripeOk : ui.sites.stripeMissing }}
              </span>
              <span v-else>{{ ui.members.noSite }}</span>
            </td>
            <td>
              <div class="platform-admin-table__actions">
                <button
                  type="button"
                  class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.members.editMember"
                  :title="ui.members.editMember"
                  @click="openEditModal(member)"
                >
                  <AdminIcon name="pencil" :size="16" />
                </button>
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                  :aria-label="ui.members.deleteMember"
                  :title="ui.members.deleteMember"
                  @click="openDeleteModal(member)"
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
      :open="detailModalOpen"
      :user-id="detailTarget?.user_id ?? null"
      :platform-request="platformRequest"
      @close="closeDetailModal"
      @changed="onMemberChanged"
    />

    <PlatformAdminMemberEditModal
      :open="editModalOpen"
      :user-id="editTargetId"
      :platform-request="platformRequest"
      @close="closeEditModal"
      @saved="onMemberSaved"
    />

    <PlatformAdminMemberDeleteModal
      v-if="deleteTarget"
      :open="deleteModalOpen"
      :email="deleteTarget.email"
      :full-name="deleteTarget.full_name"
      :loading="deleteLoading"
      :error="deleteError"
      :confirm-email="deleteConfirmEmail"
      @update:confirm-email="deleteConfirmEmail = $event"
      @cancel="closeDeleteModal"
      @confirm="confirmDeleteMember"
    />
  </section>
</template>
