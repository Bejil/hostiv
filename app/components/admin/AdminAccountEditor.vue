<script setup lang="ts">
import AdminAlert from "./AdminAlert.vue"
import AdminAccountDeleteModal from "./AdminAccountDeleteModal.vue"
import AdminField from "./AdminField.vue"
import HostivPasswordRulesChecklist from "../HostivPasswordRulesChecklist.vue"
import type { HostivAccountProfile } from "../../types/hostiv-account"
import { isHostivPasswordValid } from "../../utils/hostiv-password-rules"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  slug: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const profile = ref<HostivAccountProfile | null>(null)
const firstName = ref("")
const lastName = ref("")
const email = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const passwordFieldFocused = ref(false)
const deleteConfirmSlug = ref("")

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const deleteModalOpen = ref(false)
const deleteError = ref<string | null>(null)

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (newPassword.value.length > 0 && !isHostivPasswordValid(newPassword.value))
)

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function loadProfile() {
  loading.value = true
  error.value = null

  try {
    const headers = await authHeaders()
    const data = await $fetch<HostivAccountProfile>(`/api/admin/${props.slug}/account`, { headers })

    profile.value = data
    firstName.value = data.first_name
    lastName.value = data.last_name
    email.value = data.email
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || "Impossible de charger votre compte."
  } finally {
    loading.value = false
  }
}

async function onSave() {
  error.value = null
  success.value = null

  if (newPassword.value) {
    if (!isHostivPasswordValid(newPassword.value)) {
      error.value = "Choisissez un mot de passe qui respecte tous les critères de sécurité."
      passwordFieldFocused.value = true
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      error.value = "Les deux mots de passe ne correspondent pas."
      return
    }
  } else if (confirmPassword.value) {
    error.value = "Saisissez le nouveau mot de passe ou videz la confirmation."
    return
  }

  saving.value = true

  try {
    const headers = await authHeaders()
    const body: Record<string, string> = {
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email: email.value.trim()
    }

    const passwordChanged = Boolean(newPassword.value)

    if (passwordChanged) {
      body.password = newPassword.value
    }

    const result = await $fetch<{ profile: HostivAccountProfile; emailChanged: boolean }>(
      `/api/admin/${props.slug}/account`,
      {
        method: "PATCH",
        headers,
        body
      }
    )

    profile.value = result.profile
    firstName.value = result.profile.first_name
    lastName.value = result.profile.last_name
    email.value = result.profile.email
    newPassword.value = ""
    confirmPassword.value = ""
    passwordFieldFocused.value = false

    const supabase = useSupabaseClient()

    if (result.emailChanged || passwordChanged) {
      await supabase.auth.refreshSession()
    }

    success.value = result.emailChanged
      ? "Compte mis à jour. Si vous changez d’e-mail, utilisez la nouvelle adresse pour vous reconnecter."
      : "Compte mis à jour."
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || "Impossible d’enregistrer les modifications."
  } finally {
    saving.value = false
  }
}

function openDeleteModal() {
  deleteError.value = null
  deleteConfirmSlug.value = ""
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (deleting.value) {
    return
  }

  deleteModalOpen.value = false
  deleteConfirmSlug.value = ""
  deleteError.value = null
}

async function onDeleteAccount() {
  deleteError.value = null

  if (deleteConfirmSlug.value.trim().toLowerCase() !== props.slug.trim().toLowerCase()) {
    deleteError.value = `Saisissez exactement « ${props.slug} » pour confirmer.`
    return
  }

  deleting.value = true

  try {
    const headers = await authHeaders()

    await $fetch(`/api/admin/${props.slug}/account`, {
      method: "DELETE",
      headers,
      body: { confirm_slug: deleteConfirmSlug.value.trim() }
    })

    const supabase = useSupabaseClient()

    await supabase.auth.signOut()
    deleteModalOpen.value = false
    emit("deleted")
    await navigateTo("/")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    deleteError.value = e.data?.message || e.message || "Impossible de supprimer le compte."
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="admin-account">
    <p v-if="loading" class="admin-account__loading">Chargement…</p>

    <template v-else>
      <AdminAlert v-if="error" variant="error" :message="error" />
      <AdminAlert v-if="success" variant="success" :message="success" />

      <form class="admin-account__form" @submit.prevent="onSave">
        <div class="admin-subpanel admin-account__panel">
          <div class="admin-subpanel__head">
            <div>
              <h3>Identité</h3>
              <p class="admin-account__lead">
                Ces informations sont liées à votre compte Hostiv (connexion au backoffice).
              </p>
            </div>
          </div>

          <div class="admin-account__fields">
            <AdminField v-model="firstName" label="Prénom" autocomplete="given-name" required />
            <AdminField v-model="lastName" label="Nom" autocomplete="family-name" />
            <AdminField
              v-model="email"
              label="E-mail"
              type="email"
              autocomplete="email"
              required
              full-width
            />
          </div>
        </div>

        <div class="admin-subpanel admin-account__panel">
          <div class="admin-subpanel__head">
            <div>
              <h3>Mot de passe</h3>
              <p class="admin-account__lead">Laissez vide pour conserver le mot de passe actuel.</p>
            </div>
          </div>

          <div class="admin-account__password-block">
            <label class="admin-field admin-field--full" for="admin-account-new-password">
              <span class="admin-field__label">Nouveau mot de passe</span>
              <input
                id="admin-account-new-password"
                v-model="newPassword"
                class="admin-field__control"
                type="password"
                autocomplete="new-password"
                aria-describedby="admin-account-password-rules"
                @focus="passwordFieldFocused = true"
                @blur="passwordFieldFocused = false"
              />
            </label>

            <HostivPasswordRulesChecklist
              id="admin-account-password-rules"
              variant="admin"
              :password="newPassword"
              :visible="showPasswordRules"
            />

            <AdminField
              v-model="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              autocomplete="new-password"
              full-width
            />
          </div>
        </div>

        <div class="admin-account__actions">
          <button
            type="submit"
            class="admin-btn admin-btn--primary"
            :disabled="saving || deleting"
            @mousedown.prevent
          >
            {{ saving ? "Enregistrement…" : "Enregistrer le compte" }}
          </button>
        </div>
      </form>

      <section class="admin-account__danger-zone" aria-labelledby="admin-account-danger-title">
        <div class="admin-account__danger-head">
          <h3 id="admin-account-danger-title">Zone de danger</h3>
          <p class="admin-account__lead">
            La suppression de votre compte efface définitivement votre site, vos données et votre
            accès Hostiv.
          </p>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--danger-ghost"
          :disabled="saving || deleting"
          @click="openDeleteModal"
        >
          Supprimer mon compte…
        </button>
      </section>

      <AdminAccountDeleteModal
        :open="deleteModalOpen"
        :slug="slug"
        :loading="deleting"
        :error="deleteError"
        :confirm-slug="deleteConfirmSlug"
        @update:confirm-slug="deleteConfirmSlug = $event"
        @cancel="closeDeleteModal"
        @confirm="onDeleteAccount"
      />
    </template>
  </div>
</template>
