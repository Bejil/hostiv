<script setup lang="ts">
import type { CSSProperties } from "vue"
import { Loader2, Send, X } from "@lucide/vue"
import type { HostivLocale } from "../../types/hostiv-locale"
import { getSiteGuestContactLabels } from "../../data/site-guest-contact-labels"

const props = defineProps<{
  open: boolean
  slug: string
  brandName: string
  locale: HostivLocale
  templateClass?: string
  themeStyle?: CSSProperties
  /** Aperçu propriétaire / live preview : autorise un site non publié via Bearer token. */
  useOwnerAuth?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const labels = computed(() => getSiteGuestContactLabels(props.locale))

const name = ref("")
const email = ref("")
const message = ref("")
const website = ref("")
const loading = ref(false)
const error = ref("")
const success = ref("")

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      error.value = ""
      success.value = ""
      document.body.style.overflow = "hidden"
      return
    }

    document.body.style.overflow = ""
  }
)

onUnmounted(() => {
  document.body.style.overflow = ""
})

function resetForm() {
  name.value = ""
  email.value = ""
  message.value = ""
  website.value = ""
}

function closeModal() {
  if (loading.value) {
    return
  }

  emit("close")
}

function onBackdropClick(event: MouseEvent) {
  if (loading.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    closeModal()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !loading.value) {
    closeModal()
  }
}

async function contactApiHeaders(): Promise<Record<string, string> | undefined> {
  if (!props.useOwnerAuth || typeof window === "undefined") {
    return undefined
  }

  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  let token = sessionData.session?.access_token

  if (!token) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    token = refreshed.session?.access_token
  }

  if (!token) {
    return undefined
  }

  return { Authorization: `Bearer ${token}` }
}

function readFetchErrorMessage(cause: unknown, fallback: string) {
  const fetchError = cause as {
    data?: { message?: string; statusMessage?: string }
    statusMessage?: string
    message?: string
  }

  return (
    fetchError.data?.message ||
    fetchError.data?.statusMessage ||
    fetchError.statusMessage ||
    fetchError.message ||
    fallback
  )
}

async function onSubmit() {
  error.value = ""
  success.value = ""

  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()
  const trimmedMessage = message.value.trim()

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    error.value = labels.value.errors.required
    return
  }

  if (trimmedName.length < 2) {
    error.value = labels.value.errors.nameTooShort
    return
  }

  if (trimmedMessage.length < 10) {
    error.value = labels.value.errors.messageTooShort
    return
  }

  loading.value = true

  try {
    const headers = await contactApiHeaders()

    if (props.useOwnerAuth && !headers) {
      error.value = labels.value.errors.sendFailed
      return
    }

    await $fetch(`/api/sites/${props.slug}/contact`, {
      method: "POST",
      headers,
      body: {
        propertySlug: props.slug,
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        website: website.value,
        locale: props.locale
      }
    })

    success.value = labels.value.success
    resetForm()
  } catch (cause) {
    error.value = readFetchErrorMessage(cause, labels.value.errors.sendFailed)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="booking-modal">
      <div
        v-if="open"
        class="booking-modal guest-contact-modal"
        :class="templateClass"
        :style="themeStyle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-contact-modal-title"
        data-backdrop="true"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div class="booking-modal-backdrop" data-backdrop="true" />
        <div class="booking-modal-panel" @click.stop>
          <header class="booking-modal-header">
            <div class="booking-modal-header-row">
              <div class="booking-modal-header-copy">
                <h2 id="guest-contact-modal-title">{{ labels.title }}</h2>
                <p class="booking-modal-lead">{{ labels.subtitle }}</p>
              </div>
              <button
                type="button"
                class="booking-modal-close"
                :disabled="loading"
                :aria-label="labels.close"
                @click="closeModal"
              >
                <X :size="20" stroke-width="2" />
              </button>
            </div>
          </header>

          <div v-if="success" class="booking-modal-body guest-contact-modal__success" role="status">
            <p class="guest-contact-modal__success-text">{{ success }}</p>
            <button type="button" class="booking-modal-submit" @click="closeModal">
              {{ labels.successClose }}
            </button>
          </div>

          <form v-else class="booking-modal-body" @submit.prevent="onSubmit">
            <label class="booking-modal-comment">
              <span>{{ labels.fields.name }}</span>
              <input
                v-model="name"
                type="text"
                autocomplete="name"
                class="booking-modal-input"
                required
              />
            </label>

            <label class="booking-modal-comment">
              <span>{{ labels.fields.email }}</span>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                class="booking-modal-input"
                required
              />
            </label>

            <label class="booking-modal-comment">
              <span>{{ labels.fields.message }}</span>
              <textarea
                v-model="message"
                class="booking-modal-textarea"
                rows="5"
                required
                :placeholder="labels.fields.messagePlaceholder"
              />
            </label>

            <div class="guest-contact-modal__honeypot" aria-hidden="true">
              <label>
                Site web
                <input v-model="website" type="text" tabindex="-1" autocomplete="off" />
              </label>
            </div>

            <p v-if="error" class="booking-modal-submit-error" role="alert">{{ error }}</p>

            <button type="submit" class="booking-modal-submit" :disabled="loading">
              {{ loading ? labels.submitting : labels.submit }}
              <Loader2 v-if="loading" :size="18" class="guest-contact-modal__submit-spinner" />
              <Send v-else :size="18" />
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.guest-contact-modal__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.guest-contact-modal__success {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.guest-contact-modal__success-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #171311;
}

.guest-contact-modal__submit-spinner {
  animation: guest-contact-spin 0.8s linear infinite;
}

@keyframes guest-contact-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
@import "../../../assets/css/components/site-booking-modal-shell.css";
</style>
