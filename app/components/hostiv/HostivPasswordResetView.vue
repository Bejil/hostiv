<script setup lang="ts">
import { Loader2 } from "@lucide/vue"
import HostivFooter from "./HostivFooter.vue"
import HostivNav from "./HostivNav.vue"
import HostivAccountModal from "./HostivAccountModal.vue"
import HostivPasswordRulesChecklist from "../HostivPasswordRulesChecklist.vue"
import { isHostivPasswordValid } from "../../utils/hostiv-password-rules"

const route = useRoute()
const { landing, homePath } = useHostivLocale()
const { openLogin } = useHostivAccountModal()
const copy = computed(() => landing.value.passwordResetPage)

const token = computed(() => String(route.query.token || "").trim())

const status = ref<"loading" | "ready" | "success" | "unavailable" | "error">("loading")
const errorMessage = ref("")
const password = ref("")
const confirmPassword = ref("")
const passwordFieldFocused = ref(false)
const submitting = ref(false)

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (password.value.length > 0 && !isHostivPasswordValid(password.value))
)

useHead(() => ({
  title: copy.value.seoTitle
}))

async function loadToken() {
  if (!token.value) {
    status.value = "error"
    errorMessage.value = copy.value.errors.incompleteLink
    return
  }

  status.value = "loading"

  try {
    const result = await $fetch<{ valid: boolean; expired: boolean }>(
      "/api/hostiv/password-reset/validate",
      {
        query: { token: token.value }
      }
    )

    if (result.valid) {
      status.value = "ready"
      return
    }

    status.value = "unavailable"
    errorMessage.value = result.expired
      ? copy.value.errors.expiredLink
      : copy.value.errors.invalidLink
  } catch {
    status.value = "error"
    errorMessage.value = copy.value.errors.loadFailed
  }
}

async function submitReset() {
  if (!isHostivPasswordValid(password.value)) {
    errorMessage.value = copy.value.errors.passwordInvalid
    passwordFieldFocused.value = true
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = copy.value.errors.passwordMismatch
    return
  }

  submitting.value = true
  errorMessage.value = ""

  try {
    await $fetch("/api/hostiv/password-reset/confirm", {
      method: "POST",
      body: {
        token: token.value,
        password: password.value
      }
    })

    status.value = "success"
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string; statusCode?: number }

    if (e.statusCode === 410) {
      status.value = "unavailable"
      errorMessage.value = copy.value.errors.expiredLink
      return
    }

    if (e.statusCode === 404) {
      status.value = "unavailable"
      errorMessage.value = copy.value.errors.invalidLink
      return
    }

    if (e.statusCode === 400) {
      errorMessage.value = copy.value.errors.passwordInvalid
      return
    }

    errorMessage.value = copy.value.errors.saveFailed
  } finally {
    submitting.value = false
  }
}

function openLoginModal() {
  openLogin()
}

onMounted(() => {
  void loadToken()
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-section hostiv-section--green">
      <div class="hostiv-container hostiv-password-reset">
        <div v-if="status === 'loading'" class="hostiv-password-reset__card" role="status">
          <Loader2 :size="28" class="hostiv-password-reset__spinner" stroke-width="2" aria-hidden="true" />
          <h1 class="hostiv-h2">{{ copy.loading }}</h1>
        </div>

        <div v-else-if="status === 'success'" class="hostiv-password-reset__card">
          <h1 class="hostiv-h2">{{ copy.successTitle }}</h1>
          <p class="hostiv-password-reset__lead">{{ copy.successLead }}</p>
          <button type="button" class="hostiv-btn hostiv-btn--primary hostiv-password-reset__cta" @click="openLoginModal">
            {{ copy.openLogin }}
          </button>
        </div>

        <div v-else-if="status === 'ready'" class="hostiv-password-reset__card">
          <h1 class="hostiv-h2">{{ copy.title }}</h1>
          <p class="hostiv-password-reset__lead">{{ copy.subtitle }}</p>

          <form class="hostiv-password-reset__form" @submit.prevent="submitReset">
            <label class="hostiv-password-reset__field">
              <span>{{ landing.accountModal.fields.password }}</span>
              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                :placeholder="landing.accountModal.fields.passwordPlaceholderSignup"
                required
                @focus="passwordFieldFocused = true"
                @blur="passwordFieldFocused = false"
              />
            </label>

            <HostivPasswordRulesChecklist
              :password="password"
              :visible="showPasswordRules"
              id="hostiv-reset-password-rules"
            />

            <label class="hostiv-password-reset__field">
              <span>{{ copy.confirmPassword }}</span>
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="copy.confirmPasswordPlaceholder"
                required
              />
            </label>

            <p v-if="errorMessage" class="hostiv-password-reset__error" role="alert">{{ errorMessage }}</p>

            <button type="submit" class="hostiv-btn hostiv-btn--primary hostiv-password-reset__cta" :disabled="submitting">
              {{ submitting ? copy.submitting : copy.submit }}
            </button>
          </form>
        </div>

        <div v-else class="hostiv-password-reset__card">
          <h1 class="hostiv-h2">{{ copy.title }}</h1>
          <p class="hostiv-password-reset__lead">{{ errorMessage }}</p>
          <NuxtLink :to="homePath" class="hostiv-btn hostiv-btn--secondary hostiv-password-reset__cta">
            {{ copy.backHome }}
          </NuxtLink>
        </div>
      </div>
    </main>
    <HostivFooter />
    <HostivAccountModal />
  </div>
</template>

<style src="../../../assets/css/pages/hostiv/hostiv.css"></style>

<style>
.hostiv-password-reset {
  display: flex;
  justify-content: center;
  padding: 3rem 0 4rem;
}

.hostiv-password-reset__card {
  width: min(520px, 100%);
  padding: 2rem 1.75rem;
  border: 1px solid var(--h-border);
  border-radius: calc(var(--h-radius-lg) + 4px);
  background: #fff;
  box-shadow: var(--h-shadow-soft);
}

.hostiv-password-reset__card .hostiv-h2 {
  color: var(--h-ink);
}

.hostiv-password-reset__lead {
  margin: 0.75rem 0 0;
  color: var(--h-muted);
  line-height: 1.55;
}

.hostiv-password-reset__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.25rem;
}

.hostiv-password-reset__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.hostiv-password-reset__field span {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--h-ink-soft);
}

.hostiv-password-reset__field input {
  min-height: 3rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--h-border-strong);
  border-radius: var(--h-radius);
  background: #fff;
  color: var(--h-ink);
  font: inherit;
}

.hostiv-password-reset__error {
  margin: 0;
  color: #b42318;
  font-size: 0.875rem;
  line-height: 1.45;
}

.hostiv-password-reset__cta {
  width: 100%;
  justify-content: center;
  margin-top: 0.35rem;
}

.hostiv-password-reset__spinner {
  margin: 0 auto 1rem;
  color: var(--h-accent-deep);
  animation: hostiv-spin 0.8s linear infinite;
}
</style>
