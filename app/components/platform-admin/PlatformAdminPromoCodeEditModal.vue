<script setup lang="ts">
import { Check, Loader2, Tag, X } from "@lucide/vue"
import AdminEmailTagsField from "../admin/AdminEmailTagsField.vue"
import type { HostivPromoCode, HostivPromoCodeUpsertBody } from "../../types/hostiv-promo-code"
import { EMAIL_TAGS_WILDCARD } from "../../utils/email-tags"

const props = defineProps<{
  open: boolean
  promoCode: HostivPromoCode | null
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

const title = ref("")
const description = ref("")
const code = ref("")
const validFrom = ref("")
const validUntil = ref("")
const discountPercent = ref(10)
const allowedEmails = ref(EMAIL_TAGS_WILDCARD)
const saving = ref(false)
const generatingCode = ref(false)
const error = ref<string | null>(null)
const codeAvailable = ref<boolean | null>(null)
const checkingCode = ref(false)

let skipCodeAvailabilityCheck = false

const modalTitleId = "platform-admin-promo-edit-title"
const modalSubtitleId = "platform-admin-promo-edit-subtitle"

const modalTitle = computed(() =>
  props.promoCode ? ui.value.promoCodes.editModal.titleEdit : ui.value.promoCodes.editModal.titleCreate
)

const modalSubtitle = computed(() =>
  props.promoCode ? ui.value.promoCodes.editModal.subtitleEdit : ui.value.promoCodes.editModal.subtitleCreate
)

const showCodeStatus = computed(
  () => checkingCode.value || codeAvailable.value === true || codeAvailable.value === false
)

const codeStatusMessage = computed(() => {
  if (checkingCode.value) {
    return ui.value.promoCodes.editModal.checkingCode
  }

  if (codeAvailable.value === true) {
    return ui.value.promoCodes.editModal.codeAvailable
  }

  if (codeAvailable.value === false) {
    return ui.value.promoCodes.editModal.codeTaken
  }

  return ""
})

function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const pad = (value: number) => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDatetimeLocalValue(value: string) {
  if (!value.trim()) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString()
}

function defaultValidFrom() {
  return toDatetimeLocalValue(new Date().toISOString())
}

function defaultValidUntil() {
  const date = new Date()

  date.setMonth(date.getMonth() + 3)

  return toDatetimeLocalValue(date.toISOString())
}

async function resetForm() {
  title.value = ""
  description.value = ""
  validFrom.value = defaultValidFrom()
  validUntil.value = defaultValidUntil()
  discountPercent.value = 10
  allowedEmails.value = EMAIL_TAGS_WILDCARD
  error.value = null
  codeAvailable.value = null
  await generateAndSetCode()
}

watch(
  () => [props.open, props.promoCode] as const,
  async ([isOpen, promoCode]) => {
    if (!isOpen) {
      return
    }

    error.value = null
    codeAvailable.value = null

    if (promoCode) {
      title.value = promoCode.title
      description.value = promoCode.description
      code.value = promoCode.code
      validFrom.value = toDatetimeLocalValue(promoCode.valid_from)
      validUntil.value = toDatetimeLocalValue(promoCode.valid_until)
      discountPercent.value = promoCode.discount_percent
      allowedEmails.value = promoCode.allowed_emails
      codeAvailable.value = true
      return
    }

    await resetForm()
  },
  { immediate: true }
)

let codeCheckTimer: ReturnType<typeof setTimeout> | null = null

watch(code, (value) => {
  if (skipCodeAvailabilityCheck) {
    skipCodeAvailabilityCheck = false
    return
  }

  codeAvailable.value = null

  if (!value.trim()) {
    return
  }

  if (codeCheckTimer) {
    clearTimeout(codeCheckTimer)
  }

  codeCheckTimer = setTimeout(() => {
    void checkCodeAvailability()
  }, 350)
})

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

async function checkCodeAvailability() {
  const normalized = code.value.trim().toUpperCase()

  if (!normalized) {
    codeAvailable.value = null
    return
  }

  checkingCode.value = true

  try {
    const query = new URLSearchParams({ code: normalized })

    if (props.promoCode?.id) {
      query.set("exclude_id", props.promoCode.id)
    }

    const response = await props.platformRequest<{ available: boolean }>(
      `/api/platform-admin/promo-codes/check-code?${query.toString()}`
    )

    codeAvailable.value = response.available
  } catch {
    codeAvailable.value = null
  } finally {
    checkingCode.value = false
  }
}

async function generateAndSetCode() {
  generatingCode.value = true

  try {
    const response = await props.platformRequest<{ code: string }>(
      "/api/platform-admin/promo-codes/generate-code"
    )

    skipCodeAvailabilityCheck = true
    code.value = response.code
    codeAvailable.value = true
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.promoCodes.editModal.generateFailed
  } finally {
    generatingCode.value = false
  }
}

function buildPayload(): HostivPromoCodeUpsertBody {
  return {
    title: title.value.trim(),
    description: description.value.trim(),
    code: code.value.trim(),
    valid_from: fromDatetimeLocalValue(validFrom.value),
    valid_until: fromDatetimeLocalValue(validUntil.value),
    discount_percent: discountPercent.value,
    allowed_emails: allowedEmails.value
  }
}

async function onSave() {
  error.value = null

  if (!code.value.trim()) {
    error.value = ui.value.promoCodes.editModal.codeRequired
    return
  }

  if (codeAvailable.value === false) {
    error.value = ui.value.promoCodes.editModal.codeTaken
    return
  }

  saving.value = true

  try {
    const payload = buildPayload()

    if (props.promoCode) {
      await props.platformRequest(
        `/api/platform-admin/promo-codes/${encodeURIComponent(props.promoCode.id)}`,
        { method: "PATCH", body: payload }
      )
    } else {
      await props.platformRequest("/api/platform-admin/promo-codes", {
        method: "POST",
        body: payload
      })
    }

    emit("saved")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.promoCodes.editModal.saveFailed
  } finally {
    saving.value = false
  }
}

function onBackdropClick(event: MouseEvent) {
  if (saving.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open || saving.value) {
    return
  }

  if (event.key === "Escape") {
    emit("close")
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--promo-code"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--promo-code"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="modalTitleId"
            :aria-describedby="modalSubtitleId"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :disabled="saving"
              :aria-label="ui.common.close"
              @click="emit('close')"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo hostiv-modal__logo--icon" aria-hidden="true">
                <Tag :size="22" stroke-width="2" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 :id="modalTitleId" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p :id="modalSubtitleId" class="hostiv-modal__subtitle">
                  {{ modalSubtitle }}
                </p>
              </div>
            </header>

            <form class="hostiv-modal__form platform-admin-promo-modal__form" @submit.prevent="onSave">
              <label class="hostiv-modal__field">
                <span>{{ ui.promoCodes.fields.title }}</span>
                <input v-model="title" type="text" required :disabled="saving" />
              </label>

              <label class="hostiv-modal__field">
                <span>{{ ui.promoCodes.fields.description }}</span>
                <textarea
                  v-model="description"
                  class="hostiv-modal__textarea"
                  rows="2"
                  :disabled="saving"
                />
              </label>

              <label class="hostiv-modal__field">
                <span>{{ ui.promoCodes.fields.code }}</span>
                <div class="platform-admin-promo-modal__code-row">
                  <input
                    v-model="code"
                    type="text"
                    required
                    autocapitalize="characters"
                    spellcheck="false"
                    :disabled="saving || generatingCode"
                  />
                  <button
                    type="button"
                    class="hostiv-btn hostiv-btn--secondary hostiv-btn--sm"
                    :disabled="saving || generatingCode"
                    @click="generateAndSetCode"
                  >
                    <Loader2 v-if="generatingCode" :size="16" class="platform-admin-spin" aria-hidden="true" />
                    {{ generatingCode ? ui.promoCodes.editModal.generatingCode : ui.promoCodes.fields.generateCodeCta }}
                  </button>
                </div>
                <div
                  v-if="showCodeStatus"
                  class="hostiv-modal__slug-status"
                  :class="{
                    'hostiv-modal__slug-status--available': codeAvailable === true,
                    'hostiv-modal__slug-status--error': codeAvailable === false
                  }"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    class="hostiv-modal__slug-status-icon"
                    :class="{
                      'hostiv-modal__slug-status-icon--pending': checkingCode,
                      'hostiv-modal__slug-status-icon--ok': codeAvailable === true,
                      'hostiv-modal__slug-status-icon--bad': codeAvailable === false
                    }"
                    aria-hidden="true"
                  >
                    <Loader2
                      v-if="checkingCode"
                      :size="12"
                      class="hostiv-modal__slug-status-spinner"
                      stroke-width="2.5"
                    />
                    <Check v-else-if="codeAvailable === true" :size="12" stroke-width="2.5" />
                    <X v-else-if="codeAvailable === false" :size="12" stroke-width="2.5" />
                  </span>
                  <span>{{ codeStatusMessage }}</span>
                </div>
              </label>

              <div class="platform-admin-promo-modal__grid">
                <label class="hostiv-modal__field">
                  <span>{{ ui.promoCodes.fields.validFrom }}</span>
                  <input v-model="validFrom" type="datetime-local" required :disabled="saving" />
                </label>

                <label class="hostiv-modal__field">
                  <span>{{ ui.promoCodes.fields.validUntil }}</span>
                  <input v-model="validUntil" type="datetime-local" required :disabled="saving" />
                </label>
              </div>

              <label class="hostiv-modal__field">
                <span>{{ ui.promoCodes.fields.discountPercent }}</span>
                <input
                  v-model.number="discountPercent"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  required
                  :disabled="saving"
                />
              </label>

              <AdminEmailTagsField v-model="allowedEmails" :disabled="saving" />

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <footer class="platform-admin-promo-modal__footer">
                <button
                  type="button"
                  class="hostiv-btn hostiv-btn--secondary hostiv-btn--sm"
                  :disabled="saving"
                  @click="emit('close')"
                >
                  {{ ui.common.cancel }}
                </button>
                <button type="submit" class="hostiv-btn hostiv-btn--primary hostiv-btn--sm" :disabled="saving">
                  <Loader2 v-if="saving" :size="16" class="platform-admin-spin" aria-hidden="true" />
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
