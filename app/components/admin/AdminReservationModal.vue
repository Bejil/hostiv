<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminConfirmDialog from "./AdminConfirmDialog.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import type {
  AdminBookingReservation,
  AdminBookingReservationStatus,
  BookingReservationStatus
} from "../../types/booking-reservation"
import { adminUiFormat } from "../../data/admin-ui"
import { computeStayNights } from "../../utils/booking-stay-nights"

const props = defineProps<{
  slug: string
  reservation: AdminBookingReservation | null
  canAccessAccounting?: boolean
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.reservationModal)
const resExt = computed(() => ui.value.extended.reservations)

const emit = defineEmits<{
  close: []
  saved: [reservation: AdminBookingReservation]
  deleted: []
}>()

const isOpen = computed(() => Boolean(props.reservation))

const saving = ref(false)
const deleting = ref(false)
const refunding = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const form = reactive({
  arrival_date: "",
  departure_date: "",
  adults: 1,
  children: 0,
  babies: 0,
  guest_first_name: "",
  guest_last_name: "",
  guest_phone: "",
  guest_email: "",
  message: "",
  total_eur: 0,
  status: "confirmed" as BookingReservationStatus
})

const reservationStatusLabels = computed<Record<AdminBookingReservationStatus, string>>(() => ({
  upcoming: resExt.value.status.upcoming,
  past: resExt.value.status.past,
  cancelled: resExt.value.status.cancelled
}))

const computedNights = computed(() =>
  computeStayNights(form.arrival_date, form.departure_date)
)

const computedGuests = computed(() => form.adults + form.children + form.babies)

const isRefunded = computed(() => Boolean(props.reservation?.refunded_at))

const canRefund = computed(
  () =>
    props.canAccessAccounting !== false &&
    Boolean(props.reservation?.stripe_payment_intent_id) &&
    !isRefunded.value
)

const canMarkCancelled = computed(
  () => props.reservation?.status === "confirmed" && !isRefunded.value
)

type ConfirmKind = "cancel" | "delete" | "refund"

const confirmKind = ref<ConfirmKind | null>(null)

const guestLabel = computed(
  () => `${form.guest_first_name} ${form.guest_last_name}`.trim() || resExt.value.guestFallback
)

function formatAmount(value: number) {
  return new Intl.NumberFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value)
}

const confirmDialog = computed(() => {
  switch (confirmKind.value) {
    case "cancel":
      return {
        title: ext.value.confirm.cancelTitle,
        message: adminUiFormat(ext.value.confirm.cancelMessage, { guest: guestLabel.value }),
        confirmLabel: ext.value.confirm.cancelConfirm,
        variant: "primary" as const
      }
    case "delete":
      return {
        title: ext.value.confirm.deleteTitle,
        message: adminUiFormat(ext.value.confirm.deleteMessage, { guest: guestLabel.value }),
        confirmLabel: ext.value.confirm.deleteConfirm,
        variant: "danger" as const
      }
    case "refund":
      return {
        title: ext.value.confirm.refundTitle,
        message: adminUiFormat(ext.value.confirm.refundMessage, {
          amount: formatAmount(form.total_eur),
          guest: guestLabel.value
        }),
        confirmLabel: ext.value.confirm.refundConfirm,
        variant: "primary" as const
      }
    default:
      return null
  }
})

const confirmLoading = computed(() => {
  if (confirmKind.value === "delete") {
    return deleting.value
  }

  if (confirmKind.value === "refund") {
    return refunding.value
  }

  if (confirmKind.value === "cancel") {
    return saving.value
  }

  return false
})

function resetForm(reservation: AdminBookingReservation) {
  form.arrival_date = reservation.arrival_date
  form.departure_date = reservation.departure_date
  form.adults = reservation.adults
  form.children = reservation.children
  form.babies = reservation.babies
  form.guest_first_name = reservation.guest_first_name
  form.guest_last_name = reservation.guest_last_name
  form.guest_email = reservation.guest_email
  form.guest_phone = reservation.guest_phone
  form.message = reservation.message
  form.total_eur = reservation.total_eur
  form.status = reservation.status
  error.value = null
  successMessage.value = null
  confirmKind.value = null
}

watch(
  () => props.reservation,
  (reservation) => {
    if (reservation) {
      resetForm(reservation)
    }
  },
  { immediate: true }
)

function closeConfirm() {
  if (confirmLoading.value) {
    return
  }

  confirmKind.value = null
}

function closeModal() {
  if (saving.value || deleting.value || refunding.value || confirmKind.value) {
    return
  }

  emit("close")
}

function onBackdropClick(event: MouseEvent) {
  if (confirmKind.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    closeModal()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape") {
    return
  }

  if (confirmKind.value) {
    closeConfirm()
    return
  }

  closeModal()
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function saveReservation() {
  if (!props.reservation) {
    return
  }

  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await $fetch<{ reservation: AdminBookingReservation }>(
      `/api/admin/${props.slug}/reservations/${props.reservation.id}`,
      {
        method: "PUT",
        headers: await authHeaders(),
        body: { ...form }
      }
    )

    successMessage.value = ext.value.messages.saved
    emit("saved", response.reservation)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.messages.saveFailed
  } finally {
    saving.value = false
  }
}

function markAsCancelled() {
  if (!props.reservation || !canMarkCancelled.value) {
    return
  }

  confirmKind.value = "cancel"
}

async function executeDelete() {
  if (!props.reservation) {
    return
  }

  deleting.value = true
  error.value = null
  successMessage.value = null

  try {
    await $fetch(`/api/admin/${props.slug}/reservations/${props.reservation.id}`, {
      method: "DELETE",
      headers: await authHeaders()
    })

    emit("deleted")
    emit("close")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.messages.deleteFailed
  } finally {
    deleting.value = false
    confirmKind.value = null
  }
}

function requestDelete() {
  if (!props.reservation) {
    return
  }

  confirmKind.value = "delete"
}

function requestRefund() {
  if (!props.reservation || !canRefund.value) {
    return
  }

  confirmKind.value = "refund"
}

async function executeRefund() {
  if (!props.reservation) {
    return
  }

  refunding.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await $fetch<{ reservation: AdminBookingReservation }>(
      `/api/admin/${props.slug}/reservations/${props.reservation.id}/refund`,
      {
        method: "POST",
        headers: await authHeaders()
      }
    )

    resetForm(response.reservation)
    successMessage.value = ext.value.messages.refundSuccess
    emit("saved", response.reservation)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.messages.refundFailed
  } finally {
    refunding.value = false
    confirmKind.value = null
  }
}

async function onConfirmDialog() {
  const kind = confirmKind.value

  if (kind === "cancel") {
    form.status = "cancelled"
    await saveReservation()
    confirmKind.value = null
    return
  }

  if (kind === "delete") {
    await executeDelete()
    return
  }

  if (kind === "refund") {
    await executeRefund()
  }
}

function formatReservationDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day))
}

function formatCreatedAt(value: string) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="isOpen && reservation"
        class="hostiv-modal hostiv-modal--reservation"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--reservation"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`admin-reservation-modal-title-${reservation.id}`"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :aria-label="ui.common.close"
              :disabled="saving || deleting || refunding"
              @click="closeModal"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <p class="admin-reservation-modal__kicker">{{ ext.kicker }}</p>
                <h2 :id="`admin-reservation-modal-title-${reservation.id}`" class="hostiv-modal__title">
                  {{ form.guest_first_name }} {{ form.guest_last_name }}
                </h2>
                <p class="hostiv-modal__subtitle admin-reservation-modal__meta-line">
                  <span
                    class="admin-reservations-status-pill"
                    :class="`admin-reservations-status-pill--${reservation.display_status}`"
                  >
                    {{ reservationStatusLabels[reservation.display_status] }}
                  </span>
                  <span v-if="isRefunded" class="admin-reservations-status-pill admin-reservation-modal__refunded">
                    {{ ext.refunded }}
                  </span>
                  <span>
                    {{
                      adminUiFormat(ext.confirmedOn, {
                        date: formatCreatedAt(reservation.created_at)
                      })
                    }}
                  </span>
                </p>
              </div>
            </header>

            <p v-if="error" class="admin-reservation-modal__error" role="alert">{{ error }}</p>
            <p v-else-if="successMessage" class="admin-reservation-modal__success" role="status">
              {{ successMessage }}
            </p>

            <form class="admin-reservation-modal__form" @submit.prevent="saveReservation">
              <div class="admin-reservation-modal__grid admin-reservation-modal__grid--dates">
                <AdminField
                  :label="ext.fields.arrival"
                  :model-value="form.arrival_date"
                  type="date"
                  @update:model-value="form.arrival_date = String($event)"
                />
                <AdminField
                  :label="ext.fields.departure"
                  :model-value="form.departure_date"
                  type="date"
                  @update:model-value="form.departure_date = String($event)"
                />
              </div>

              <p class="admin-reservation-modal__hint">
                {{
                  computedNights > 0
                    ? `${computedNights} ${computedNights > 1 ? ext.hints.nights : ext.hints.night}`
                    : ext.hints.invalidDates
                }}
                ·
                {{ computedGuests }}
                {{ computedGuests > 1 ? ext.hints.persons : ext.hints.person }}
                ·
                {{ formatAmount(form.total_eur) }}
              </p>

              <div class="admin-reservation-modal__grid admin-reservation-modal__grid--guests">
                <AdminField
                  :label="ext.fields.adults"
                  :model-value="form.adults"
                  type="number"
                  min="1"
                  max="20"
                  @update:model-value="form.adults = Number($event)"
                />
                <AdminField
                  :label="ext.fields.children"
                  :model-value="form.children"
                  type="number"
                  min="0"
                  max="20"
                  @update:model-value="form.children = Number($event)"
                />
                <AdminField
                  :label="ext.fields.babies"
                  :model-value="form.babies"
                  type="number"
                  min="0"
                  max="10"
                  @update:model-value="form.babies = Number($event)"
                />
                <AdminField
                  :label="ext.fields.amount"
                  :model-value="form.total_eur"
                  type="number"
                  min="0"
                  step="1"
                  @update:model-value="form.total_eur = Number($event)"
                />
              </div>

              <div class="admin-reservation-modal__grid">
                <AdminField
                  :label="ext.fields.firstName"
                  :model-value="form.guest_first_name"
                  @update:model-value="form.guest_first_name = String($event)"
                />
                <AdminField
                  :label="ext.fields.lastName"
                  :model-value="form.guest_last_name"
                  @update:model-value="form.guest_last_name = String($event)"
                />
              </div>

              <div class="admin-reservation-modal__grid">
                <AdminField
                  :label="ext.fields.email"
                  :model-value="form.guest_email"
                  type="email"
                  @update:model-value="form.guest_email = String($event)"
                />
                <AdminField
                  :label="ext.fields.phone"
                  :model-value="form.guest_phone"
                  @update:model-value="form.guest_phone = String($event)"
                />
              </div>

              <label class="admin-field admin-field--full">
                <span class="admin-field__label">{{ ext.fields.status }}</span>
                <select
                  v-model="form.status"
                  class="admin-field__control"
                  :disabled="isRefunded"
                >
                  <option value="confirmed">{{ ext.statusOptions.confirmed }}</option>
                  <option value="cancelled">{{ ext.statusOptions.cancelled }}</option>
                </select>
              </label>

              <AdminField
                :label="ext.fields.message"
                :model-value="form.message"
                type="textarea"
                :rows="4"
                full-width
                @update:model-value="form.message = String($event)"
              />

              <div class="admin-reservation-modal__secondary-actions">
                <button
                  v-if="canMarkCancelled"
                  type="button"
                  class="admin-btn admin-btn--secondary admin-btn--sm"
                  :disabled="saving || deleting || refunding"
                  @click="markAsCancelled"
                >
                  {{ ext.actions.markCancelled }}
                </button>
                <button
                  v-if="canRefund"
                  type="button"
                  class="admin-btn admin-btn--secondary admin-btn--sm"
                  :disabled="saving || deleting || refunding"
                  @click="requestRefund"
                >
                  {{ refunding ? ext.actions.refunding : ext.actions.refund }}
                </button>
                <p
                  v-else-if="reservation?.stripe_payment_intent_id && isRefunded"
                  class="admin-reservation-modal__hint admin-reservation-modal__hint--inline"
                >
                  {{ ext.hints.refundRecorded }}
                  <template v-if="reservation.stripe_refund_id">
                    ({{ reservation.stripe_refund_id }})
                  </template>
                </p>
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
                  :disabled="saving || deleting || refunding"
                  @click="requestDelete"
                >
                  <AdminIcon name="trash" :size="16" />
                  {{ deleting ? ext.actions.deleting : ext.actions.delete }}
                </button>
              </div>

              <footer class="admin-reservation-modal__footer">
                <button
                  type="button"
                  class="hostiv-btn hostiv-btn--secondary"
                  :disabled="saving || deleting || refunding"
                  @click="closeModal"
                >
                  {{ ui.common.cancel }}
                </button>
                <button
                  type="submit"
                  class="hostiv-btn hostiv-btn--primary"
                  :disabled="saving || deleting || refunding || computedNights < 1"
                >
                  {{ saving ? ui.common.saving : ui.common.save }}
                </button>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <AdminConfirmDialog
      :open="Boolean(confirmKind && confirmDialog)"
      :title="confirmDialog?.title ?? ''"
      :message="confirmDialog?.message ?? ''"
      :confirm-label="confirmDialog?.confirmLabel"
      :variant="confirmDialog?.variant"
      :loading="confirmLoading"
      @confirm="onConfirmDialog"
      @cancel="closeConfirm"
    />
  </Teleport>
</template>
