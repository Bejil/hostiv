<script setup lang="ts">
import AdminAlert from "./AdminAlert.vue"
import AdminField from "./AdminField.vue"
import HostivPasswordRulesChecklist from "../HostivPasswordRulesChecklist.vue"
import type { HostivAccountProfile } from "../../types/hostiv-account"
import { isHostivPasswordValid } from "../../utils/hostiv-password-rules"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = withDefaults(
  defineProps<{
    slug: string
    formId?: string
    showActions?: boolean
    embedded?: boolean
  }>(),
  {
    formId: "admin-account-form",
    showActions: true,
    embedded: false
  }
)

const emit = defineEmits<{
  "request-delete": []
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const profile = ref<HostivAccountProfile | null>(null)
const firstName = ref("")
const lastName = ref("")
const email = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const passwordFieldFocused = ref(false)

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

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

    error.value = e.data?.message || e.message || ext.value.account.loadFailed
  } finally {
    loading.value = false
  }
}

async function onSave() {
  error.value = null
  success.value = null

  if (newPassword.value) {
    if (!isHostivPasswordValid(newPassword.value)) {
      error.value = ext.value.account.errors.passwordInvalid
      passwordFieldFocused.value = true
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      error.value = ext.value.account.errors.passwordMismatch
      return
    }
  } else if (confirmPassword.value) {
    error.value = ext.value.account.errors.passwordConfirmEmpty
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
      ? ext.value.account.success.emailChanged
      : ext.value.account.success.updated
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.account.errors.saveFailed
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="admin-account" :class="{ 'admin-account--modal': embedded }">
    <p v-if="loading" class="admin-account__loading">{{ ext.account.loading }}</p>

    <template v-else>
      <AdminAlert v-if="error" variant="error" :message="error" />
      <AdminAlert v-if="success" variant="success" :message="success" />

      <form :id="props.formId" class="admin-account__form" @submit.prevent="onSave">
        <div class="admin-subpanel admin-account__panel">
          <div class="admin-subpanel__head">
            <div>
              <h3>{{ ext.account.identityTitle }}</h3>
              <p class="admin-account__lead">
                {{ ext.account.identityLead }}
              </p>
            </div>
          </div>

          <div class="admin-account__fields">
            <AdminField
              v-model="firstName"
              :label="ext.account.fields.firstName"
              autocomplete="given-name"
              required
            />
            <AdminField
              v-model="lastName"
              :label="ext.account.fields.lastName"
              autocomplete="family-name"
            />
            <AdminField
              v-model="email"
              :label="ext.account.fields.email"
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
              <h3>{{ ext.account.passwordTitle }}</h3>
              <p class="admin-account__lead">{{ ext.account.passwordLead }}</p>
            </div>
          </div>

          <div class="admin-account__password-block">
            <label class="admin-field admin-field--full" for="admin-account-new-password">
              <span class="admin-field__label">{{ ext.account.newPassword }}</span>
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
              :variant="embedded ? 'hostiv' : 'admin'"
              :password="newPassword"
              :visible="showPasswordRules"
            />

            <AdminField
              v-model="confirmPassword"
              :label="ext.account.confirmPassword"
              type="password"
              autocomplete="new-password"
              full-width
            />
          </div>
        </div>

        <div v-if="props.showActions" class="admin-account__actions">
          <button
            type="submit"
            class="admin-btn admin-btn--primary"
            :disabled="saving"
            @mousedown.prevent
          >
            {{ saving ? ui.common.saving : ext.account.saveAccount }}
          </button>
        </div>
      </form>

      <section class="admin-account__danger-zone" aria-labelledby="admin-account-danger-title">
        <div class="admin-account__danger-head">
          <h3 id="admin-account-danger-title">{{ ext.account.dangerTitle }}</h3>
          <p class="admin-account__lead">
            {{ ext.account.dangerLead }}
          </p>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--danger-ghost"
          :disabled="saving"
          @click="emit('request-delete')"
        >
          {{ ext.account.deleteAccount }}
        </button>
      </section>
    </template>
  </div>
</template>
