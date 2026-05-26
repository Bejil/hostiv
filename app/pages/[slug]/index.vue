<script setup lang="ts">
import type { Directive } from "vue"
import BenefitIcon from "../../components/BenefitIcon.vue"
import type { PropertyGalleryCategory } from "../../types/property-site"
import { computeBookingPriceEstimate, formatEuro } from "../../utils/booking-price"
import BookingReservationFields from "../../components/booking/BookingReservationFields.vue"
import BookingStripePayment from "../../components/booking/BookingStripePayment.vue"
import {
  applyStoredBookingContact,
  loadStoredBookingContact,
  saveStoredBookingContact
} from "../../composables/useBookingContactStorage"
import {
  BOOKING_RESERVATION_KEY,
  type BookingPopover,
  type CalendarSelectionStep,
  type GuestType
} from "../../composables/bookingReservationKey"
import { faviconMimeType } from "../../utils/favicon-mime"
import { visiblePlatformLinks } from "../../utils/platform-links"
import { ratingToStars } from "../../utils/platform-rating-stars"
import { buildPricingDisplayCards } from "../../utils/pricing-display-cards"
import {
  amenitySectionHasMore,
  visibleAmenityItems
} from "../../utils/amenity-preview"
import { normalizeSiteTemplateId } from "../../data/site-templates"

import { validatePropertySlugFormat } from "../../utils/property-slug"

definePageMeta({
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length) {
      return false
    }

    if (slug.includes(".")) {
      return false
    }

    return validatePropertySlugFormat(slug).valid
  }
})

const { site, slug } = await usePropertySitePage()
const bookingConfig = site.booking_config
const copy = site.content.copy
const siteTemplateClass = computed(
  () => `site-template site-template--${normalizeSiteTemplateId(site.content.template?.id)}`
)

useSeoMeta({
  title: () => site.seo_title,
  description: () => site.seo_description
})

const { propertyAsset } = usePropertyAsset(slug)

const siteFaviconPath = computed(() => site.favicon_path || site.logo_path)

useHead({
  link: computed(() => {
    const href = propertyAsset(siteFaviconPath.value)

    if (!href) {
      return []
    }

    return [
      {
        rel: "icon",
        href,
        type: faviconMimeType(siteFaviconPath.value)
      }
    ]
  })
})

const heroImage = computed(() => site.hero_image_path)
const testimonialsSectionBg = computed(
  () => `url('${propertyAsset(site.testimonials_bg_path)}')`
)

const MIN_BOOKING_NOTICE_DAYS = bookingConfig.min_booking_notice_days
const MIN_STAY_NIGHTS = bookingConfig.min_stay_nights
const MAX_STAY_NIGHTS = bookingConfig.max_stay_nights
const MAX_TRAVELERS = bookingConfig.max_travelers
const MAX_BABIES = bookingConfig.max_babies

const calendarWeekdayLabels = ["L", "M", "M", "J", "V", "S", "D"]

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  return new Date(year, month - 1, day)
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short"
  }).format(fromInputDate(value))
}

function formatLongDisplayDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long"
  }).format(fromInputDate(value))
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function compareInputDates(left: string, right: string) {
  return left.localeCompare(right)
}

function formatCalendarMonth(date: Date) {
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

const minimumArrivalDate = toInputDate(addDays(new Date(), MIN_BOOKING_NOTICE_DAYS))
const arrivalDate = ref(minimumArrivalDate)
const departureDate = ref(
  toInputDate(addDays(fromInputDate(minimumArrivalDate), MIN_STAY_NIGHTS))
)

const openBookingPopover = ref<BookingPopover>(null)
const openBookingModalPopover = ref<BookingPopover>(null)
const isBookingModalOpen = ref(false)
const isBookingSuccessModalOpen = ref(false)
const bookingModalStep = ref<"details" | "payment">("details")
const bookingPaymentClientSecret = ref<string | null>(null)
const bookingPaymentIntentId = ref<string | null>(null)
let suppressStripBookingPopoverUntil = 0
const bookingComment = ref("")
const bookingGuestLastName = ref("")
const bookingGuestFirstName = ref("")
const bookingGuestPhone = ref("")
const bookingGuestEmail = ref("")
const bookingModalErrors = reactive({
  dates: null as string | null,
  guests: null as string | null,
  lastName: null as string | null,
  firstName: null as string | null,
  phone: null as string | null,
  email: null as string | null,
  message: null as string | null
})
const isBookingSubmitting = ref(false)
const bookingSubmitError = ref<string | null>(null)
const heroCardRef = ref<HTMLElement | null>(null)
const bookingStripRef = ref<HTMLElement | null>(null)
const datesPopoverRef = ref<HTMLElement | null>(null)
const guestsPopoverRef = ref<HTMLElement | null>(null)
const stickyDatesPopoverRef = ref<HTMLElement | null>(null)
const stickyGuestsPopoverRef = ref<HTMLElement | null>(null)
const bookingModalFieldsRef = ref<InstanceType<typeof BookingReservationFields> | null>(null)
const activeCalendarStep = ref<CalendarSelectionStep>("arrival")
const visibleCalendarMonth = ref(startOfMonth(fromInputDate(minimumArrivalDate)))
const heroParallaxOffset = ref(0)
const isStickyBookingStripVisible = ref(false)
const { blockedDates, refreshBlockedDates, isNightBlocked } = useBlockedCalendarDates(slug)

let heroParallaxFrame: number | null = null

const guestCounts = reactive({
  adults: 2,
  children: 0,
  babies: 0
})

const minimumDepartureDate = computed(() =>
  toInputDate(addDays(fromInputDate(arrivalDate.value), MIN_STAY_NIGHTS))
)

const maximumDepartureDate = computed(() =>
  toInputDate(addDays(fromInputDate(arrivalDate.value), MAX_STAY_NIGHTS))
)

const visibleCalendarMonths = computed(() => [
  visibleCalendarMonth.value,
  addMonths(visibleCalendarMonth.value, 1)
])

const canGoToPreviousCalendarMonth = computed(() => {
  const previousMonth = addMonths(visibleCalendarMonth.value, -1)

  return previousMonth >= startOfMonth(fromInputDate(minimumArrivalDate))
})

const stayNights = computed(() => {
  const arrival = fromInputDate(arrivalDate.value)
  const departure = fromInputDate(departureDate.value)
  const millisecondsPerDay = 1000 * 60 * 60 * 24

  return Math.max(
    MIN_STAY_NIGHTS,
    Math.round((departure.getTime() - arrival.getTime()) / millisecondsPerDay)
  )
})

const bookingDateSummary = computed(
  () => `${formatDisplayDate(arrivalDate.value)} - ${formatDisplayDate(departureDate.value)}`
)

const bookingDateMeta = computed(() =>
  `${pluralize(stayNights.value, "nuit", "nuits")} · séjour max ${MAX_STAY_NIGHTS} nuits`
)

const totalMainGuests = computed(() => guestCounts.adults + guestCounts.children)

const guestSummary = computed(() => {
  const segments = [pluralize(guestCounts.adults, "adulte", "adultes")]

  if (guestCounts.children > 0) {
    segments.push(pluralize(guestCounts.children, "enfant", "enfants"))
  }

  if (guestCounts.babies > 0) {
    segments.push(pluralize(guestCounts.babies, "bébé", "bébés"))
  }

  return segments.join(" · ")
})

const guestMeta = computed(
  () => `${pluralize(totalMainGuests.value, "voyageur", "voyageurs")} max · 1 bébé max`
)

const bookingModalPriceEstimate = computed(() =>
  computeBookingPriceEstimate(stayNights.value, totalMainGuests.value, bookingConfig)
)

const bookingModalDiscountAmountEur = computed(() => {
  const e = bookingModalPriceEstimate.value

  return Math.max(0, e.baseLodgingEur - e.lodgingAfterDiscountEur)
})

const bookingModalPriceRecapNote = copy.booking.price_recap_note
const bookingModalPriceRecapNotePayment = copy.booking.price_recap_note_payment

watch(departureDate, () => {
  if (bookingModalErrors.dates && isBookingModalOpen.value) {
    bookingModalErrors.dates = null
  }
})

watch(
  () => [guestCounts.adults, guestCounts.children, guestCounts.babies],
  () => {
    if (bookingModalErrors.guests && isBookingModalOpen.value) {
      bookingModalErrors.guests = null
    }
  }
)

watch(bookingComment, () => {
  if (bookingModalErrors.message && bookingComment.value.trim()) {
    bookingModalErrors.message = null
  }
})

watch(bookingGuestEmail, () => {
  if (bookingModalErrors.email && bookingGuestEmail.value.trim()) {
    bookingModalErrors.email = null
  }
})

watch(bookingGuestLastName, () => {
  if (bookingModalErrors.lastName && bookingGuestLastName.value.trim()) {
    bookingModalErrors.lastName = null
  }
})

watch(bookingGuestFirstName, () => {
  if (bookingModalErrors.firstName && bookingGuestFirstName.value.trim()) {
    bookingModalErrors.firstName = null
  }
})

watch(bookingGuestPhone, () => {
  if (bookingModalErrors.phone && bookingGuestPhone.value.trim()) {
    bookingModalErrors.phone = null
  }
})

watch(arrivalDate, (nextArrivalDate) => {
  if (bookingModalErrors.dates && isBookingModalOpen.value) {
    bookingModalErrors.dates = null
  }

  const nextMinimumDeparture = toInputDate(
    addDays(fromInputDate(nextArrivalDate), MIN_STAY_NIGHTS)
  )
  const nextMaximumDeparture = toInputDate(
    addDays(fromInputDate(nextArrivalDate), MAX_STAY_NIGHTS)
  )

  if (departureDate.value < nextMinimumDeparture) {
    departureDate.value = nextMinimumDeparture
  }

  if (departureDate.value > nextMaximumDeparture) {
    departureDate.value = nextMaximumDeparture
  }
})

watch(openBookingPopover, async (popover) => {
  if (!popover) {
    return
  }

  await nextTick()

  const popoverContainer = getStripPopoverContainer(popover)
  const popoverElement = popoverContainer?.querySelector(".booking-popover") as
    | HTMLElement
    | null

  if (!popoverElement || typeof window === "undefined") {
    return
  }

  requestAnimationFrame(() => {
    const viewportPadding = 24
    const rect = popoverElement.getBoundingClientRect()

    if (rect.bottom > window.innerHeight - viewportPadding) {
      window.scrollBy({
        top: rect.bottom - window.innerHeight + viewportPadding,
        behavior: "smooth"
      })
    } else if (rect.top < viewportPadding) {
      window.scrollBy({
        top: rect.top - viewportPadding,
        behavior: "smooth"
      })
    }
  })
})

function toggleBookingPopover(popover: Exclude<BookingPopover, null>) {
  if (typeof performance !== "undefined" && performance.now() < suppressStripBookingPopoverUntil) {
    return
  }

  const switchingFromOther =
    openBookingPopover.value !== null && openBookingPopover.value !== popover

  if (switchingFromOther && popover === "dates") {
    activeCalendarStep.value = "arrival"
    visibleCalendarMonth.value = startOfMonth(fromInputDate(arrivalDate.value))
    openBookingPopover.value = "dates"
    return
  }

  if (switchingFromOther && popover === "guests") {
    openBookingPopover.value = "guests"
    return
  }

  if (popover === "dates" && openBookingPopover.value !== "dates") {
    activeCalendarStep.value = "arrival"
    visibleCalendarMonth.value = startOfMonth(fromInputDate(arrivalDate.value))
  }

  openBookingPopover.value = openBookingPopover.value === popover ? null : popover
}

function closeBookingPopover() {
  openBookingPopover.value = null
}

function closeBookingModalPopover() {
  openBookingModalPopover.value = null
}

function toggleBookingModalPopover(popover: Exclude<BookingPopover, null>) {
  const switchingFromOther =
    openBookingModalPopover.value !== null && openBookingModalPopover.value !== popover

  if (switchingFromOther && popover === "dates") {
    activeCalendarStep.value = "arrival"
    visibleCalendarMonth.value = startOfMonth(fromInputDate(arrivalDate.value))
    openBookingModalPopover.value = "dates"
    return
  }

  if (switchingFromOther && popover === "guests") {
    openBookingModalPopover.value = "guests"
    return
  }

  if (popover === "dates" && openBookingModalPopover.value !== "dates") {
    activeCalendarStep.value = "arrival"
    visibleCalendarMonth.value = startOfMonth(fromInputDate(arrivalDate.value))
  }

  openBookingModalPopover.value =
    openBookingModalPopover.value === popover ? null : popover
}

function clearBookingModalErrors() {
  bookingModalErrors.dates = null
  bookingModalErrors.guests = null
  bookingModalErrors.lastName = null
  bookingModalErrors.firstName = null
  bookingModalErrors.phone = null
  bookingModalErrors.email = null
  bookingModalErrors.message = null
}

function normalizeBookingPersonField(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function isValidBookingPersonName(value: string) {
  const t = normalizeBookingPersonField(value)

  return t.length >= 2 && t.length <= 80
}

function normalizeBookingPhone(value: string) {
  return value.replace(/\D/g, "")
}

function isValidBookingPhone(value: string) {
  const digits = normalizeBookingPhone(value)

  return digits.length >= 8 && digits.length <= 15
}

function onBookingPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = normalizeBookingPhone(input.value).slice(0, 15)

  if (bookingGuestPhone.value !== digits) {
    bookingGuestPhone.value = digits
  }

  if (input.value !== digits) {
    input.value = digits
  }
}

function isValidBookingGuestEmail(value: string) {
  const trimmed = value.trim()

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

function validateBookingModal() {
  clearBookingModalErrors()

  let isValid = true

  if (!arrivalDate.value || !departureDate.value) {
    bookingModalErrors.dates = "Veuillez sélectionner vos dates de séjour."
    isValid = false
  } else if (
    compareInputDates(arrivalDate.value, minimumArrivalDate) < 0 ||
    compareInputDates(departureDate.value, minimumDepartureDate.value) < 0 ||
    compareInputDates(departureDate.value, maximumDepartureDate.value) > 0
  ) {
    bookingModalErrors.dates = "Les dates sélectionnées ne sont pas valides."
    isValid = false
  }

  if (guestCounts.adults < 1 || totalMainGuests.value < 1) {
    bookingModalErrors.guests = "Indiquez au moins un voyageur."
    isValid = false
  }

  if (!isValidBookingPersonName(bookingGuestLastName.value)) {
    bookingModalErrors.lastName = "Indiquez votre nom (au moins 2 caractères)."
    isValid = false
  }

  if (!isValidBookingPersonName(bookingGuestFirstName.value)) {
    bookingModalErrors.firstName = "Indiquez votre prénom (au moins 2 caractères)."
    isValid = false
  }

  if (!isValidBookingPhone(bookingGuestPhone.value)) {
    bookingModalErrors.phone = "Indiquez un numéro valide (8 à 15 chiffres)."
    isValid = false
  }

  if (!isValidBookingGuestEmail(bookingGuestEmail.value)) {
    bookingModalErrors.email = "Indiquez une adresse e-mail valide pour vous répondre."
    isValid = false
  }

  if (!bookingComment.value.trim()) {
    bookingModalErrors.message = "Veuillez ajouter un message pour l’hôte."
    isValid = false
  }

  if (!isValid) {
    if (bookingModalErrors.dates) {
      openBookingModalPopover.value = "dates"
    } else if (bookingModalErrors.guests) {
      openBookingModalPopover.value = "guests"
    } else {
      openBookingModalPopover.value = null
    }
  }

  return isValid
}

function restoreBookingContactFromStorage() {
  const stored = loadStoredBookingContact()

  if (!stored) {
    return
  }

  applyStoredBookingContact(stored, {
    lastName: bookingGuestLastName,
    firstName: bookingGuestFirstName,
    phone: bookingGuestPhone,
    email: bookingGuestEmail
  })
}

function openBookingModal() {
  closeBookingPopover()
  closeAmenitiesModal()
  closeSpacesModal()
  closeBookingSuccessModal()
  clearBookingModalErrors()
  bookingSubmitError.value = null
  bookingModalStep.value = "details"
  bookingPaymentClientSecret.value = null
  bookingPaymentIntentId.value = null
  restoreBookingContactFromStorage()
  isBookingModalOpen.value = true
}

function closeBookingSuccessModal() {
  isBookingSuccessModalOpen.value = false
}

function closeBookingModal() {
  isBookingModalOpen.value = false
  closeBookingModalPopover()
  closeBookingPopover()
  clearBookingModalErrors()
  bookingGuestLastName.value = ""
  bookingGuestFirstName.value = ""
  bookingGuestPhone.value = ""
  bookingGuestEmail.value = ""
  bookingSubmitError.value = null
  isBookingSubmitting.value = false
  bookingModalStep.value = "details"
  bookingPaymentClientSecret.value = null
  bookingPaymentIntentId.value = null

  if (typeof performance !== "undefined") {
    suppressStripBookingPopoverUntil = performance.now() + 450
  }
}

function backToBookingDetails() {
  bookingModalStep.value = "details"
  bookingPaymentClientSecret.value = null
  bookingPaymentIntentId.value = null
  bookingSubmitError.value = null
  isBookingSubmitting.value = false
}

function openBookingRequest() {
  openBookingModal()
}

const runtimeConfig = useRuntimeConfig()
const isStripeConfigured = computed(() =>
  Boolean(String(runtimeConfig.public.stripePublishableKey || "").trim())
)
const isStripePaymentsReady = computed(() => Boolean(site.stripe_payments_ready))

async function goToBookingPayment() {
  bookingSubmitError.value = null

  if (!validateBookingModal()) {
    return
  }

  if (typeof window === "undefined") {
    return
  }

  if (!isStripeConfigured.value) {
    bookingSubmitError.value =
      "Paiement par carte non configuré. Ajoutez vos clés Stripe (NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY et STRIPE_SECRET_KEY)."
    return
  }

  if (!isStripePaymentsReady.value) {
    bookingSubmitError.value =
      "Le paiement en ligne n’est pas encore disponible pour ce logement."
    return
  }

  isBookingSubmitting.value = true

  try {
    const response = await $fetch("/api/booking/create-payment-intent", {
      method: "POST",
      body: {
        propertySlug: slug.value,
        arrivalDate: arrivalDate.value,
        departureDate: departureDate.value,
        adults: guestCounts.adults,
        children: guestCounts.children,
        babies: guestCounts.babies,
        lastName: normalizeBookingPersonField(bookingGuestLastName.value),
        firstName: normalizeBookingPersonField(bookingGuestFirstName.value),
        phone: normalizeBookingPhone(bookingGuestPhone.value),
        guestEmail: bookingGuestEmail.value.trim(),
        message: bookingComment.value.trim()
      }
    })

    bookingPaymentClientSecret.value = response.clientSecret
    bookingPaymentIntentId.value = response.paymentIntentId
    bookingModalStep.value = "payment"
    closeBookingModalPopover()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }

    bookingSubmitError.value =
      err.data?.message ||
      err.message ||
      "Impossible de préparer le paiement pour le moment. Réessayez plus tard."
  } finally {
    isBookingSubmitting.value = false
  }
}

async function onBookingPaymentSuccess(paymentIntentId: string) {
  bookingSubmitError.value = null
  isBookingSubmitting.value = true

  try {
    await $fetch("/api/booking/complete", {
      method: "POST",
      body: { paymentIntentId }
    })

    saveStoredBookingContact({
      lastName: normalizeBookingPersonField(bookingGuestLastName.value),
      firstName: normalizeBookingPersonField(bookingGuestFirstName.value),
      phone: normalizeBookingPhone(bookingGuestPhone.value),
      email: bookingGuestEmail.value.trim()
    })

    closeBookingModal()
    isBookingSuccessModalOpen.value = true
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }

    bookingSubmitError.value =
      err.data?.message ||
      err.message ||
      "Paiement reçu, mais la confirmation par e-mail a échoué. Contactez l’hôte avec votre reçu Stripe."
  } finally {
    isBookingSubmitting.value = false
  }
}

function onBookingPaymentError(message: string) {
  bookingSubmitError.value = message
}

function resolvePopoverContainer(container: unknown) {
  if (container && typeof container === "object" && "value" in container) {
    return (container as Ref<HTMLElement | null>).value
  }

  return container as HTMLElement | null
}

function getStripPopoverContainer(popover: Exclude<BookingPopover, null>) {
  if (isStickyBookingStripVisible.value) {
    return popover === "dates"
      ? stickyDatesPopoverRef.value
      : stickyGuestsPopoverRef.value
  }

  return popover === "dates" ? datesPopoverRef.value : guestsPopoverRef.value
}

function getModalPopoverContainer(popover: Exclude<BookingPopover, null>) {
  const container =
    popover === "dates"
      ? bookingModalFieldsRef.value?.datesContainer
      : bookingModalFieldsRef.value?.guestsContainer

  return resolvePopoverContainer(container)
}

function canIncrementGuest(type: GuestType) {
  if (type === "babies") {
    return guestCounts.babies < MAX_BABIES
  }

  return totalMainGuests.value < MAX_TRAVELERS
}

function canDecrementGuest(type: GuestType) {
  if (type === "adults") {
    return guestCounts.adults > 1
  }

  return guestCounts[type] > 0
}

function updateGuests(type: GuestType, delta: 1 | -1) {
  if (delta === 1 && !canIncrementGuest(type)) {
    return
  }

  if (delta === -1 && !canDecrementGuest(type)) {
    return
  }

  if (type === "babies") {
    guestCounts.babies = Math.max(0, Math.min(MAX_BABIES, guestCounts.babies + delta))
    return
  }

  const nextValue = guestCounts[type] + delta
  const projectedMainGuests = totalMainGuests.value + delta

  if (projectedMainGuests < 1 || projectedMainGuests > MAX_TRAVELERS) {
    return
  }

  guestCounts[type] = nextValue
}

function shiftCalendarMonths(offset: number) {
  if (offset < 0 && !canGoToPreviousCalendarMonth.value) {
    return
  }

  visibleCalendarMonth.value = addMonths(visibleCalendarMonth.value, offset)
}

function minimumDepartureForArrival(arrival: string) {
  return toInputDate(addDays(fromInputDate(arrival), MIN_STAY_NIGHTS))
}

/** Jours du séjour (arrivée → départ inclus) qui chevauchent une nuit réservée. */
function wouldStayOverlapBlocked(arrival: string, departure: string) {
  for (
    let cursor = fromInputDate(arrival);
    compareInputDates(toInputDate(cursor), departure) <= 0;
    cursor = addDays(cursor, 1)
  ) {
    if (blockedDates.value.has(toInputDate(cursor))) {
      return true
    }
  }

  return false
}

function canArriveOnDate(isoDate: string) {
  if (isNightBlocked(isoDate)) {
    return false
  }

  return !wouldStayOverlapBlocked(isoDate, minimumDepartureForArrival(isoDate))
}

function ensureSelectableBookingDates() {
  if (!wouldStayOverlapBlocked(arrivalDate.value, departureDate.value)) {
    return
  }

  arrivalDate.value = minimumArrivalDate
  departureDate.value = toInputDate(
    addDays(fromInputDate(minimumArrivalDate), MIN_STAY_NIGHTS)
  )
  activeCalendarStep.value = "arrival"
}

function selectCalendarDate(isoDate: string) {
  if (isNightBlocked(isoDate)) {
    return
  }

  if (
    activeCalendarStep.value === "departure" &&
    compareInputDates(isoDate, arrivalDate.value) < 0
  ) {
    if (!canArriveOnDate(isoDate)) {
      return
    }

    arrivalDate.value = isoDate
    departureDate.value = minimumDepartureForArrival(isoDate)
    activeCalendarStep.value = "departure"
    return
  }

  if (
    activeCalendarStep.value === "departure" &&
    wouldStayOverlapBlocked(arrivalDate.value, isoDate)
  ) {
    return
  }

  if (activeCalendarStep.value === "arrival") {
    if (!canArriveOnDate(isoDate)) {
      return
    }

    arrivalDate.value = isoDate
    departureDate.value = minimumDepartureForArrival(isoDate)
    activeCalendarStep.value = "departure"
    return
  }

  if (
    compareInputDates(isoDate, minimumDepartureDate.value) < 0 ||
    compareInputDates(isoDate, maximumDepartureDate.value) > 0
  ) {
    return
  }

  departureDate.value = isoDate
  activeCalendarStep.value = "arrival"
}

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month)
  const startWeekday = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days: Array<{
    key: string
    label: string
    isoDate: string | null
    isDisabled: boolean
    isReserved: boolean
    isArrival: boolean
    isDeparture: boolean
    isInRange: boolean
    isRangeEdge: boolean
  }> = []

  for (let index = 0; index < startWeekday; index += 1) {
    days.push({
      key: `empty-${month.getFullYear()}-${month.getMonth()}-${index}`,
      label: "",
      isoDate: null,
      isDisabled: true,
      isReserved: false,
      isArrival: false,
      isDeparture: false,
      isInRange: false,
      isRangeEdge: false
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = toInputDate(new Date(month.getFullYear(), month.getMonth(), day))
    const isBeforeMinimumArrival = compareInputDates(isoDate, minimumArrivalDate) < 0
    const isBeforeAllowedDeparture = compareInputDates(isoDate, minimumDepartureDate.value) < 0
    const isAfterAllowedDeparture = compareInputDates(isoDate, maximumDepartureDate.value) > 0
    const isBlockedNight = isNightBlocked(isoDate)
    const isBeforeCurrentArrival =
      activeCalendarStep.value === "departure" &&
      compareInputDates(isoDate, arrivalDate.value) < 0
    const cannotArriveOnDate =
      (activeCalendarStep.value === "arrival" || isBeforeCurrentArrival) &&
      !canArriveOnDate(isoDate)
    const cannotSelectDeparture =
      activeCalendarStep.value === "departure" &&
      !isBeforeCurrentArrival &&
      (isBeforeAllowedDeparture ||
        isAfterAllowedDeparture ||
        wouldStayOverlapBlocked(arrivalDate.value, isoDate))
    const isDisabled =
      isBeforeMinimumArrival ||
      isBlockedNight ||
      cannotArriveOnDate ||
      cannotSelectDeparture

    const isArrival = isoDate === arrivalDate.value
    const isDeparture = isoDate === departureDate.value
    const isInRange =
      compareInputDates(isoDate, arrivalDate.value) >= 0 &&
      compareInputDates(isoDate, departureDate.value) <= 0

    days.push({
      key: isoDate,
      label: String(day),
      isoDate,
      isDisabled,
      isReserved: isBlockedNight,
      isArrival,
      isDeparture,
      isInRange,
      isRangeEdge: isArrival || isDeparture
    })
  }

  return days
}

function dismissBookingModalPopoverAfterClick(target: Node) {
  if (typeof window === "undefined") {
    return
  }

  // Fermer la popover sur « outside » après le cycle clic complet (mouseup + click).
  // Sinon un re-render synchrone sur mousedown annule souvent le click sur la croix ou le fond.
  window.setTimeout(() => {
    if (!isBookingModalOpen.value) {
      return
    }

    const active = openBookingModalPopover.value
    if (!active) {
      return
    }

    const container = getModalPopoverContainer(active)
    if (!container || container.contains(target)) {
      return
    }

    openBookingModalPopover.value = null
  }, 0)
}

function handleGlobalPointerdown(event: MouseEvent) {
  const target = event.target as Node

  if (isBookingModalOpen.value) {
    if (
      openBookingModalPopover.value === "dates" &&
      getModalPopoverContainer("dates") &&
      !getModalPopoverContainer("dates")?.contains(target)
    ) {
      dismissBookingModalPopoverAfterClick(target)
    }

    if (
      openBookingModalPopover.value === "guests" &&
      getModalPopoverContainer("guests") &&
      !getModalPopoverContainer("guests")?.contains(target)
    ) {
      dismissBookingModalPopoverAfterClick(target)
    }

    return
  }

  if (
    openBookingPopover.value === "dates" &&
    getStripPopoverContainer("dates") &&
    !getStripPopoverContainer("dates")?.contains(target)
  ) {
    openBookingPopover.value = null
  }

  if (
    openBookingPopover.value === "guests" &&
    getStripPopoverContainer("guests") &&
    !getStripPopoverContainer("guests")?.contains(target)
  ) {
    openBookingPopover.value = null
  }
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (isSpaceGalleryCarouselOpen.value && isSpacesModalOpen.value) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      goSpaceGalleryCarouselPrev()
      return
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      goSpaceGalleryCarouselNext()
      return
    }
  }

  if (event.key === "Escape") {
    if (isBookingSuccessModalOpen.value) {
      closeBookingSuccessModal()
      return
    }

    if (isBookingModalOpen.value) {
      closeBookingModal()
      return
    }

    if (isAmenitiesModalOpen.value) {
      closeAmenitiesModal()
      return
    }

    if (isSpacesModalOpen.value) {
      if (isSpaceGalleryCarouselOpen.value) {
        closeSpaceGalleryPhoto()
        return
      }

      closeSpacesModal()
      return
    }

    closeBookingPopover()
  }
}

function updateHeroParallax() {
  if (typeof window === "undefined" || !heroCardRef.value) {
    return
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroParallaxOffset.value = 0
    return
  }

  const rect = heroCardRef.value.getBoundingClientRect()
  const nextOffset = Math.max(-36, Math.min(36, -rect.top * 0.14))

  heroParallaxOffset.value = Math.round(nextOffset)
}

function updateStickyBookingStripVisibility() {
  if (typeof window === "undefined" || !bookingStripRef.value) {
    return
  }

  const nextVisibility = bookingStripRef.value.getBoundingClientRect().bottom <= 0

  if (nextVisibility !== isStickyBookingStripVisible.value && nextVisibility && openBookingPopover.value) {
    closeBookingPopover()
  }

  isStickyBookingStripVisible.value = nextVisibility
}

function scheduleHeroParallaxUpdate() {
  if (typeof window === "undefined" || heroParallaxFrame !== null) {
    return
  }

  heroParallaxFrame = window.requestAnimationFrame(() => {
    heroParallaxFrame = null
    updateHeroParallax()
    updateStickyBookingStripVisibility()
  })
}

onMounted(() => {
  window.addEventListener("mousedown", handleGlobalPointerdown)
  window.addEventListener("keydown", handleGlobalKeydown)
  window.addEventListener("scroll", scheduleHeroParallaxUpdate, { passive: true })
  window.addEventListener("resize", scheduleHeroParallaxUpdate)
  updateHeroParallax()
  updateStickyBookingStripVisibility()

  void refreshBlockedDates().then(() => {
    ensureSelectableBookingDates()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener("mousedown", handleGlobalPointerdown)
  window.removeEventListener("keydown", handleGlobalKeydown)
  window.removeEventListener("scroll", scheduleHeroParallaxUpdate)
  window.removeEventListener("resize", scheduleHeroParallaxUpdate)

  if (typeof document !== "undefined") {
    document.body.style.overflow = ""
  }

  if (heroParallaxFrame !== null) {
    window.cancelAnimationFrame(heroParallaxFrame)
  }
})

const featuredSpaces = computed(() =>
  site.content.featured_spaces.map((space) => ({
    title: space.title,
    text: space.text,
    image: space.image,
    tag: space.tag
  }))
)

const spaceGalleryCategories = computed(
  () => site.content.space_gallery_categories as PropertyGalleryCategory[]
)

type SpaceGalleryCategory = PropertyGalleryCategory

const spaceGalleryFlatItems = computed(() =>
  spaceGalleryCategories.value.flatMap((category) =>
    category.images.map((src, photoIndexInCategory) => ({
      src,
      categoryId: category.id,
      categoryTitle: category.title,
      description: category.description,
      photoIndexInCategory
    }))
  )
)

const spaceGalleryPublicSrc = propertyAsset

const isSpacesModalOpen = ref(false)
const spacesModalContentReady = ref(false)
const spacesModalPhotoIndex = ref<number | null>(null)
const spacesModalBodyRef = ref<HTMLElement | null>(null)
const spacesModalPendingScrollCategoryId = ref<string | null>(null)

const isSpaceGalleryCarouselOpen = computed(() => spacesModalPhotoIndex.value !== null)

const spaceGalleryCarouselCurrent = computed(() => {
  const index = spacesModalPhotoIndex.value

  if (index === null) {
    return null
  }

  return spaceGalleryFlatItems.value[index] ?? null
})

const spaceGalleryCarouselPhoto = computed(() => {
  const current = spaceGalleryCarouselCurrent.value

  if (!current) {
    return null
  }

  return {
    src: current.src,
    alt: `${current.categoryTitle} — photo ${current.photoIndexInCategory + 1}`
  }
})

const canGoSpaceGalleryCarouselPrev = computed(() => {
  const index = spacesModalPhotoIndex.value

  return index !== null && index > 0
})

const canGoSpaceGalleryCarouselNext = computed(() => {
  const index = spacesModalPhotoIndex.value

  return index !== null && index < spaceGalleryFlatItems.value.length - 1
})

function onSpacesModalBeforeEnter() {
  spacesModalContentReady.value = false
}

function scheduleSpacesModalBodyScroll() {
  void nextTick(() => {
    requestAnimationFrame(() => {
      runSpacesModalBodyScroll()
    })
  })
}

function runSpacesModalBodyScroll() {
  if (!isSpacesModalOpen.value || spacesModalPhotoIndex.value !== null) {
    return
  }

  const body = spacesModalBodyRef.value

  if (!body) {
    return
  }

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const behavior = reduceMotion ? "instant" : "smooth"
  const pending = spacesModalPendingScrollCategoryId.value

  if (
    pending &&
    spaceGalleryCategories.value.some((category) => category.id === pending)
  ) {
    const el = body.querySelector(`[data-spaces-modal-category="${pending}"]`)

    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "start", behavior })
    }

    return
  }

  body.scrollTo({ top: 0, behavior })
}

function onSpacesModalAfterEnter() {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const setReady = () => {
    if (!isSpacesModalOpen.value) {
      return
    }

    spacesModalContentReady.value = true
    scheduleSpacesModalBodyScroll()
  }

  if (reduceMotion) {
    setReady()
    return
  }

  requestAnimationFrame(setReady)
}

function openSpaceGalleryPhoto(category: SpaceGalleryCategory, photoIndex: number) {
  const globalIndex = spaceGalleryFlatItems.value.findIndex(
    (item) => item.categoryId === category.id && item.photoIndexInCategory === photoIndex
  )

  if (globalIndex >= 0) {
    spacesModalPhotoIndex.value = globalIndex
  }
}

function closeSpaceGalleryPhoto() {
  spacesModalPhotoIndex.value = null
}

function goSpaceGalleryCarouselPrev() {
  const index = spacesModalPhotoIndex.value

  if (index === null || index <= 0) {
    return
  }

  spacesModalPhotoIndex.value = index - 1
}

function goSpaceGalleryCarouselNext() {
  const index = spacesModalPhotoIndex.value

  if (index === null || index >= spaceGalleryFlatItems.value.length - 1) {
    return
  }

  spacesModalPhotoIndex.value = index + 1
}

function goSpaceGalleryCarouselTo(index: number) {
  if (index >= 0 && index < spaceGalleryFlatItems.value.length) {
    spacesModalPhotoIndex.value = index
  }
}

function openSpacesModal(galleryCategoryId?: string) {
  closeBookingPopover()
  closeBookingModal()
  closeBookingSuccessModal()
  spacesModalPhotoIndex.value = null

  const normalized =
    galleryCategoryId &&
    spaceGalleryCategories.value.some((category) => category.id === galleryCategoryId)
      ? galleryCategoryId
      : null

  spacesModalPendingScrollCategoryId.value = normalized
  isSpacesModalOpen.value = true
}

function closeSpacesModal() {
  spacesModalPhotoIndex.value = null
  spacesModalPendingScrollCategoryId.value = null
  isSpacesModalOpen.value = false
}

const isAmenitiesModalOpen = ref(false)

function openAmenitiesModal() {
  closeBookingPopover()
  closeBookingModal()
  closeBookingSuccessModal()
  isAmenitiesModalOpen.value = true
}

function closeAmenitiesModal() {
  isAmenitiesModalOpen.value = false
}

watch(
  () =>
    isSpacesModalOpen.value ||
    isAmenitiesModalOpen.value ||
    isBookingModalOpen.value ||
    isBookingSuccessModalOpen.value,
  (open) => {
    if (typeof document === "undefined") {
      return
    }

    document.body.style.overflow = open ? "hidden" : ""
  }
)

watch(isBookingModalOpen, (open) => {
  if (open) {
    return
  }

  closeBookingModalPopover()
  closeBookingPopover()
})

const hostPhoto = computed(() => site.host_photo_path)
const benefitCards = computed(() => site.content.benefit_cards)
const visualCards = computed(() =>
  site.content.visual_cards.map((card) => ({
    title: card.title,
    text: card.text,
    image: card.image
  }))
)
const propertyLocation = computed(() => ({
  address: site.location.address,
  latitude: site.location.latitude,
  longitude: site.location.longitude,
  radiusMeters: site.location.radius_meters
}))
const neighborhoodHighlights = computed(() => site.content.neighborhood_highlights)
const houseRules = computed(() => site.content.house_rules)
const pricingCards = computed(() => buildPricingDisplayCards(bookingConfig))
const platformLinks = computed(() =>
  visiblePlatformLinks(site.content.platform_links).map((link) => ({
    ...link,
    stars: ratingToStars(link.rating) || link.stars
  }))
)
const reviews = computed(() => site.content.reviews)
const amenityCatalog = computed(() => site.content.amenity_catalog)
const amenityPreviewSections = computed(() => site.content.amenity_preview_sections)

const reviewMarqueeItems = computed(() => [...reviews.value, ...reviews.value])

provide(
  BOOKING_RESERVATION_KEY,
  reactive({
  MIN_BOOKING_NOTICE_DAYS,
  MIN_STAY_NIGHTS,
  MAX_STAY_NIGHTS,
  MAX_TRAVELERS,
  MAX_BABIES,
  calendarWeekdayLabels,
  arrivalDate,
  departureDate,
  guestCounts,
  activeCalendarStep,
  openBookingPopover,
  openBookingModalPopover,
  isBookingModalOpen,
  isStickyBookingStripVisible,
  bookingDateSummary,
  bookingDateMeta,
  guestSummary,
  guestMeta,
  stayNights,
  visibleCalendarMonths,
  canGoToPreviousCalendarMonth,
  formatLongDisplayDate,
  formatCalendarMonth,
  buildCalendarDays,
  pluralize,
  toggleBookingPopover,
  toggleBookingModalPopover,
  canIncrementGuest,
  canDecrementGuest,
  updateGuests,
  shiftCalendarMonths,
  selectCalendarDate
  })
)

const reviewQuoteObservers = new WeakMap<HTMLElement, ResizeObserver>()

function updateReviewQuoteFade(el: HTMLElement) {
  const overflows = el.scrollHeight > el.clientHeight + 1
  el.classList.toggle("review-quote-wrap--fade", overflows)
}

const vReviewQuoteFade: Directive<HTMLElement> = {
  getSSRProps() {
    return {}
  },
  mounted(el) {
    const run = () => updateReviewQuoteFade(el)

    run()
    requestAnimationFrame(run)

    const observer = new ResizeObserver(run)
    observer.observe(el)

    const quote = el.querySelector(".review-quote")
    if (quote) {
      observer.observe(quote)
    }

    reviewQuoteObservers.set(el, observer)
  },
  updated(el) {
    nextTick(() => updateReviewQuoteFade(el))
  },
  unmounted(el) {
    reviewQuoteObservers.get(el)?.disconnect()
    reviewQuoteObservers.delete(el)
  }
}
</script>

<template>
  <div :class="siteTemplateClass">
    <header class="site-header">
      <div class="topbar">
        <div class="brand-block">
          <img
            :src="propertyAsset(site.logo_path)"
            :alt="copy.header.logo_alt"
            class="brand-logo"
          />
          <div>
            <p class="brand-name">{{ copy.header.brand_name }}</p>
            <p class="brand-meta">{{ copy.header.brand_meta }}</p>
          </div>
        </div>

        <nav class="topnav">
          <a href="#resume">À propos</a>
          <a href="#espaces">Espaces</a>
          <a href="#quartier">Quartier</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#equipements">Équipements</a>
          <a href="#avis">Avis</a>
          <a href="#reglement">Règles</a>
          <button type="button" class="nav-cta" @click="openBookingModal">Réserver</button>
        </nav>
      </div>
    </header>

  <div class="page-shell">
    <section ref="heroCardRef" class="hero-card">
      <div class="hero-media">
        <img
          :src="propertyAsset(heroImage)"
          :alt="copy.hero.image_alt"
          class="hero-image"
          :style="{ '--hero-parallax-offset': `${heroParallaxOffset}px` }"
        />
        <div class="hero-overlay" />
      </div>

      <div class="hero-content">
        <div class="hero-copy">
          <p class="eyebrow eyebrow-light">{{ copy.hero.eyebrow }}</p>
          <h1>{{ copy.hero.title }}</h1>
          <p class="hero-text">{{ copy.hero.text }}</p>
        </div>
      </div>

      <div ref="bookingStripRef" class="booking-strip">
            <div ref="datesPopoverRef" class="booking-item booking-item-popover">
              <button
                type="button"
                class="booking-item-trigger"
                :class="{ 'is-open': openBookingPopover === 'dates' }"
                :aria-expanded="openBookingPopover === 'dates'"
                @mousedown.stop
                @click="toggleBookingPopover('dates')"
              >
                <span>Dates</span>
                <strong>{{ bookingDateSummary }}</strong>
                <small>{{ bookingDateMeta }}</small>
              </button>

              <div
                v-if="
                  !isBookingModalOpen &&
                  !isStickyBookingStripVisible &&
                  openBookingPopover === 'dates'
                "
                class="booking-popover booking-popover-dates"
              >
                <div class="booking-popover-header booking-popover-header-dates">
                  <div>
                    <strong>Sélectionnez vos dates</strong>
                    <span
                      >Réservez au moins {{ MIN_BOOKING_NOTICE_DAYS }} jours à
                      l’avance.</span
                    >
                  </div>

                  <div class="booking-date-summary">
                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'arrival' }"
                      @click="activeCalendarStep = 'arrival'"
                    >
                      <span>Arrivée</span>
                      <strong>{{ formatLongDisplayDate(arrivalDate) }}</strong>
                    </button>

                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'departure' }"
                      @click="activeCalendarStep = 'departure'"
                    >
                      <span>Départ</span>
                      <strong>{{ formatLongDisplayDate(departureDate) }}</strong>
                    </button>
                  </div>
                </div>

                <div class="booking-calendar-shell">
                  <button
                    type="button"
                    class="calendar-nav-button"
                    :disabled="!canGoToPreviousCalendarMonth"
                    @click="shiftCalendarMonths(-1)"
                  >
                    ‹
                  </button>

                  <div class="calendar-months">
                    <section
                      v-for="month in visibleCalendarMonths"
                      :key="formatCalendarMonth(month)"
                      class="calendar-month"
                    >
                      <h4 class="calendar-month-title">{{ formatCalendarMonth(month) }}</h4>

                      <div class="calendar-weekdays">
                        <span
                          v-for="weekday in calendarWeekdayLabels"
                          :key="weekday"
                          class="calendar-weekday"
                        >
                          {{ weekday }}
                        </span>
                      </div>

                      <div class="calendar-grid">
                        <template v-for="day in buildCalendarDays(month)" :key="day.key">
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
                              @click="selectCalendarDate(day.isoDate)"
                            >
                              {{ day.label }}
                            </button>
                          </span>
                        </template>
                      </div>
                    </section>
                  </div>

                  <button type="button" class="calendar-nav-button" @click="shiftCalendarMonths(1)">
                    ›
                  </button>
                </div>

                <p class="booking-popover-note">
                  {{ pluralize(stayNights, "nuit", "nuits") }} sélectionnée(s).
                  Séjour autorisé : de {{ MIN_STAY_NIGHTS }} à {{ MAX_STAY_NIGHTS }} nuits.
                </p>
              </div>
            </div>

            <div ref="guestsPopoverRef" class="booking-item booking-item-popover">
              <button
                type="button"
                class="booking-item-trigger"
                :class="{ 'is-open': openBookingPopover === 'guests' }"
                :aria-expanded="openBookingPopover === 'guests'"
                @mousedown.stop
                @click="toggleBookingPopover('guests')"
              >
                <span>Voyageurs</span>
                <strong>{{ guestSummary }}</strong>
                <small>{{ guestMeta }}</small>
              </button>

              <div
                v-if="
                  !isBookingModalOpen &&
                  !isStickyBookingStripVisible &&
                  openBookingPopover === 'guests'
                "
                class="booking-popover booking-popover-guests"
              >
                <div class="booking-popover-header">
                  <strong>Choisissez vos voyageurs</strong>
                  <span
                    >Adultes + enfants limités à {{ MAX_TRAVELERS }}. 1 bébé maximum.</span
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
                        :disabled="!canDecrementGuest('adults')"
                        @click="updateGuests('adults', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.adults }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('adults')"
                        @click="updateGuests('adults', 1)"
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
                        :disabled="!canDecrementGuest('children')"
                        @click="updateGuests('children', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.children }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('children')"
                        @click="updateGuests('children', 1)"
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
                        :disabled="!canDecrementGuest('babies')"
                        @click="updateGuests('babies', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.babies }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('babies')"
                        @click="updateGuests('babies', 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        <button type="button" class="booking-button" @click="openBookingRequest">
          Réserver
        </button>
      </div>
    </section>

      <div
        class="booking-strip booking-strip-sticky"
        :class="{ 'is-visible': isStickyBookingStripVisible }"
      >
            <div ref="stickyDatesPopoverRef" class="booking-item booking-item-popover">
              <button
                type="button"
                class="booking-item-trigger"
                :class="{ 'is-open': openBookingPopover === 'dates' }"
                :aria-expanded="openBookingPopover === 'dates'"
                @mousedown.stop
                @click="toggleBookingPopover('dates')"
              >
                <span>Dates</span>
                <strong>{{ bookingDateSummary }}</strong>
                <small>{{ bookingDateMeta }}</small>
              </button>

              <div
                v-if="
                  !isBookingModalOpen &&
                  isStickyBookingStripVisible &&
                  openBookingPopover === 'dates'
                "
                class="booking-popover booking-popover-dates"
              >
                <div class="booking-popover-header booking-popover-header-dates">
                  <div>
                    <strong>Sélectionnez vos dates</strong>
                    <span
                      >Réservez au moins {{ MIN_BOOKING_NOTICE_DAYS }} jours à
                      l’avance.</span
                    >
                  </div>

                  <div class="booking-date-summary">
                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'arrival' }"
                      @click="activeCalendarStep = 'arrival'"
                    >
                      <span>Arrivée</span>
                      <strong>{{ formatLongDisplayDate(arrivalDate) }}</strong>
                    </button>

                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'departure' }"
                      @click="activeCalendarStep = 'departure'"
                    >
                      <span>Départ</span>
                      <strong>{{ formatLongDisplayDate(departureDate) }}</strong>
                    </button>
                  </div>
                </div>

                <div class="booking-calendar-shell">
                  <button
                    type="button"
                    class="calendar-nav-button"
                    :disabled="!canGoToPreviousCalendarMonth"
                    @click="shiftCalendarMonths(-1)"
                  >
                    ‹
                  </button>

                  <div class="calendar-months">
                    <section
                      v-for="month in visibleCalendarMonths"
                      :key="formatCalendarMonth(month)"
                      class="calendar-month"
                    >
                      <h4 class="calendar-month-title">{{ formatCalendarMonth(month) }}</h4>

                      <div class="calendar-weekdays">
                        <span
                          v-for="weekday in calendarWeekdayLabels"
                          :key="weekday"
                          class="calendar-weekday"
                        >
                          {{ weekday }}
                        </span>
                      </div>

                      <div class="calendar-grid">
                        <template v-for="day in buildCalendarDays(month)" :key="day.key">
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
                              @click="selectCalendarDate(day.isoDate)"
                            >
                              {{ day.label }}
                            </button>
                          </span>
                        </template>
                      </div>
                    </section>
                  </div>

                  <button type="button" class="calendar-nav-button" @click="shiftCalendarMonths(1)">
                    ›
                  </button>
                </div>

                <p class="booking-popover-note">
                  {{ pluralize(stayNights, "nuit", "nuits") }} sélectionnée(s).
                  Séjour autorisé : de {{ MIN_STAY_NIGHTS }} à {{ MAX_STAY_NIGHTS }} nuits.
                </p>
              </div>
            </div>

            <div ref="stickyGuestsPopoverRef" class="booking-item booking-item-popover">
              <button
                type="button"
                class="booking-item-trigger"
                :class="{ 'is-open': openBookingPopover === 'guests' }"
                :aria-expanded="openBookingPopover === 'guests'"
                @mousedown.stop
                @click="toggleBookingPopover('guests')"
              >
                <span>Voyageurs</span>
                <strong>{{ guestSummary }}</strong>
                <small>{{ guestMeta }}</small>
              </button>

              <div
                v-if="
                  !isBookingModalOpen &&
                  isStickyBookingStripVisible &&
                  openBookingPopover === 'guests'
                "
                class="booking-popover booking-popover-guests"
              >
                <div class="booking-popover-header">
                  <strong>Choisissez vos voyageurs</strong>
                  <span
                    >Adultes + enfants limités à {{ MAX_TRAVELERS }}. 1 bébé maximum.</span
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
                        :disabled="!canDecrementGuest('adults')"
                        @click="updateGuests('adults', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.adults }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('adults')"
                        @click="updateGuests('adults', 1)"
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
                        :disabled="!canDecrementGuest('children')"
                        @click="updateGuests('children', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.children }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('children')"
                        @click="updateGuests('children', 1)"
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
                        :disabled="!canDecrementGuest('babies')"
                        @click="updateGuests('babies', -1)"
                      >
                        -
                      </button>
                      <span class="stepper-value">{{ guestCounts.babies }}</span>
                      <button
                        type="button"
                        class="stepper-button"
                        :disabled="!canIncrementGuest('babies')"
                        @click="updateGuests('babies', 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        <button type="button" class="booking-button" @click="openBookingRequest">
          Réserver
        </button>
      </div>
  </div>

  <div class="page-flow">

    <section
      v-if="platformLinks.length"
      v-scroll-reveal
      class="page-band section platform-stats-section"
      aria-label="Notes des plateformes"
    >
      <div class="page-band__inner">
        <div class="section-head section-head--center platform-stats-head">
          <p class="eyebrow">{{ copy.platform_stats.eyebrow }}</p>
          <h2>{{ copy.platform_stats.title }}</h2>
          <p class="section-intro">{{ copy.platform_stats.intro }}</p>
        </div>
        <div class="platform-stats-grid">
          <a
            v-for="platform in platformLinks"
            :key="platform.name"
            :href="platform.url"
            target="_blank"
            rel="noreferrer"
            class="stat-card platform-stat-card"
          >
            <span class="platform-logo" :class="`platform-logo-${platform.id}`">
              <img
                :src="propertyAsset(platform.logo)"
                :alt="`${platform.name} logo`"
                class="platform-logo-image"
              />
            </span>

            <div class="platform-stat-main">
              <strong class="platform-name">{{ platform.name }}</strong>
              <div class="platform-stat-ratings">
                <span class="platform-stars">{{ platform.stars }}</span>
                <span class="platform-score">Note moyenne de {{ platform.rating }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section id="resume" v-scroll-reveal class="page-band page-band--sand section summary-section">
      <div class="page-band__inner">
        <div class="summary-layout">
          <div class="summary-media">
            <img
              :src="propertyAsset(hostPhoto)"
              :alt="copy.host.image_alt"
              class="summary-photo-img"
            />
            <p class="summary-caption">{{ copy.host.caption }}</p>
          </div>
          <div class="summary-copy">
            <p class="eyebrow">{{ copy.host.eyebrow }}</p>
            <h2>{{ copy.host.title }}</h2>
            <blockquote class="summary-quote">{{ copy.host.quote }}</blockquote>
            <p class="summary-host-intro">{{ copy.host.intro_1 }}</p>
            <p>{{ copy.host.intro_2 }}</p>
            <button type="button" class="summary-cta" @click="openBookingModal">
              {{ copy.host.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section id="espaces" v-scroll-reveal class="page-band page-band--light section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.spaces.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.spaces.title }}</h2>
            <p class="section-intro">{{ copy.spaces.intro }}</p>
          </div>
        </div>

        <div class="featured-layout">
          <article
            class="featured-card featured-card-large featured-card--interactive"
            role="button"
            tabindex="0"
            :aria-label="`Voir tous les espaces de vie — ${featuredSpaces[0].title}`"
            @click="openSpacesModal(featuredSpaces[0].galleryCategoryId)"
            @keydown.enter.prevent="openSpacesModal(featuredSpaces[0].galleryCategoryId)"
            @keydown.space.prevent="openSpacesModal(featuredSpaces[0].galleryCategoryId)"
          >
            <img
              :src="propertyAsset(featuredSpaces[0].image)"
              :alt="featuredSpaces[0].title"
              class="featured-image"
            />
            <div class="featured-overlay" />
            <div class="featured-content">
              <span class="featured-tag">{{ featuredSpaces[0].tag }}</span>
              <h3>{{ featuredSpaces[0].title }}</h3>
              <p>{{ featuredSpaces[0].text }}</p>
              <span class="featured-cta">Voir tous les espaces de vie ▸</span>
            </div>
          </article>

          <div class="featured-stack">
            <article
              v-for="space in featuredSpaces.slice(1)"
              :key="space.title"
              class="featured-card featured-card--interactive"
              role="button"
              tabindex="0"
              :aria-label="`Voir tous les espaces de vie — ${space.title}`"
              @click="openSpacesModal()"
              @keydown.enter.prevent="openSpacesModal()"
              @keydown.space.prevent="openSpacesModal()"
            >
              <img :src="propertyAsset(space.image)" :alt="space.title" class="featured-image" />
              <div class="featured-overlay" />
              <div class="featured-content">
                <span class="featured-tag">{{ space.tag }}</span>
                <h3>{{ space.title }}</h3>
                <p>{{ space.text }}</p>
                <span class="featured-cta">Voir tous les espaces de vie ▸</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section v-scroll-reveal class="page-band page-band--sand section">
      <div class="page-band__inner">
        <div class="section-head compact">
          <p class="eyebrow">{{ copy.benefits.eyebrow }}</p>
          <h2>{{ copy.benefits.title }}</h2>
        </div>

        <div class="benefits-grid">
          <article v-for="benefit in benefitCards" :key="benefit.title" class="info-card">
            <span class="block-icon" aria-hidden="true">
              <BenefitIcon :icon="benefit.icon" />
            </span>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.text }}</p>
          </article>
        </div>
      </div>
      </section>

    <section id="quartier" v-scroll-reveal class="page-band page-band--light section location-section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.location.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.location.title }}</h2>
            <p class="section-intro">{{ copy.location.intro }}</p>
          </div>
        </div>

        <div class="location-layout">
          <div class="location-map-card">
            <ClientOnly>
              <LocationMap
                :latitude="propertyLocation.latitude"
                :longitude="propertyLocation.longitude"
                :radius-meters="propertyLocation.radiusMeters"
                :address="propertyLocation.address"
              />
              <template #fallback>
                <div class="location-map-frame location-map-frame--placeholder" aria-hidden="true" />
              </template>
            </ClientOnly>
          </div>

          <div class="location-content">
            <p class="location-lead">{{ copy.location.lead }}</p>

            <div class="location-highlights">
              <article
                v-for="highlight in neighborhoodHighlights"
                :key="highlight.title"
                class="location-highlight-card"
              >
                <span class="location-highlight-icon" aria-hidden="true">
                  <LocationHighlightIcon :name="highlight.icon" />
                </span>
                <div class="location-highlight-body">
                  <h3>{{ highlight.title }}</h3>
                  <p>{{ highlight.text }}</p>
                </div>
              </article>
            </div>

          </div>
        </div>
      </div>
      </section>

    <section id="espaces-de-vie" v-scroll-reveal class="page-band page-band--sand section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.visual.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.visual.title }}</h2>
            <p class="section-intro">{{ copy.visual.intro }}</p>
          </div>
        </div>

        <div class="visual-grid">
          <article
            v-for="card in visualCards"
            :key="card.title"
            class="visual-card visual-card--interactive"
            role="button"
            tabindex="0"
            :aria-label="`Voir la galerie — ${card.title}`"
            @click="openSpacesModal()"
            @keydown.enter.prevent="openSpacesModal()"
            @keydown.space.prevent="openSpacesModal()"
          >
            <img :src="propertyAsset(card.image)" :alt="card.title" class="visual-image" />
            <div class="visual-copy">
              <h3>{{ card.title }}</h3>
              <p>{{ card.text }}</p>
            </div>
          </article>

          <button
            type="button"
            class="visual-card visual-card--cta"
            aria-label="Voir tous les espaces de vie en photos"
            @click="openSpacesModal"
          >
            <div class="visual-card-cta-body">
              <span class="visual-card-cta-eyebrow">{{ copy.visual.gallery_cta_eyebrow }}</span>
              <h3>{{ copy.visual.gallery_cta_title }}</h3>
              <p>{{ copy.visual.gallery_cta_text }}</p>
              <span class="visual-card-cta-action">{{ copy.visual.gallery_cta_action }}</span>
            </div>
          </button>
        </div>
      </div>
      </section>

    <section id="tarifs" v-scroll-reveal class="page-band page-band--light section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.pricing.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.pricing.title }}</h2>
            <p class="section-intro">{{ copy.pricing.intro }}</p>
          </div>
        </div>

        <div class="pricing-grid">
          <article v-for="price in pricingCards" :key="price.title" class="price-card">
            <span class="block-icon block-icon--center" aria-hidden="true">
              <svg
                v-if="price.icon === 'night'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              <svg
                v-else-if="price.icon === 'week'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
              </svg>
              <svg
                v-else-if="price.icon === 'month'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 2v4M16 2v4M3 10h18" />
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M7 15h2M11 15h2M15 15h2M7 19h2M11 19h2" />
              </svg>
            </span>
            <span class="price-card-label">{{ price.title }}</span>
            <strong>{{ price.value }}</strong>
            <p>{{ price.text }}</p>
          </article>
        </div>
      </div>
      </section>

    <section id="equipements" v-scroll-reveal class="page-band page-band--sand section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.amenities.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.amenities.title }}</h2>
            <p class="section-intro">{{ copy.amenities.intro }}</p>
          </div>
        </div>

        <div class="amenities-grid">
          <article v-for="group in amenityPreviewSections" :key="group.id" class="amenity-card">
            <h3>{{ group.title }}</h3>
            <ul class="amenity-list">
              <li
                v-for="item in visibleAmenityItems(group.items)"
                :key="item.id"
                class="amenity-list-item"
              >
                <span class="amenity-list-icon" aria-hidden="true">
                  <AmenityIcon :name="item.icon" />
                </span>
                <span class="amenity-list-label">{{ item.name }}</span>
              </li>
            </ul>
            <button
              v-if="amenitySectionHasMore(group)"
              type="button"
              class="amenity-card-more"
              @click="openAmenitiesModal"
            >
              Voir la suite
            </button>
          </article>
        </div>
      </div>
      </section>

    <section
      id="avis"
      v-scroll-reveal
      class="page-band page-band--dark section testimonials-section"
      :style="{ '--testimonials-section-bg': testimonialsSectionBg }"
    >
      <div class="page-band__inner">
        <div class="testimonials-head">
          <p class="eyebrow eyebrow-light">{{ copy.reviews.eyebrow }}</p>
          <h2>{{ copy.reviews.title }}</h2>
        </div>

        <div
          class="testimonials-carousel"
          aria-label="Avis voyageurs défilants"
        >
          <div class="testimonials-track">
            <article
              v-for="(review, index) in reviewMarqueeItems"
              :key="`${review.id}-${index}`"
              class="review-card"
              :aria-hidden="index >= reviews.length ? 'true' : undefined"
            >
              <div
                class="review-stars"
                role="img"
                :aria-label="review.rating ? `Évaluation ${review.rating}` : 'Évaluation'"
              >
                {{ ratingToStars(review.rating) || "☆☆☆☆☆" }}
              </div>
              <div v-review-quote-fade class="review-quote-wrap">
                <p class="review-quote">“{{ review.quote }}”</p>
              </div>
              <p class="review-author">{{ review.author }}</p>
              <span class="review-date">{{ review.date }}</span>
            </article>
          </div>
        </div>
      </div>
      </section>
    <section id="reglement" v-scroll-reveal class="page-band page-band--light section">
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.rules.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.rules.title }}</h2>
            <p class="section-intro">{{ copy.rules.intro }}</p>
          </div>
        </div>

        <div class="house-rules-schedule">
          <div class="house-rules-schedule-item">
            <span>{{ copy.rules.check_in_label }}</span>
            <strong>{{ copy.rules.check_in_time }}</strong>
          </div>
          <div class="house-rules-schedule-item">
            <span>{{ copy.rules.check_out_label }}</span>
            <strong>{{ copy.rules.check_out_time }}</strong>
          </div>
        </div>

        <div class="house-rules-grid">
          <article v-for="rule in houseRules" :key="rule.title" class="house-rule-card">
            <h3>{{ rule.title }}</h3>
            <p>{{ rule.text }}</p>
          </article>
        </div>
      </div>
      </section>

    </div>
  </div>

  <Teleport to="body">
    <Transition
      name="spaces-modal"
      @before-enter="onSpacesModalBeforeEnter"
      @after-enter="onSpacesModalAfterEnter"
    >
      <div
        v-if="isSpacesModalOpen"
        class="spaces-modal"
        :class="{
          'spaces-modal--revealed': spacesModalContentReady,
          'spaces-modal--photo': isSpaceGalleryCarouselOpen
        }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="isSpaceGalleryCarouselOpen ? 'spaces-modal-photo-title' : 'spaces-modal-title'"
      >
        <div class="spaces-modal-backdrop" @click="closeSpacesModal" />
        <div class="spaces-modal-panel" @click.stop>
            <div
              v-show="isSpaceGalleryCarouselOpen"
              class="spaces-modal-carousel"
              role="region"
              aria-label="Visionneuse photos"
            >
              <button
                type="button"
                class="spaces-modal-carousel-nav spaces-modal-carousel-nav--prev"
                :disabled="!canGoSpaceGalleryCarouselPrev"
                aria-label="Photo précédente"
                @click="goSpaceGalleryCarouselPrev"
              >
                <svg
                  class="spaces-modal-chevron"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div class="spaces-modal-carousel-stage">
                <img
                  v-if="spaceGalleryCarouselPhoto"
                  :key="spaceGalleryCarouselPhoto.src"
                  :src="spaceGalleryPublicSrc(spaceGalleryCarouselPhoto.src)"
                  :alt="spaceGalleryCarouselPhoto.alt"
                  class="spaces-modal-carousel-img"
                  decoding="async"
                />
              </div>

              <button
                type="button"
                class="spaces-modal-carousel-nav spaces-modal-carousel-nav--next"
                :disabled="!canGoSpaceGalleryCarouselNext"
                aria-label="Photo suivante"
                @click="goSpaceGalleryCarouselNext"
              >
                <svg
                  class="spaces-modal-chevron spaces-modal-chevron--right"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div
                v-if="spaceGalleryFlatItems.length > 1"
                class="spaces-modal-carousel-dots"
                role="tablist"
                aria-label="Navigation dans toutes les photos"
              >
                <button
                  v-for="(_, dotIndex) in spaceGalleryFlatItems"
                  :key="dotIndex"
                  type="button"
                  class="spaces-modal-carousel-dot"
                  :class="{ 'spaces-modal-carousel-dot--active': dotIndex === spacesModalPhotoIndex }"
                  role="tab"
                  :aria-selected="dotIndex === spacesModalPhotoIndex"
                  :aria-label="`Photo ${dotIndex + 1} sur ${spaceGalleryFlatItems.length}`"
                  @click="goSpaceGalleryCarouselTo(dotIndex)"
                />
              </div>
            </div>

          <header
            class="spaces-modal-header"
            :class="{ 'spaces-modal-header--overlay': isSpaceGalleryCarouselOpen }"
          >
            <div class="spaces-modal-header-row">
              <button
                v-if="isSpaceGalleryCarouselOpen"
                type="button"
                class="spaces-modal-back"
                aria-label="Retour à la galerie"
                @click="closeSpaceGalleryPhoto"
              >
                <svg
                  class="spaces-modal-chevron"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div class="spaces-modal-header-copy">
                <h2
                  :id="isSpaceGalleryCarouselOpen ? 'spaces-modal-photo-title' : 'spaces-modal-title'"
                >
                  {{
                    spaceGalleryCarouselCurrent
                      ? spaceGalleryCarouselCurrent.categoryTitle
                      : "Tous les espaces de vie"
                  }}
                </h2>
                <p v-if="spaceGalleryCarouselCurrent" class="spaces-modal-photo-desc">
                  {{ spaceGalleryCarouselCurrent.description }}
                </p>
              </div>
            </div>
            <p v-if="!isSpaceGalleryCarouselOpen" class="spaces-modal-lead">
              Parcourez chaque pièce en images, de jour comme de nuit.
            </p>
            <button type="button" class="spaces-modal-close" aria-label="Fermer" @click="closeSpacesModal">
              ×
            </button>
          </header>

          <div
            v-show="!isSpaceGalleryCarouselOpen"
            ref="spacesModalBodyRef"
            class="spaces-modal-body"
          >
              <section
                v-for="(category, sectionIndex) in spaceGalleryCategories"
                :key="category.id"
                class="spaces-modal-section"
                :data-spaces-modal-category="category.id"
                :style="{ '--section-index': sectionIndex }"
              >
                <h3 class="spaces-modal-section-title">{{ category.title }}</h3>
                <p class="spaces-modal-section-desc">{{ category.description }}</p>
                <div class="spaces-modal-grid">
                  <button
                    v-for="(src, index) in category.images"
                    :key="src"
                    type="button"
                    class="spaces-modal-figure"
                    :style="{ '--fig-index': index }"
                    :aria-label="`Agrandir — ${category.title}, photo ${index + 1}`"
                    @click="openSpaceGalleryPhoto(category, index)"
                  >
                    <img
                      :src="spaceGalleryPublicSrc(src)"
                      :alt="`${category.title} — photo ${index + 1}`"
                      class="spaces-modal-img"
                      loading="eager"
                      decoding="async"
                    />
                  </button>
                </div>
              </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="booking-modal">
      <div
        v-if="isBookingModalOpen"
        class="booking-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          bookingModalStep === 'payment' ? 'booking-modal-payment-title' : 'booking-modal-title'
        "
      >
        <div class="booking-modal-backdrop" @click.stop="closeBookingModal" />
        <div class="booking-modal-panel" @click.stop>
          <header class="booking-modal-header">
            <div class="booking-modal-header-row">
              <button
                v-if="bookingModalStep === 'payment'"
                type="button"
                class="booking-modal-back"
                aria-label="Retour au formulaire"
                @click="backToBookingDetails"
              >
                <svg
                  class="booking-modal-chevron"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div class="booking-modal-header-copy">
                <h2
                  :id="
                    bookingModalStep === 'payment'
                      ? 'booking-modal-payment-title'
                      : 'booking-modal-title'
                  "
                >
                  {{ bookingModalStep === "payment" ? "Paiement sécurisé" : "Réserver" }}
                </h2>
                <p v-if="bookingModalStep === 'details'" class="booking-modal-lead">
                  Tous les champs marqué d'une <span class="required-mark">*</span> sont obligatoires
                </p>
                <p v-else class="booking-modal-lead">
                  Réglez votre séjour par carte bancaire. Vous recevrez une confirmation par e-mail.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="booking-modal-close"
              aria-label="Fermer"
              @click.stop="closeBookingModal"
            >
              ×
            </button>
          </header>

          <form
            v-if="bookingModalStep === 'details'"
            class="booking-modal-body"
            novalidate
            @submit.prevent="goToBookingPayment"
          >
            <BookingReservationFields
              ref="bookingModalFieldsRef"
              instance="modal"
              show-required
              :dates-error="bookingModalErrors.dates"
              :guests-error="bookingModalErrors.guests"
            />

            <BookingModalPriceRecap
              :estimate="bookingModalPriceEstimate"
              :discount-amount-eur="bookingModalDiscountAmountEur"
              :booking-config="bookingConfig"
              :note="bookingModalPriceRecapNote"
            />

            <div class="booking-modal-name-row">
            <label
                class="booking-modal-comment"
                :class="{ 'has-error': bookingModalErrors.firstName }"
              >
                <span
                  >Prénom
                  <span class="required-mark" aria-hidden="true">*</span></span
                >
                <input
                  v-model="bookingGuestFirstName"
                  type="text"
                  name="guest-first-name"
                  autocomplete="given-name"
                  enterkeyhint="next"
                  class="booking-modal-input"
                  required
                  maxlength="80"
                  :aria-invalid="bookingModalErrors.firstName ? 'true' : undefined"
                  :aria-describedby="
                    bookingModalErrors.firstName ? 'booking-first-name-error' : undefined
                  "
                  placeholder="Camille"
                />
                <p
                  v-if="bookingModalErrors.firstName"
                  id="booking-first-name-error"
                  class="booking-field-error"
                  role="alert"
                >
                  {{ bookingModalErrors.firstName }}
                </p>
              </label>
              <label
                class="booking-modal-comment"
                :class="{ 'has-error': bookingModalErrors.lastName }"
              >
                <span
                  >Nom
                  <span class="required-mark" aria-hidden="true">*</span></span
                >
                <input
                  v-model="bookingGuestLastName"
                  type="text"
                  name="guest-last-name"
                  autocomplete="family-name"
                  enterkeyhint="next"
                  class="booking-modal-input"
                  required
                  maxlength="80"
                  :aria-invalid="bookingModalErrors.lastName ? 'true' : undefined"
                  :aria-describedby="
                    bookingModalErrors.lastName ? 'booking-last-name-error' : undefined
                  "
                  placeholder="Dupont"
                />
                <p
                  v-if="bookingModalErrors.lastName"
                  id="booking-last-name-error"
                  class="booking-field-error"
                  role="alert"
                >
                  {{ bookingModalErrors.lastName }}
                </p>
              </label>
            </div>

            <label class="booking-modal-comment" :class="{ 'has-error': bookingModalErrors.phone }">
              <span
                >Téléphone
                <span class="required-mark" aria-hidden="true">*</span></span
              >
              <input
                v-model="bookingGuestPhone"
                type="tel"
                name="guest-phone"
                autocomplete="tel"
                enterkeyhint="next"
                class="booking-modal-input"
                required
                maxlength="15"
                inputmode="numeric"
                pattern="[0-9]*"
                :aria-invalid="bookingModalErrors.phone ? 'true' : undefined"
                :aria-describedby="bookingModalErrors.phone ? 'booking-phone-error' : undefined"
                placeholder="0612345678"
                @input="onBookingPhoneInput"
              />
              <p
                v-if="bookingModalErrors.phone"
                id="booking-phone-error"
                class="booking-field-error"
                role="alert"
              >
                {{ bookingModalErrors.phone }}
              </p>
            </label>

            <label class="booking-modal-comment" :class="{ 'has-error': bookingModalErrors.email }">
              <span
                >Votre e-mail
                <span class="required-mark" aria-hidden="true">*</span></span
              >
              <input
                v-model="bookingGuestEmail"
                type="email"
                name="guest-email"
                autocomplete="email"
                enterkeyhint="next"
                class="booking-modal-input"
                required
                :aria-invalid="bookingModalErrors.email ? 'true' : undefined"
                :aria-describedby="bookingModalErrors.email ? 'booking-email-error' : undefined"
                placeholder="vous@exemple.com"
              />
              <p
                v-if="bookingModalErrors.email"
                id="booking-email-error"
                class="booking-field-error"
                role="alert"
              >
                {{ bookingModalErrors.email }}
              </p>
            </label>

            <label
              class="booking-modal-comment"
              :class="{ 'has-error': bookingModalErrors.message }"
            >
              <span
                >Message pour l’hôte
                <span class="required-mark" aria-hidden="true">*</span></span
              >
              <textarea
                v-model="bookingComment"
                class="booking-modal-textarea"
                rows="4"
                required
                :aria-invalid="bookingModalErrors.message ? 'true' : undefined"
                :aria-describedby="bookingModalErrors.message ? 'booking-message-error' : undefined"
                placeholder="Précisez l’heure d’arrivée, un lit bébé, ou toute autre demande…"
              />
              <p
                v-if="bookingModalErrors.message"
                id="booking-message-error"
                class="booking-field-error"
                role="alert"
              >
                {{ bookingModalErrors.message }}
              </p>
            </label>

            <p v-if="bookingSubmitError" class="booking-modal-submit-error" role="alert">
              {{ bookingSubmitError }}
            </p>

            <button
              type="submit"
              class="booking-modal-submit"
              :disabled="isBookingSubmitting"
            >
              {{
                isBookingSubmitting ? "Préparation du paiement…" : "Continuer vers le paiement"
              }}
            </button>
          </form>

          <div v-else class="booking-modal-body booking-modal-body--payment">
            <BookingModalPriceRecap
              :estimate="bookingModalPriceEstimate"
              :discount-amount-eur="bookingModalDiscountAmountEur"
              :booking-config="bookingConfig"
              title-id="booking-payment-recap-title"
              :note="bookingModalPriceRecapNotePayment"
            />

            <BookingStripePayment
              v-if="bookingPaymentClientSecret"
              :client-secret="bookingPaymentClientSecret"
              :total-label="formatEuro(bookingModalPriceEstimate.totalEur)"
              :guest-email="bookingGuestEmail.trim()"
              @success="onBookingPaymentSuccess"
              @error="onBookingPaymentError"
            />

            <p v-if="bookingSubmitError" class="booking-modal-submit-error" role="alert">
              {{ bookingSubmitError }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="booking-modal">
      <div
        v-if="isBookingSuccessModalOpen"
        class="booking-modal booking-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-success-modal-title"
      >
        <div class="booking-modal-backdrop" @click.stop="closeBookingSuccessModal" />
        <div class="booking-modal-panel booking-success-modal-panel" @click.stop>
          <header class="booking-modal-header booking-success-modal-header">
            <button
              type="button"
              class="booking-modal-close"
              aria-label="Fermer"
              @click.stop="closeBookingSuccessModal"
            >
              ×
            </button>
            <div class="booking-success-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.25" />
                <path
                  d="M14 24.5l7 7 13-13"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h2 id="booking-success-modal-title">Réservation confirmée</h2>
          </header>
          <div class="booking-success-modal-body">
            <p>
              Merci ! Votre paiement a bien été enregistré.
            </p>
            <p>
              Vous recevrez un e-mail de confirmation avec le récapitulatif de votre séjour. L’hôte pourra
              vous recontacter si besoin.
            </p>
            <button type="button" class="booking-modal-submit" @click="closeBookingSuccessModal">
              Compris
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="amenities-modal">
      <div
        v-if="isAmenitiesModalOpen"
        class="amenities-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="amenities-modal-title"
      >
        <div class="amenities-modal-backdrop" @click="closeAmenitiesModal" />
        <div class="amenities-modal-panel" @click.stop>
          <header class="amenities-modal-header">
            <h2 id="amenities-modal-title">Tous les équipements</h2>
            <p class="amenities-modal-lead">
              Liste complète des équipements disponibles dans le logement.
            </p>
            <button
              type="button"
              class="amenities-modal-close"
              aria-label="Fermer"
              @click="closeAmenitiesModal"
            >
              ×
            </button>
          </header>

          <div class="amenities-modal-body">
            <section
              v-for="section in amenityCatalog"
              :key="section.id"
              class="amenities-modal-section"
            >
              <h3 class="amenities-modal-section-title">{{ section.title }}</h3>
              <ul class="amenities-modal-list">
                <li v-for="item in section.items" :key="item.id" class="amenities-modal-item">
                  <span class="amenity-list-icon" aria-hidden="true">
                    <AmenityIcon :name="item.icon" />
                  </span>
                  <div class="amenities-modal-item-copy">
                    <strong>{{ item.name }}</strong>
                    <p v-if="item.description">{{ item.description }}</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="../../../assets/css/pages/index/base.css"></style>
<style scoped src="../../../assets/css/pages/index/responsive.css"></style>
<style>
@import "../../../assets/css/pages/index/hero.css";
</style>
