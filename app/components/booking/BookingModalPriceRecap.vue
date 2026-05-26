<script setup lang="ts">
import type { PropertyBookingConfig } from "../../types/property-site"
import { formatEuro, type BookingPriceEstimate } from "../../utils/booking-price"

const props = defineProps<{
  estimate: BookingPriceEstimate
  discountAmountEur: number
  bookingConfig: PropertyBookingConfig
  titleId?: string
  note: string
}>()

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}
</script>

<template>
  <section
    class="booking-modal-price-recap"
    :aria-labelledby="titleId ?? 'booking-price-recap-title'"
  >
    <h3 :id="titleId ?? 'booking-price-recap-title'" class="booking-modal-price-recap-title">
      Récapitulatif
    </h3>

    <dl class="booking-modal-price-recap-lines">
      <div class="booking-modal-price-recap-row">
        <dt>
          {{ pluralize(estimate.nights, "nuit", "nuits") }}
          × {{ bookingConfig.base_night_price_eur }}&nbsp;€
        </dt>
        <dd>{{ formatEuro(estimate.baseLodgingEur) }}</dd>
      </div>

      <div
        v-if="discountAmountEur > 0"
        class="booking-modal-price-recap-row booking-modal-price-recap-row--muted"
      >
        <dt>{{ estimate.discountLabel }}</dt>
        <dd>− {{ formatEuro(discountAmountEur) }}</dd>
      </div>

      <div v-if="estimate.guestSupplementEur > 0" class="booking-modal-price-recap-row">
        <dt>
          Supplément voyageurs (+
          {{ bookingConfig.extra_main_guest_per_night_eur }}&nbsp;€ / nuit / voyageur au-delà de
          {{ bookingConfig.included_main_guests }})
        </dt>
        <dd>{{ formatEuro(estimate.guestSupplementEur) }}</dd>
      </div>
    </dl>

    <div class="booking-modal-price-recap-total">
      <span>Total</span>
      <strong>{{ formatEuro(estimate.totalEur) }}</strong>
    </div>

    <p class="booking-modal-price-recap-note">
      {{ note }}
    </p>
  </section>
</template>
