<script setup lang="ts">
import {
  BOOKING_RESERVATION_KEY,
  type BookingFieldsInstance
} from "../../composables/bookingReservationKey"

const props = defineProps<{
  instance: BookingFieldsInstance
  showRequired?: boolean
  datesError?: string | null
  guestsError?: string | null
}>()

const booking = inject(BOOKING_RESERVATION_KEY)

if (!booking) {
  throw new Error("BookingReservationFields requires booking reservation context.")
}

const datesPopoverRef = ref<HTMLElement | null>(null)
const guestsPopoverRef = ref<HTMLElement | null>(null)

const showDatesPopover = computed(() => {
  if (props.instance === "modal") {
    return booking.isBookingModalOpen && booking.openBookingModalPopover === "dates"
  }

  if (props.instance === "sticky") {
    return (
      booking.isStickyBookingStripVisible &&
      booking.openBookingPopover === "dates" &&
      !booking.isBookingModalOpen
    )
  }

  return (
    !booking.isStickyBookingStripVisible &&
    booking.openBookingPopover === "dates" &&
    !booking.isBookingModalOpen
  )
})

const showGuestsPopover = computed(() => {
  if (props.instance === "modal") {
    return booking.isBookingModalOpen && booking.openBookingModalPopover === "guests"
  }

  if (props.instance === "sticky") {
    return (
      booking.isStickyBookingStripVisible &&
      booking.openBookingPopover === "guests" &&
      !booking.isBookingModalOpen
    )
  }

  return (
    !booking.isStickyBookingStripVisible &&
    booking.openBookingPopover === "guests" &&
    !booking.isBookingModalOpen
  )
})

const datesOpen = computed(() => {
  if (props.instance === "modal") {
    return booking.openBookingModalPopover === "dates"
  }

  return booking.openBookingPopover === "dates"
})

const guestsOpen = computed(() => {
  if (props.instance === "modal") {
    return booking.openBookingModalPopover === "guests"
  }

  return booking.openBookingPopover === "guests"
})

function toggleDatesPopover() {
  if (props.instance === "modal") {
    booking.toggleBookingModalPopover("dates")
    return
  }

  booking.toggleBookingPopover("dates")
}

function toggleGuestsPopover() {
  if (props.instance === "modal") {
    booking.toggleBookingModalPopover("guests")
    return
  }

  booking.toggleBookingPopover("guests")
}

defineExpose({
  datesContainer: datesPopoverRef,
  guestsContainer: guestsPopoverRef
})
</script>

<template>
  <div class="booking-fields" :class="`booking-fields--${instance}`">
    <div
      ref="datesPopoverRef"
      class="booking-item booking-item-popover"
      :class="{ 'has-error': datesError }"
    >
      <button
        type="button"
        class="booking-item-trigger"
        :class="{ 'is-open': datesOpen }"
        :aria-expanded="datesOpen"
        :aria-invalid="datesError ? 'true' : undefined"
        :aria-describedby="datesError ? 'booking-dates-error' : undefined"
        @mousedown.stop
        @click="toggleDatesPopover"
      >
        <span
          >Dates
          <span v-if="showRequired" class="required-mark" aria-hidden="true">*</span></span
        >
        <strong>{{ booking.bookingDateSummary }}</strong>
        <small>{{ booking.bookingDateMeta }}</small>
      </button>

      <p
        v-if="datesError"
        id="booking-dates-error"
        class="booking-field-error"
        role="alert"
      >
        {{ datesError }}
      </p>

      <div
        v-if="showDatesPopover"
        class="booking-popover booking-popover-dates"
      >
        <div class="booking-popover-header booking-popover-header-dates">
          <div>
            <strong>Sélectionnez vos dates</strong>
            <span
              >Réservez au moins {{ booking.MIN_BOOKING_NOTICE_DAYS }} jours à
              l’avance.</span
            >
          </div>

          <div class="booking-date-summary">
            <button
              type="button"
              class="booking-date-chip"
              :class="{ 'is-active': booking.activeCalendarStep === 'arrival' }"
              @click="booking.activeCalendarStep = 'arrival'"
            >
              <span>Arrivée</span>
              <strong>{{ booking.formatLongDisplayDate(booking.arrivalDate) }}</strong>
            </button>

            <button
              type="button"
              class="booking-date-chip"
              :class="{ 'is-active': booking.activeCalendarStep === 'departure' }"
              @click="booking.activeCalendarStep = 'departure'"
            >
              <span>Départ</span>
              <strong>{{ booking.formatLongDisplayDate(booking.departureDate) }}</strong>
            </button>
          </div>
        </div>

        <div class="booking-calendar-shell">
          <button
            type="button"
            class="calendar-nav-button"
            :disabled="!booking.canGoToPreviousCalendarMonth"
            @click="booking.shiftCalendarMonths(-1)"
          >
            ‹
          </button>

          <div class="calendar-months">
            <section
              v-for="month in booking.visibleCalendarMonths"
              :key="booking.formatCalendarMonth(month)"
              class="calendar-month"
            >
              <h4 class="calendar-month-title">{{ booking.formatCalendarMonth(month) }}</h4>

              <div class="calendar-weekdays">
                <span
                  v-for="weekday in booking.calendarWeekdayLabels"
                  :key="weekday"
                  class="calendar-weekday"
                >
                  {{ weekday }}
                </span>
              </div>

              <div class="calendar-grid">
                <template v-for="day in booking.buildCalendarDays(month)" :key="day.key">
                  <span v-if="!day.isoDate" class="calendar-day-cell calendar-day-cell-empty" />

                  <span
                    v-else
                    class="calendar-day-cell"
                    :class="{
                      'is-in-range': day.isInRange,
                      'is-range-start': day.isArrival,
                      'is-range-end': day.isDeparture,
                      'is-single-day': day.isArrival && day.isDeparture
                    }"
                  >
                    <button
                      type="button"
                      class="calendar-day-button"
                      :class="{
                        'is-selected': day.isRangeEdge,
                        'is-disabled': day.isDisabled,
                        'is-reserved': day.isReserved
                      }"
                      :disabled="day.isDisabled"
                      @click="booking.selectCalendarDate(day.isoDate)"
                    >
                      {{ day.label }}
                    </button>
                  </span>
                </template>
              </div>
            </section>
          </div>

          <button type="button" class="calendar-nav-button" @click="booking.shiftCalendarMonths(1)">
            ›
          </button>
        </div>

        <p class="booking-popover-note">
          {{ booking.pluralize(booking.stayNights, "nuit", "nuits") }} sélectionnée(s).
          Séjour autorisé : de {{ booking.MIN_STAY_NIGHTS }} à {{ booking.MAX_STAY_NIGHTS }} nuits.
        </p>
      </div>
    </div>

    <div
      ref="guestsPopoverRef"
      class="booking-item booking-item-popover"
      :class="{ 'has-error': guestsError }"
    >
      <button
        type="button"
        class="booking-item-trigger"
        :class="{ 'is-open': guestsOpen }"
        :aria-expanded="guestsOpen"
        :aria-invalid="guestsError ? 'true' : undefined"
        :aria-describedby="guestsError ? 'booking-guests-error' : undefined"
        @mousedown.stop
        @click="toggleGuestsPopover"
      >
        <span
          >Voyageurs
          <span v-if="showRequired" class="required-mark" aria-hidden="true">*</span></span
        >
        <strong>{{ booking.guestSummary }}</strong>
        <small>{{ booking.guestMeta }}</small>
      </button>

      <p
        v-if="guestsError"
        id="booking-guests-error"
        class="booking-field-error"
        role="alert"
      >
        {{ guestsError }}
      </p>

      <div v-if="showGuestsPopover" class="booking-popover booking-popover-guests">
        <div class="booking-popover-header">
          <strong>Choisissez vos voyageurs</strong>
          <span
            >Adultes + enfants limités à {{ booking.MAX_TRAVELERS }}. 1 bébé maximum.</span
          >
        </div>

        <div class="guest-stepper-list">
          <div class="guest-stepper-row">
            <div class="guest-stepper-copy">
              <strong>Adultes</strong>
              <span>13 ans et plus</span>
            </div>

            <div class="guest-stepper-controls">
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canDecrementGuest('adults')"
                @click="booking.updateGuests('adults', -1)"
              >
                -
              </button>
              <span class="stepper-value">{{ booking.guestCounts.adults }}</span>
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canIncrementGuest('adults')"
                @click="booking.updateGuests('adults', 1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="guest-stepper-row">
            <div class="guest-stepper-copy">
              <strong>Enfants</strong>
              <span>De 2 à 12 ans</span>
            </div>

            <div class="guest-stepper-controls">
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canDecrementGuest('children')"
                @click="booking.updateGuests('children', -1)"
              >
                -
              </button>
              <span class="stepper-value">{{ booking.guestCounts.children }}</span>
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canIncrementGuest('children')"
                @click="booking.updateGuests('children', 1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="guest-stepper-row">
            <div class="guest-stepper-copy">
              <strong>Bébé</strong>
              <span>Moins de 2 ans</span>
            </div>

            <div class="guest-stepper-controls">
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canDecrementGuest('babies')"
                @click="booking.updateGuests('babies', -1)"
              >
                -
              </button>
              <span class="stepper-value">{{ booking.guestCounts.babies }}</span>
              <button
                type="button"
                class="stepper-button"
                :disabled="!booking.canIncrementGuest('babies')"
                @click="booking.updateGuests('babies', 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
