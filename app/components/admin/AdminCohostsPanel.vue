<script setup lang="ts">
import { UserPlus } from "@lucide/vue"
import type { PropertyCohostMember, PropertyCohostsPayload } from "../../types/property-cohost"
import { adminUiFormat } from "../../data/admin-ui"
import { useAdminProFeatureGate } from "../../composables/admin-pro-feature-context"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import AdminAlert from "./AdminAlert.vue"
import AdminConfirmDialog from "./AdminConfirmDialog.vue"
import AdminField from "./AdminField.vue"

const props = defineProps<{
  slug: string
}>()

const { ui, formatDate } = useAdminUi()
const ext = computed(() => ui.value.extended.cohosts)
const proFeatureGate = useAdminProFeatureGate()

const email = ref("")
const loading = ref(false)
const inviting = ref(false)
const error = ref("")
const notice = ref("")
const data = ref<PropertyCohostsPayload | null>(null)
const pendingRemoveMember = ref<PropertyCohostMember | null>(null)
const removingMember = ref(false)

const removeConfirmMessage = computed(() => {
  const member = pendingRemoveMember.value

  if (!member) {
    return ""
  }

  return adminUiFormat(ext.value.removeConfirmMessage, {
    email: member.email || member.user_id
  })
})

function fetchErrorMessage(err: unknown, fallback: string) {
  const e = err as { data?: { message?: string }; message?: string; statusCode?: number }

  return {
    message: e.data?.message || e.message || fallback,
    statusCode: e.statusCode
  }
}

async function authHeaders() {
  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    return {}
  }

  return { Authorization: `Bearer ${token}` }
}

async function loadCohosts() {
  loading.value = true
  error.value = ""

  try {
    data.value = await $fetch<PropertyCohostsPayload>(`/api/admin/${props.slug}/cohosts`, {
      headers: await authHeaders()
    })
  } catch (err: unknown) {
    const { message } = fetchErrorMessage(err, "Impossible de charger les co-hôtes.")

    error.value = message
    data.value = { members: [], invitations: [] }
  } finally {
    loading.value = false
  }
}

const canInviteCohosts = computed(() => proFeatureGate.isProPlan.value)

async function sendInvite() {
  if (!proFeatureGate.requireProFeature("cohosts")) {
    return
  }

  inviting.value = true
  error.value = ""
  notice.value = ""

  try {
    await $fetch(`/api/admin/${props.slug}/cohosts/invite`, {
      method: "POST",
      headers: await authHeaders(),
      body: { email: email.value }
    })

    email.value = ""
    notice.value = ext.value.inviteSent
    await loadCohosts()
  } catch (err: unknown) {
    const { message, statusCode } = fetchErrorMessage(
      err,
      "Impossible d’envoyer l’invitation."
    )

    if (statusCode === 402) {
      proFeatureGate.openProUpgrade("cohosts")
      return
    }

    error.value = message
  } finally {
    inviting.value = false
  }
}

async function removeMember(memberId: string) {
  error.value = ""
  notice.value = ""

  try {
    await $fetch(`/api/admin/${props.slug}/cohosts/${memberId}`, {
      method: "DELETE",
      headers: await authHeaders()
    })

    notice.value = ext.value.memberRemoved
    await loadCohosts()
  } catch (err: unknown) {
    const { message } = fetchErrorMessage(err, "Action impossible.")

    error.value = message
  }
}

function openRemoveMemberConfirm(member: PropertyCohostMember) {
  pendingRemoveMember.value = member
}

function closeRemoveMemberConfirm() {
  if (removingMember.value) {
    return
  }

  pendingRemoveMember.value = null
}

async function confirmRemoveMember() {
  const member = pendingRemoveMember.value

  if (!member) {
    return
  }

  removingMember.value = true
  error.value = ""
  notice.value = ""

  try {
    await removeMember(member.id)
    pendingRemoveMember.value = null
  } finally {
    removingMember.value = false
  }
}

async function revokeInvitation(invitationId: string) {
  error.value = ""
  notice.value = ""

  try {
    await $fetch(`/api/admin/${props.slug}/cohosts/invitations/${invitationId}`, {
      method: "DELETE",
      headers: await authHeaders()
    })

    notice.value = ext.value.inviteRevoked
    await loadCohosts()
  } catch (err: unknown) {
    const { message } = fetchErrorMessage(err, "Action impossible.")

    error.value = message
  }
}

onMounted(() => {
  void loadCohosts()
})
</script>

<template>
  <div class="admin-cohosts-panel admin-subpanel admin-cohosts-page">
    <div class="admin-subpanel__head">
      <div>
        <p class="admin-general-card__kicker">{{ ext.kicker }}</p>
        <h3>{{ ext.title }}</h3>
        <p class="admin-account__lead">{{ ext.description }}</p>
      </div>
      <UserPlus :size="22" aria-hidden="true" />
    </div>

    <AdminAlert v-if="error" variant="error">{{ error }}</AdminAlert>
    <AdminAlert v-if="notice" variant="success">{{ notice }}</AdminAlert>

    <p v-if="!canInviteCohosts" class="admin-cohosts-premium-hint">
      {{ ext.inviteRequiresPremium }}
      <button type="button" class="admin-cohosts-premium-hint__link" @click="proFeatureGate.openProUpgrade('cohosts')">
        {{ ext.lockedCta }}
      </button>
    </p>

    <form class="admin-cohosts-invite" @submit.prevent="sendInvite">
      <AdminField
        v-model="email"
        :label="ext.emailLabel"
        type="email"
        required
        full-width
        :placeholder="ext.emailPlaceholder"
      />
      <button type="submit" class="admin-btn admin-btn--primary" :disabled="inviting || !email.trim()">
        {{ inviting ? ext.inviting : ext.inviteCta }}
      </button>
    </form>

    <div v-if="loading" class="admin-cohosts-loading" aria-live="polite">…</div>

    <template v-else-if="data">
      <section class="admin-cohosts-section">
        <h4>{{ ext.membersTitle }}</h4>
        <p v-if="!data.members.length" class="admin-cohosts-empty">{{ ext.emptyMembers }}</p>
        <ul v-else class="admin-cohosts-list">
          <li v-for="member in data.members" :key="member.id" class="admin-cohosts-item">
            <span class="admin-cohosts-item__email">{{ member.email || member.user_id }}</span>
            <button
              type="button"
              class="admin-btn admin-btn--ghost"
              @click="openRemoveMemberConfirm(member)"
            >
              {{ ext.removeMember }}
            </button>
          </li>
        </ul>
      </section>

      <section class="admin-cohosts-section">
        <h4>{{ ext.pendingTitle }}</h4>
        <p v-if="!data.invitations.length" class="admin-cohosts-empty">{{ ext.emptyPending }}</p>
        <ul v-else class="admin-cohosts-list">
          <li
            v-for="invitation in data.invitations"
            :key="invitation.id"
            class="admin-cohosts-item"
          >
            <span class="admin-cohosts-item__meta">
              <span class="admin-cohosts-item__email">{{ invitation.email }}</span>
              <span class="admin-cohosts-item__hint">
                {{
                  adminUiFormat(ext.expiresOn, {
                    date: formatDate(invitation.expires_at, { dateStyle: "medium" })
                  })
                }}
              </span>
            </span>
            <button
              type="button"
              class="admin-btn admin-btn--ghost"
              @click="revokeInvitation(invitation.id)"
            >
              {{ ext.revokeInvite }}
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>

  <AdminConfirmDialog
    :open="Boolean(pendingRemoveMember)"
    :title="ext.removeConfirmTitle"
    :message="removeConfirmMessage"
    :confirm-label="ext.removeConfirmCta"
    :cancel-label="ui.common.cancel"
    :loading="removingMember"
    variant="danger"
    @cancel="closeRemoveMemberConfirm"
    @confirm="confirmRemoveMember"
  />
</template>
