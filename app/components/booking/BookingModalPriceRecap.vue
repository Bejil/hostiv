<script setup lang="ts">
import type { SiteBookingModalLabels } from "../../data/site-booking-modal-labels"
import { getSiteUiLabels, siteUiFormat } from "../../data/site-ui-labels"
import type { HostivLocale } from "../../types/hostiv-locale"
import type { PropertyBookingConfig } from "../../types/property-site"
import { formatEuro, type BookingPriceEstimate } from "../../utils/booking-price"

const props = defineProps<{
  estimate: BookingPriceEstimate
  discountAmountEur: number
  bookingConfig: PropertyBookingConfig
  labels: SiteBookingModalLabels
  locale: HostivLocale
  titleId?: string
  note: string
  cancellationPolicy?: string
}>()

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
}

const nightsLine = computed(() => {
  const booking = getSiteUiLabels(props.locale).booking
  const nightsLabel = pluralize(props.estimate.nights, booking.night, booking.nights)

  return siteUiFormat(props.labels.nightsLine, {
    nights: nightsLabel,
    price: props.bookingConfig.base_night_price_eur
  })
})

const guestSupplementLine = computed(() =>
  siteUiFormat(props.labels.guestSupplement, {
    extra: props.bookingConfig.extra_main_guest_per_night_eur,
    included: props.bookingConfig.included_main_guests
  })
)
</script>

<template>
  <section
    class="booking-modal-price-recap"
    :aria-labelledby="titleId ?? 'booking-price-recap-title'"
  >
    <h3 :id="titleId ?? 'booking-price-recap-title'" class="booking-modal-price-recap-title">
      {{ labels.recapTitle }}
    </h3>

    <dl class="booking-modal-price-recap-lines">
      <div class="booking-modal-price-recap-row">
        <dt>{{ nightsLine }}</dt>
        <dd>{{ formatEuro(estimate.baseLodgingEur, locale) }}</dd>
      </div>

      <div
        v-if="discountAmountEur > 0"
        class="booking-modal-price-recap-row booking-modal-price-recap-row--muted"
      >
        <dt>{{ estimate.discountLabel }}</dt>
        <dd>− {{ formatEuro(discountAmountEur, locale) }}</dd>
      </div>

      <div v-if="estimate.guestSupplementEur > 0" class="booking-modal-price-recap-row">
        <dt>{{ guestSupplementLine }}</dt>
        <dd>{{ formatEuro(estimate.guestSupplementEur, locale) }}</dd>
      </div>
    </dl>

    <div class="booking-modal-price-recap-total">
      <span>{{ labels.total }}</span>
      <strong>{{ formatEuro(estimate.totalEur, locale) }}</strong>
    </div>

    <p v-if="cancellationPolicy" class="booking-modal-price-recap-cancellation">
      {{ cancellationPolicy }}
    </p>

    <p class="booking-modal-price-recap-note">
      {{ note }}
    </p>
  </section>
</template>
