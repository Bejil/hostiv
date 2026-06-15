<script setup lang="ts">
import { Loader2, X } from "@lucide/vue"
import AdminIcon from "../admin/AdminIcon.vue"
import PlatformAdminMemberDeleteModal from "./PlatformAdminMemberDeleteModal.vue"
import PlatformAdminMemberEditModal from "./PlatformAdminMemberEditModal.vue"
import type { PlatformAdminMemberDetail } from "../../types/platform-admin"

const props = defineProps<{
  open: boolean
  userId: string | null
  platformRequest: (
    path: string,
    options?: { method?: "GET" | "DELETE" | "PATCH" | "POST"; body?: unknown }
  ) => Promise<unknown>
}>()

const emit = defineEmits<{
  close: []
  changed: []
}>()

const { ui, formatDate } = usePlatformAdminUi()

const member = ref<PlatformAdminMemberDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteConfirmEmail = ref("")
const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)

const displayName = computed(() => {
  if (!member.value) {
    return ""
  }

  return member.value.full_name || member.value.email
})

const initials = computed(() => {
  if (!member.value) {
    return "?"
  }

  const first = member.value.first_name?.trim()
  const last = member.value.last_name?.trim()

  if (first || last) {
    return `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase() || "?"
  }

  const email = member.value.email.trim()

  return email ? email.charAt(0).toUpperCase() : "?"
})

watch(
  () => [props.open, props.userId] as const,
  ([isOpen, userId]) => {
    if (!isOpen || !userId) {
      member.value = null
      error.value = null
      return
    }

    void loadMember(userId)
  },
  { immediate: true }
)

async function loadMember(userId: string) {
  loading.value = true
  error.value = null

  try {
    member.value = await props.platformRequest<PlatformAdminMemberDetail>(
      `/api/platform-admin/members/${encodeURIComponent(userId)}`
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.members.detailModal.loadFailed
  } finally {
    loading.value = false
  }
}

function onClose(force = false) {
  if (!force && deleteLoading.value) {
    return
  }

  editModalOpen.value = false
  deleteModalOpen.value = false
  emit("close")
}

function onBackdropClick(event: MouseEvent) {
  if (loading.value || deleteLoading.value || editModalOpen.value || deleteModalOpen.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    onClose()
  }
}

function openEditModal() {
  editModalOpen.value = true
}

function openDeleteModal() {
  deleteConfirmEmail.value = ""
  deleteError.value = null
  deleteModalOpen.value = true
}

function closeDeleteModal(force = false) {
  if (!force && deleteLoading.value) {
    return
  }

  deleteModalOpen.value = false
  deleteConfirmEmail.value = ""
  deleteError.value = null
}

async function confirmDeleteMember() {
  if (!member.value) {
    return
  }

  deleteLoading.value = true
  deleteError.value = null

  try {
    await props.platformRequest(
      `/api/platform-admin/members/${encodeURIComponent(member.value.user_id)}`,
      {
        method: "DELETE",
        body: { confirm_email: deleteConfirmEmail.value }
      }
    )

    closeDeleteModal(true)
    member.value = null
    emit("changed")
    onClose(true)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    deleteError.value = e.data?.message || e.message || ui.value.shell.errorGeneric
  } finally {
    deleteLoading.value = false
  }
}

function onMemberSaved() {
  editModalOpen.value = false

  if (props.userId) {
    void loadMember(props.userId)
  }

  emit("changed")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--login"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--account platform-admin-member-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="platform-admin-member-detail-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :disabled="loading || deleteLoading"
              :aria-label="ui.common.close"
              @click="onClose"
            >
              <X :size="18" stroke-width="2" />
            </button>

            <div v-if="loading && !member" class="platform-admin-member-detail__loading">
              <Loader2 class="platform-admin-login-gate__spinner" aria-hidden="true" />
              <p>{{ ui.shell.loading }}</p>
            </div>

            <div v-else-if="error && !member" class="hostiv-modal__body">
              <p class="hostiv-modal__error" role="alert">{{ error }}</p>
              <footer class="platform-admin-member-detail__footer">
                <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="onClose">
                  {{ ui.common.close }}
                </button>
              </footer>
            </div>

            <template v-else-if="member">
              <header class="platform-admin-member-detail__hero">
                <div class="platform-admin-member-detail__avatar" aria-hidden="true">
                  {{ initials }}
                </div>
                <div class="platform-admin-member-detail__hero-text">
                  <p class="platform-admin-member-detail__eyebrow">{{ ui.members.detailModal.title }}</p>
                  <h2 id="platform-admin-member-detail-title" class="platform-admin-member-detail__name">
                    {{ displayName }}
                  </h2>
                  <p class="platform-admin-member-detail__email">{{ member.email }}</p>
                  <div class="platform-admin-member-detail__hero-badges">
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
                    <span class="platform-admin-badge">{{ member.subscription_plan }}</span>
                    <span
                      v-if="member.has_starter_plus"
                      class="platform-admin-badge platform-admin-badge--plus"
                    >
                      +
                    </span>
                  </div>
                </div>
              </header>

              <div class="platform-admin-member-detail__body">
                <div class="platform-admin-member-detail__grid">
                  <section class="platform-admin-member-detail__card">
                    <header class="platform-admin-member-detail__card-head">
                      <AdminIcon name="user" :size="16" />
                      <h3>{{ ui.members.detailModal.sections.identity }}</h3>
                    </header>
                    <dl class="platform-admin-member-detail__fields">
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.name }}</dt>
                        <dd>{{ displayName }}</dd>
                      </div>
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.email }}</dt>
                        <dd>
                          <a :href="`mailto:${member.email}`" class="platform-admin-member-detail__mailto">
                            {{ member.email }}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section class="platform-admin-member-detail__card">
                    <header class="platform-admin-member-detail__card-head">
                      <AdminIcon name="card" :size="16" />
                      <h3>{{ ui.members.detailModal.sections.subscription }}</h3>
                    </header>
                    <dl class="platform-admin-member-detail__fields">
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.plan }}</dt>
                        <dd>
                          <span class="platform-admin-table__inline">
                            <span class="platform-admin-badge">{{ member.subscription_plan }}</span>
                            <span
                              v-if="member.has_starter_plus"
                              class="platform-admin-badge platform-admin-badge--plus"
                            >
                              +
                            </span>
                          </span>
                        </dd>
                      </div>
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.subscription }}</dt>
                        <dd>
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
                        </dd>
                      </div>
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.paidUntil }}</dt>
                        <dd>{{ member.paid_until ? formatDate(member.paid_until) : ui.members.noSite }}</dd>
                      </div>
                      <div v-if="member.premium_tools_until" class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.premiumUntil }}</dt>
                        <dd>{{ formatDate(member.premium_tools_until) }}</dd>
                      </div>
                    </dl>
                  </section>

                  <section class="platform-admin-member-detail__card">
                    <header class="platform-admin-member-detail__card-head">
                      <AdminIcon name="home" :size="16" />
                      <h3>{{ ui.members.detailModal.sections.site }}</h3>
                    </header>
                    <dl class="platform-admin-member-detail__fields">
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.site }}</dt>
                        <dd>
                          <NuxtLink
                            v-if="member.property_slug"
                            :to="`/${member.property_slug}`"
                            target="_blank"
                            rel="noopener"
                            class="platform-admin-link"
                          >
                            /{{ member.property_slug }}
                          </NuxtLink>
                          <span v-else>{{ ui.members.noSite }}</span>
                        </dd>
                      </div>
                      <div v-if="member.property_slug" class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.siteStatus }}</dt>
                        <dd>
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
                        </dd>
                      </div>
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.stripe }}</dt>
                        <dd>
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
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section class="platform-admin-member-detail__card">
                    <header class="platform-admin-member-detail__card-head">
                      <AdminIcon name="calendar" :size="16" />
                      <h3>{{ ui.members.detailModal.sections.timeline }}</h3>
                    </header>
                    <dl class="platform-admin-member-detail__fields">
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.joined }}</dt>
                        <dd>{{ formatDate(member.created_at) }}</dd>
                      </div>
                      <div class="platform-admin-member-detail__field">
                        <dt>{{ ui.members.detailModal.fields.subscriptionStarted }}</dt>
                        <dd>
                          {{
                            member.subscription_started_at
                              ? formatDate(member.subscription_started_at)
                              : ui.members.noSite
                          }}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </div>

              <footer class="platform-admin-member-detail__footer">
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost"
                  :disabled="deleteLoading"
                  @click="openDeleteModal"
                >
                  {{ ui.members.deleteMember }}
                </button>
                <div class="platform-admin-member-detail__footer-actions">
                  <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="onClose">
                    {{ ui.common.close }}
                  </button>
                  <button type="button" class="hostiv-btn hostiv-btn--primary" @click="openEditModal">
                    {{ ui.members.editMember }}
                  </button>
                </div>
              </footer>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <PlatformAdminMemberEditModal
    :open="editModalOpen"
    :user-id="userId"
    stacked
    :platform-request="platformRequest"
    @close="editModalOpen = false"
    @saved="onMemberSaved"
  />

  <PlatformAdminMemberDeleteModal
    v-if="member"
    :open="deleteModalOpen"
    :email="member.email"
    :full-name="member.full_name"
    :loading="deleteLoading"
    :error="deleteError"
    :confirm-email="deleteConfirmEmail"
    @update:confirm-email="deleteConfirmEmail = $event"
    @cancel="closeDeleteModal"
    @confirm="confirmDeleteMember"
  />
</template>

<style scoped>
.platform-admin-member-detail__loading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 2rem 1.65rem 2.5rem;
  color: var(--admin-muted, #6a7c76);
}
</style>
