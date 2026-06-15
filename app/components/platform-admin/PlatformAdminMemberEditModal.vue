<script setup lang="ts">
import { Loader2, X } from "@lucide/vue"
import HostivPasswordRulesChecklist from "../HostivPasswordRulesChecklist.vue"
import type { HostivAccountProfile } from "../../types/hostiv-account"
import { isHostivPasswordValid } from "../../utils/hostiv-password-rules"

const props = defineProps<{
  open: boolean
  userId: string | null
  stacked?: boolean
  platformRequest: (
    path: string,
    options?: { method?: "GET" | "DELETE" | "PATCH" | "POST"; body?: unknown }
  ) => Promise<unknown>
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { ui } = usePlatformAdminUi()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const passwordFieldFocused = ref(false)

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (newPassword.value.length > 0 && !isHostivPasswordValid(newPassword.value))
)

watch(
  () => [props.open, props.userId] as const,
  ([isOpen, userId]) => {
    if (isOpen && userId) {
      void loadProfile(userId)
    }
  },
  { immediate: true }
)

async function loadProfile(userId: string) {
  loading.value = true
  error.value = null
  success.value = null
  newPassword.value = ""
  confirmPassword.value = ""

  try {
    const profile = await props.platformRequest<HostivAccountProfile>(
      `/api/platform-admin/members/${encodeURIComponent(userId)}`
    )

    firstName.value = profile.first_name
    lastName.value = profile.last_name
    email.value = profile.email
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.members.editModal.loadFailed
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!props.userId) {
    return
  }

  error.value = null
  success.value = null

  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    error.value = ui.value.members.editModal.passwordMismatch
    return
  }

  if (newPassword.value && !isHostivPasswordValid(newPassword.value)) {
    error.value = ui.value.members.editModal.passwordInvalid
    return
  }

  saving.value = true

  try {
    await props.platformRequest(`/api/platform-admin/members/${encodeURIComponent(props.userId)}`, {
      method: "PATCH",
      body: {
        first_name: firstName.value,
        last_name: lastName.value,
        email: email.value,
        ...(newPassword.value ? { password: newPassword.value } : {})
      }
    })

    success.value = ui.value.members.editModal.saved
    emit("saved")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.members.editModal.saveFailed
  } finally {
    saving.value = false
  }
}

function onClose() {
  if (saving.value) {
    return
  }

  emit("close")
}

function onBackdropClick(event: MouseEvent) {
  if (saving.value || loading.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    onClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--login"
        :class="{ 'hostiv-modal--stacked': stacked }"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--account"
            role="dialog"
            aria-modal="true"
            aria-labelledby="platform-admin-member-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :disabled="saving || loading"
              :aria-label="ui.common.close"
              @click="onClose"
            >
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="platform-admin-member-edit-title" class="hostiv-modal__title">
                  {{ ui.members.editModal.title }}
                </h2>
                <p class="hostiv-modal__subtitle">{{ ui.members.editModal.subtitle }}</p>
              </div>
            </header>

            <div v-if="loading" class="platform-admin-modal-loading">
              <Loader2 class="platform-admin-login-gate__spinner" aria-hidden="true" />
              <p>{{ ui.shell.loading }}</p>
            </div>

            <form v-else class="hostiv-modal__body" @submit.prevent="onSave">
              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>
              <p v-if="success" class="platform-admin-modal-success" role="status">{{ success }}</p>

              <label class="hostiv-modal__field">
                <span>{{ ui.members.editModal.firstName }}</span>
                <input v-model="firstName" type="text" required :disabled="saving" />
              </label>

              <label class="hostiv-modal__field">
                <span>{{ ui.members.editModal.lastName }}</span>
                <input v-model="lastName" type="text" :disabled="saving" />
              </label>

              <label class="hostiv-modal__field">
                <span>{{ ui.members.editModal.email }}</span>
                <input v-model="email" type="email" required :disabled="saving" />
              </label>

              <label class="hostiv-modal__field">
                <span>{{ ui.members.editModal.newPassword }}</span>
                <input
                  v-model="newPassword"
                  type="password"
                  autocomplete="new-password"
                  :disabled="saving"
                  @focus="passwordFieldFocused = true"
                  @blur="passwordFieldFocused = false"
                />
              </label>

              <HostivPasswordRulesChecklist v-if="showPasswordRules" :password="newPassword" />

              <label v-if="newPassword" class="hostiv-modal__field">
                <span>{{ ui.members.editModal.confirmPassword }}</span>
                <input
                  v-model="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  :disabled="saving"
                />
              </label>

              <footer class="platform-admin-modal-footer">
                <button type="button" class="hostiv-btn hostiv-btn--secondary" :disabled="saving" @click="onClose">
                  {{ ui.common.cancel }}
                </button>
                <button type="submit" class="hostiv-btn hostiv-btn--primary" :disabled="saving">
                  <Loader2 v-if="saving" class="platform-admin-login-gate__spinner" aria-hidden="true" />
                  {{ saving ? ui.common.saving : ui.common.save }}
                </button>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.platform-admin-modal-loading,
.platform-admin-modal-footer {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.platform-admin-modal-loading {
  padding: 1rem 0 1.5rem;
  color: var(--admin-muted, #6a7c76);
}

.platform-admin-modal-footer {
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.platform-admin-modal-success {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 0.55rem;
  background: var(--admin-success-bg, #ecfdf5);
  color: var(--admin-success, #067a57);
  font-size: 0.8125rem;
}
</style>
