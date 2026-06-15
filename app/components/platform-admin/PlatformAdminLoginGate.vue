<script setup lang="ts">
import { Loader2 } from "@lucide/vue"

defineProps<{
  checking: boolean
  submitting: boolean
  error: string | null
}>()

const email = defineModel<string>("email", { required: true })
const password = defineModel<string>("password", { required: true })

const emit = defineEmits<{
  submit: []
}>()

const { ui } = usePlatformAdminUi()
</script>

<template>
  <section class="platform-admin-login-gate" aria-labelledby="platform-admin-login-title">
    <div class="platform-admin-login-gate__card">
      <header class="platform-admin-login-gate__head">
        <img src="/hostiv/logo-mark.svg" alt="" width="44" height="44" class="platform-admin-login-gate__logo" />
        <div>
          <h2 id="platform-admin-login-title" class="platform-admin-login-gate__title">
            {{ checking ? ui.login.checking : ui.login.title }}
          </h2>
          <p class="platform-admin-login-gate__subtitle">{{ ui.login.subtitle }}</p>
        </div>
      </header>

      <div v-if="checking" class="platform-admin-login-gate__checking" aria-live="polite">
        <Loader2 class="platform-admin-login-gate__spinner" aria-hidden="true" />
        <p>{{ ui.login.checking }}</p>
      </div>

      <form v-else class="platform-admin-login-gate__form" @submit.prevent="emit('submit')">
        <p v-if="error" class="platform-admin-login-gate__error" role="alert">{{ error }}</p>

        <label class="platform-admin-login-gate__field">
          <span>{{ ui.login.email }}</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            required
            :disabled="submitting"
          />
        </label>

        <label class="platform-admin-login-gate__field">
          <span>{{ ui.login.password }}</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            :disabled="submitting"
          />
        </label>

        <button type="submit" class="platform-admin-login-gate__submit" :disabled="submitting">
          <Loader2 v-if="submitting" class="platform-admin-login-gate__spinner" aria-hidden="true" />
          {{ ui.login.submit }}
        </button>
      </form>
    </div>
  </section>
</template>
