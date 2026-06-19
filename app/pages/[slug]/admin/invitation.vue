<script setup lang="ts">
import { Loader2 } from "@lucide/vue"
import AdminAlert from "../../../components/admin/AdminAlert.vue"
import HostivPasswordRulesChecklist from "../../../components/HostivPasswordRulesChecklist.vue"
import type { CohostInviteValidatePayload } from "../../../types/property-cohost"
import { adminUiFormat } from "../../../data/admin-ui"
import { isHostivPasswordValid } from "../../../utils/hostiv-password-rules"
import { useSupabaseClient } from "../../../composables/useSupabaseClient"

definePageMeta({
  ssr: false,
  validate(route) {
    const slug = route.params.slug

    return typeof slug === "string" && slug.length > 0 && slug.toLowerCase() !== "admin"
  }
})

const route = useRoute()
const router = useRouter()
const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)
const cohostUi = computed(() => ext.value.cohosts)
const accountUi = computed(() => ext.value.account)
const loginUi = computed(() => ui.value.login)

const token = computed(() => String(route.query.token || "").trim())

const loading = ref(true)
const accepting = ref(false)
const signingIn = ref(false)
const registering = ref(false)
const error = ref("")
const invite = ref<CohostInviteValidatePayload | null>(null)
const authenticated = ref(false)
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const firstName = ref("")
const lastName = ref("")
const passwordFieldFocused = ref(false)

const accountExists = computed(() => invite.value?.account_exists === true)

const inviteLead = computed(() => {
  if (!invite.value?.valid || !invite.value.brand_name || !invite.value.slug) {
    return ""
  }

  return adminUiFormat(cohostUi.value.invitePageLead, {
    brand: invite.value.brand_name,
    slug: invite.value.slug
  })
})

const inviteHint = computed(() => {
  if (!invite.value?.email) {
    return ""
  }

  if (accountExists.value) {
    return adminUiFormat(cohostUi.value.invitePageEmailHint, {
      email: invite.value.email
    })
  }

  return cohostUi.value.invitePageCreateHint
})

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (password.value.length > 0 && !isHostivPasswordValid(password.value))
)

function onPasswordFocus(event: FocusEvent) {
  passwordFieldFocused.value = true

  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: "nearest", behavior: "smooth" })
  })
}

function fetchErrorMessage(err: unknown, fallback: string) {
  const e = err as { data?: { message?: string }; message?: string }

  return e.data?.message || e.message || fallback
}

async function authHeaders() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  if (!accessToken) {
    return {}
  }

  return { Authorization: `Bearer ${accessToken}` }
}

async function loadInvite() {
  if (!token.value) {
    error.value = cohostUi.value.invitePageInvalidToken
    loading.value = false
    return
  }

  try {
    invite.value = await $fetch<CohostInviteValidatePayload>("/api/hostiv/cohost-invite/validate", {
      query: { token: token.value }
    })

    if (invite.value?.email) {
      email.value = invite.value.email
    }
  } catch {
    error.value = cohostUi.value.invitePageVerifyFailed
  } finally {
    loading.value = false
  }
}

async function refreshSession() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  authenticated.value = Boolean(data.session?.access_token)
}

async function sessionMatchesInviteEmail() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const sessionEmail = data.session?.user.email?.trim().toLowerCase() ?? ""
  const inviteEmail = invite.value?.email?.trim().toLowerCase() ?? ""

  return Boolean(sessionEmail && inviteEmail && sessionEmail === inviteEmail)
}

async function acceptInvite() {
  if (!token.value) {
    return
  }

  accepting.value = true
  error.value = ""

  try {
    const result = await $fetch<{ ok: boolean; slug: string }>("/api/hostiv/cohost-invite/accept", {
      method: "POST",
      headers: await authHeaders(),
      body: { token: token.value }
    })

    await router.replace(`/${result.slug}/admin`)
  } catch (err: unknown) {
    error.value = fetchErrorMessage(err, cohostUi.value.invitePageAcceptFailed)
  } finally {
    accepting.value = false
  }
}

async function signInAndAccept() {
  signingIn.value = true
  error.value = ""

  try {
    const supabase = useSupabaseClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (signInError) {
      throw new Error(signInError.message)
    }

    authenticated.value = true
    await acceptInvite()
  } catch (err: unknown) {
    error.value = fetchErrorMessage(err, cohostUi.value.invitePageSignInFailed)
  } finally {
    signingIn.value = false
  }
}

async function registerAndAccept() {
  error.value = ""

  if (!isHostivPasswordValid(password.value)) {
    error.value = accountUi.value.errors.passwordInvalid
    passwordFieldFocused.value = true
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = accountUi.value.errors.passwordMismatch
    return
  }

  if (!firstName.value.trim()) {
    error.value = cohostUi.value.invitePageFirstNameRequired
    return
  }

  registering.value = true

  try {
    const result = await $fetch<{ ok: boolean; slug: string }>("/api/hostiv/cohost-invite/register", {
      method: "POST",
      body: {
        token: token.value,
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        password: password.value
      }
    })

    const supabase = useSupabaseClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (signInError) {
      await router.replace(`/${result.slug}/admin`)
      return
    }

    await router.replace(`/${result.slug}/admin`)
  } catch (err: unknown) {
    error.value = fetchErrorMessage(err, cohostUi.value.invitePageAcceptFailed)
  } finally {
    registering.value = false
  }
}

const invalidMessage = computed(() => {
  if (invite.value?.already_accepted) {
    return cohostUi.value.invitePageAlreadyAccepted
  }

  if (invite.value?.expired) {
    return cohostUi.value.invitePageExpired
  }

  return error.value || cohostUi.value.invitePageInvalid
})

useHead({
  bodyAttrs: {
    class: "admin-route"
  }
})

onMounted(async () => {
  await refreshSession()
  await loadInvite()

  if (authenticated.value && invite.value?.valid && (await sessionMatchesInviteEmail())) {
    await acceptInvite()
  }
})
</script>

<template>
  <main class="admin-page admin-cohost-invite-page">
    <div class="hostiv-modal__panel hostiv-modal__panel--login admin-cohost-invite-card">
      <span class="hostiv-modal__accent" aria-hidden="true" />
      <span class="hostiv-modal__glow" aria-hidden="true" />

      <header class="hostiv-modal__head">
        <span class="hostiv-modal__logo" aria-hidden="true">
          <img
            src="/hostiv/logo-mark.svg"
            alt=""
            width="40"
            height="40"
            class="hostiv-modal__logo-img"
          />
        </span>
        <div class="hostiv-modal__head-text">
          <h1 id="admin-cohost-invite-title" class="hostiv-modal__title">
            {{ cohostUi.title }}
          </h1>
          <p v-if="loading" class="hostiv-modal__subtitle">
            {{ cohostUi.invitePageChecking }}
          </p>
          <p v-else-if="invite?.valid" class="hostiv-modal__subtitle">
            {{ inviteLead }}
          </p>
        </div>
      </header>

      <div v-if="loading" class="hostiv-modal__session-check" aria-live="polite">
        <Loader2 :size="28" stroke-width="1.75" class="hostiv-modal__submit-spinner" />
        <p>{{ cohostUi.invitePageChecking }}</p>
      </div>

      <template v-else-if="invite?.valid">
        <p v-if="inviteHint" class="admin-cohost-invite-card__hint">
          {{ inviteHint }}
        </p>

        <AdminAlert v-if="error && authenticated" variant="error">{{ error }}</AdminAlert>

        <button
          v-if="authenticated"
          type="button"
          class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
          :disabled="accepting"
          @click="acceptInvite"
        >
          <Loader2
            v-if="accepting"
            :size="18"
            stroke-width="2"
            class="hostiv-modal__submit-spinner"
            aria-hidden="true"
          />
          {{ accepting ? cohostUi.invitePageAccepting : cohostUi.invitePageAcceptCta }}
        </button>

        <form
          v-else-if="accountExists"
          class="hostiv-modal__form"
          @submit.prevent="signInAndAccept"
        >
          <label class="hostiv-modal__field">
            <span>{{ loginUi.email }}</span>
            <input
              v-model="email"
              type="email"
              required
              readonly
              autocomplete="email"
              :placeholder="loginUi.emailPlaceholder"
            />
          </label>
          <label class="hostiv-modal__field">
            <span>{{ loginUi.password }}</span>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              :placeholder="loginUi.passwordPlaceholder"
            />
          </label>

          <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

          <button
            type="submit"
            class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
            :disabled="signingIn"
          >
            <Loader2
              v-if="signingIn"
              :size="18"
              stroke-width="2"
              class="hostiv-modal__submit-spinner"
              aria-hidden="true"
            />
            {{ signingIn ? cohostUi.invitePageSigningIn : cohostUi.invitePageSignInCta }}
          </button>
        </form>

        <form v-else class="hostiv-modal__form" @submit.prevent="registerAndAccept">
          <label class="hostiv-modal__field">
            <span>{{ accountUi.fields.firstName }}</span>
            <input
              v-model="firstName"
              type="text"
              required
              autocomplete="given-name"
              :placeholder="accountUi.fields.firstName"
            />
          </label>
          <label class="hostiv-modal__field">
            <span>{{ accountUi.fields.lastName }}</span>
            <input
              v-model="lastName"
              type="text"
              autocomplete="family-name"
              :placeholder="accountUi.fields.lastName"
            />
          </label>
          <label class="hostiv-modal__field">
            <span>{{ accountUi.fields.email }}</span>
            <input
              v-model="email"
              type="email"
              required
              readonly
              autocomplete="email"
            />
          </label>
          <div class="hostiv-modal__field hostiv-modal__field--password">
            <label class="hostiv-modal__field-label" for="admin-cohost-invite-password">
              {{ loginUi.password }}
            </label>
            <input
              id="admin-cohost-invite-password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              :placeholder="loginUi.passwordPlaceholder"
              aria-describedby="admin-cohost-invite-password-rules"
              @focus="onPasswordFocus"
              @blur="passwordFieldFocused = false"
            />
            <HostivPasswordRulesChecklist
              id="admin-cohost-invite-password-rules"
              variant="hostiv"
              :password="password"
              :visible="showPasswordRules"
            />
          </div>
          <label class="hostiv-modal__field">
            <span>{{ cohostUi.invitePageConfirmPassword }}</span>
            <input
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
            />
          </label>

          <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

          <button
            type="submit"
            class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
            :disabled="registering"
          >
            <Loader2
              v-if="registering"
              :size="18"
              stroke-width="2"
              class="hostiv-modal__submit-spinner"
              aria-hidden="true"
            />
            {{ registering ? cohostUi.invitePageCreating : cohostUi.invitePageCreateCta }}
          </button>
        </form>
      </template>

      <AdminAlert v-else variant="error">
        {{ invalidMessage }}
      </AdminAlert>
    </div>
  </main>
</template>

<style src="../../../../assets/css/pages/admin/admin.css"></style>
