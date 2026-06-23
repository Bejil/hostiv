<script setup lang="ts">
import type { Directive } from "vue"
import BenefitIcon from "../BenefitIcon.vue"
import AdminIcon from "../admin/AdminIcon.vue"
import type { PropertyGalleryCategory } from "../../types/property-site"
import type { PropertySiteRecord } from "../../types/property-site"
import { computeBookingPriceEstimate, formatEuro } from "../../utils/booking-price"
import BookingReservationFields from "../booking/BookingReservationFields.vue"
import BookingStripePayment from "../booking/BookingStripePayment.vue"
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
import { resolvePlatformLinkHref, visiblePlatformLinks } from "../../utils/platform-links"
import {
  normalizePlatformCustomIconId,
  normalizePlatformIconBg
} from "../../data/platform-custom-icons"
import { isPresetPlatformId } from "../../data/admin-platform-tabs"
import { resolvePlatformLogoPath } from "../../utils/platform-logo"
import { ratingToStars } from "../../utils/platform-rating-stars"
import { formatCancellationRefundPolicy } from "../../utils/cancellation-policy"
import { buildPricingDisplayCards } from "../../utils/pricing-display-cards"
import {
  amenitySectionHasMore,
  visibleAmenityItems
} from "../../utils/amenity-preview"
import { resolvePropertyInvoiceTheme } from "../../data/site-template-invoice-theme"
import { normalizeSiteTemplate } from "../../data/site-layouts"
import { siteBookingModalThemeStyle } from "../../utils/site-template-css-vars"
import { getSiteBookingModalLabels } from "../../data/site-booking-modal-labels"
import { getSiteGuestContactLabels } from "../../data/site-guest-contact-labels"
import SiteGuestContactModal from "./SiteGuestContactModal.vue"
import { getSiteUiLabels, siteUiFormat } from "../../data/site-ui-labels"
import type { HostivLocale } from "../../types/hostiv-locale"
import {
  formatHouseRuleTimeDisplay,
  hasValidHouseRuleTime
} from "../../utils/house-rules-time"
import { publishableGalleryCategories, resolveGalleryCategoryIdForCard } from "../../utils/gallery-category-admin"
import {
  resolveLocaleChromeField,
  resolveLocalizedFeaturedSpace
} from "../../utils/site-content-locale"
import HostivLocaleSelect from "../hostiv/HostivLocaleSelect.vue"
import { Mail } from "@lucide/vue"
import { appendAssetCacheRevision } from "../../utils/property-asset-url"

const props = withDefaults(
  defineProps<{
    site: PropertySiteRecord
    slug: string
    /** Rendu dans l’éditeur visuel admin : pas de réservation ni SEO document. */
    livePreview?: boolean
    /** Aperçu `/[slug]/preview` : envoie le jeton propriétaire aux APIs de réservation (site non publié). */
    ownerSitePreview?: boolean
    previewScrollAnchor?: string | null
    /** Langue du contenu affiché (aperçu admin) ; sinon locale visiteur. */
    contentLocale?: HostivLocale
    /** Invalide le cache navigateur après remplacement d’image (aperçu live). */
    previewAssetRevision?: number
    /** Pousse iframe — combiné à previewAssetRevision. */
    previewNonce?: number
  }>(),
  {
    livePreview: false,
    ownerSitePreview: false,
    previewScrollAnchor: null,
    contentLocale: undefined,
    previewAssetRevision: 0,
    previewNonce: 0
  }
)

const site = computed(() => props.site)
const slug = computed(() => props.slug)

const { locale: hostivLocale } = useHostivLocale()
const contentLocale = computed(() => props.contentLocale ?? hostivLocale.value)
const siteUi = computed(() => getSiteUiLabels(contentLocale.value))
const guestContactLabels = computed(() => getSiteGuestContactLabels(contentLocale.value))
const bookingModalLabels = computed(() => getSiteBookingModalLabels(contentLocale.value))
const dateLocale = computed(() => (contentLocale.value === "en" ? "en-GB" : "fr-FR"))

const bookingConfig = computed(() => site.value.booking_config)

/** Copie toujours complète (sites neufs / JSON partiel en base). */
const copy = computed(() => {
  const content = site.value.content

  return {
    header: {
      brand_name: site.value.brand_name,
      brand_meta: site.value.brand_meta,
      logo_alt: content?.copy?.header?.logo_alt ?? site.value.brand_name
    },
    hero: content?.copy?.hero ?? { eyebrow: "", title: "", text: "", image_alt: "" },
    platform_stats: content?.copy?.platform_stats ?? { eyebrow: "", title: "", intro: "" },
    host: content?.copy?.host ?? {
      caption: "",
      eyebrow: "",
      title: "",
      quote: "",
      intro_1: "",
      intro_2: "",
      image_alt: "",
      cta: ""
    },
    spaces: content?.copy?.spaces ?? { eyebrow: "", title: "", intro: "" },
    benefits: content?.copy?.benefits ?? { eyebrow: "", title: "" },
    location: content?.copy?.location ?? { eyebrow: "", title: "", intro: "", lead: "" },
    visual: content?.copy?.visual ?? {
      eyebrow: "",
      title: "",
      intro: "",
      gallery_cta_eyebrow: "",
      gallery_cta_title: "",
      gallery_cta_text: "",
      gallery_cta_action: ""
    },
    pricing: content?.copy?.pricing ?? { eyebrow: "", title: "", intro: "" },
    amenities: content?.copy?.amenities ?? { eyebrow: "", title: "", intro: "" },
    reviews: {
      eyebrow: content?.copy?.reviews?.eyebrow ?? "",
      title: content?.copy?.reviews?.title ?? "",
      intro: content?.copy?.reviews?.intro ?? ""
    },
    rules: content?.copy?.rules ?? {
      eyebrow: "",
      title: "",
      intro: "",
      check_in_label: "",
      check_in_time: "",
      check_out_label: "",
      check_out_time: ""
    },
    booking: content?.copy?.booking ?? {
      price_recap_note: "",
      price_recap_note_payment: ""
    }
  }
})
const siteTemplateConfig = computed(() =>
  normalizeSiteTemplate(site.value.content.template, { forPublic: true })
)
const siteTemplateClass = computed(
  () => `site-template site-template--${siteTemplateConfig.value.theme}`
)
const siteLayoutClass = computed(
  () => `site-layout site-layout--${siteTemplateConfig.value.layout}`
)
const bookingModalTemplateClass = computed(
  () => `site-template--${siteTemplateConfig.value.theme}`
)
const bookingModalThemeStyle = computed(() =>
  siteBookingModalThemeStyle(resolvePropertyInvoiceTheme(site.value))
)

const minBookingNoticeDays = computed(() => bookingConfig.value.min_booking_notice_days)
const minStayNights = computed(() => bookingConfig.value.min_stay_nights)
const maxStayNights = computed(() => bookingConfig.value.max_stay_nights)
const maxTravelers = computed(() => bookingConfig.value.max_travelers)
const maxBabies = computed(() => bookingConfig.value.max_babies)

const { propertyAsset: resolvePropertyAsset } = usePropertyAsset(slug)

const previewAssetCacheToken = computed(() => {
  const revision = props.previewAssetRevision ?? 0
  const nonce = props.previewNonce ?? 0

  if (!revision && !nonce) {
    return undefined
  }

  return `${revision}-${nonce}`
})

function propertyAsset(src: string) {
  const url = resolvePropertyAsset(src)

  if (!props.livePreview || !url) {
    return url
  }

  return appendAssetCacheRevision(url, previewAssetCacheToken.value)
}

if (!props.livePreview) {
  usePropertySiteSeo({ site, propertyAsset, slug })
}

usePropertySiteTrafficTrack(slug, {
  enabled: computed(() => !props.livePreview && !props.ownerSitePreview && props.site.published)
})

const heroImage = computed(() => site.value.hero_image_path)
const heroImageSrc = computed(() => propertyAsset(heroImage.value))
const testimonialsSectionBg = computed(
  () => `url('${propertyAsset(site.value.testimonials_bg_path)}')`
)

const minimumArrivalDate = computed(() =>
  toInputDate(addDays(new Date(), minBookingNoticeDays.value))
)

const calendarWeekdayLabels = computed(() => siteUi.value.booking.calendarWeekdays)

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

/** Normalise une date ISO (YYYY-MM-DD) quel que soit le format reçu (string, CalendarDate, Date). */
function normalizeInputDateString(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (
    value &&
    typeof value === "object" &&
    "year" in value &&
    "month" in value &&
    "day" in value
  ) {
    const calendarDate = value as { year: number; month: number; day: number }

    return `${calendarDate.year}-${String(calendarDate.month).padStart(2, "0")}-${String(calendarDate.day).padStart(2, "0")}`
  }

  if (value instanceof Date) {
    return toInputDate(value)
  }

  return ""
}

function compareInputDates(left: unknown, right: unknown) {
  return normalizeInputDateString(left).localeCompare(normalizeInputDateString(right))
}

function syncBookingDateRefs() {
  const arrival = normalizeInputDateString(arrivalDate.value)
  const departure = normalizeInputDateString(departureDate.value)

  if (arrival) {
    arrivalDate.value = arrival
  }

  if (departure) {
    departureDate.value = departure
  }
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    day: "numeric",
    month: "short"
  }).format(fromInputDate(value))
}

function formatLongDisplayDate(value: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
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

function formatCalendarMonth(date: Date) {
  const label = new Intl.DateTimeFormat(dateLocale.value, {
    month: "long",
    year: "numeric"
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

const arrivalDate = ref(
  toInputDate(addDays(new Date(), bookingConfig.value.min_booking_notice_days))
)
const departureDate = ref(
  toInputDate(
    addDays(fromInputDate(arrivalDate.value), bookingConfig.value.min_stay_nights)
  )
)

const openBookingPopover = ref<BookingPopover>(null)
const openBookingModalPopover = ref<BookingPopover>(null)
const isBookingModalOpen = ref(false)
const isGuestContactModalOpen = ref(false)
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
const visibleCalendarMonth = ref(startOfMonth(fromInputDate(minimumArrivalDate.value)))
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
  toInputDate(addDays(fromInputDate(arrivalDate.value), minStayNights.value))
)

const maximumDepartureDate = computed(() =>
  toInputDate(addDays(fromInputDate(arrivalDate.value), maxStayNights.value))
)

const visibleCalendarMonths = computed(() => [
  visibleCalendarMonth.value,
  addMonths(visibleCalendarMonth.value, 1)
])

const canGoToPreviousCalendarMonth = computed(() => {
  const previousMonth = addMonths(visibleCalendarMonth.value, -1)

  return previousMonth >= startOfMonth(fromInputDate(minimumArrivalDate.value))
})

const stayNights = computed(() => {
  const arrival = fromInputDate(arrivalDate.value)
  const departure = fromInputDate(departureDate.value)
  const millisecondsPerDay = 1000 * 60 * 60 * 24

  return Math.max(
    minStayNights.value,
    Math.round((departure.getTime() - arrival.getTime()) / millisecondsPerDay)
  )
})

const bookingDateSummary = computed(
  () => `${formatDisplayDate(arrivalDate.value)} - ${formatDisplayDate(departureDate.value)}`
)

const bookingDateMeta = computed(() => {
  const booking = siteUi.value.booking
  const nightsLabel = pluralize(stayNights.value, booking.night, booking.nights)

  return siteUiFormat(booking.dateMetaMaxStay, {
    nights: nightsLabel,
    max: maxStayNights.value
  })
})

const totalMainGuests = computed(() => guestCounts.adults + guestCounts.children)

const guestSummary = computed(() => {
  const booking = siteUi.value.booking
  const segments = [pluralize(guestCounts.adults, booking.adult, booking.adults)]

  if (guestCounts.children > 0) {
    segments.push(pluralize(guestCounts.children, booking.child, booking.childrenPlural))
  }

  if (guestCounts.babies > 0) {
    segments.push(pluralize(guestCounts.babies, booking.babySingular, booking.babiesPlural))
  }

  return segments.join(" · ")
})

const guestMeta = computed(() => {
  const booking = siteUi.value.booking
  const travelers = pluralize(totalMainGuests.value, booking.traveler, booking.travelersPlural)

  return siteUiFormat(booking.guestMetaMax, { travelers })
})

const bookAheadNoticeText = computed(() =>
  siteUiFormat(siteUi.value.booking.bookAheadNotice, {
    days: minBookingNoticeDays.value
  })
)

const travelersLimitNote = computed(() =>
  siteUiFormat(siteUi.value.booking.travelersLimitNote, {
    max: maxTravelers.value
  })
)

const bookingDatesPopoverNote = computed(() => {
  const booking = siteUi.value.booking
  const nightsWord = stayNights.value === 1 ? booking.night : booking.nights

  return siteUiFormat(booking.datesPopoverNote, {
    count: stayNights.value,
    nights: nightsWord,
    min: minStayNights.value,
    max: maxStayNights.value
  })
})

const bookingModalPriceEstimate = computed(() =>
  computeBookingPriceEstimate(
    stayNights.value,
    totalMainGuests.value,
    bookingConfig.value,
    contentLocale.value
  )
)

const bookingModalDiscountAmountEur = computed(() => {
  const e = bookingModalPriceEstimate.value

  return Math.max(0, e.baseLodgingEur - e.lodgingAfterDiscountEur)
})

const bookingModalPriceRecapNote = computed(() => copy.value.booking.price_recap_note)
const bookingModalPriceRecapNotePayment = computed(
  () => copy.value.booking.price_recap_note_payment
)

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
    addDays(fromInputDate(nextArrivalDate), minStayNights.value)
  )
  const nextMaximumDeparture = toInputDate(
    addDays(fromInputDate(nextArrivalDate), maxStayNights.value)
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
  syncBookingDateRefs()

  const errors = bookingModalLabels.value.errors
  let isValid = true

  if (!arrivalDate.value || !departureDate.value) {
    bookingModalErrors.dates = errors.datesMissing
    isValid = false
  } else if (
    compareInputDates(arrivalDate.value, minimumArrivalDate.value) < 0 ||
    compareInputDates(departureDate.value, minimumDepartureDate.value) < 0 ||
    compareInputDates(departureDate.value, maximumDepartureDate.value) > 0
  ) {
    bookingModalErrors.dates = errors.datesInvalid
    isValid = false
  }

  if (guestCounts.adults < 1 || totalMainGuests.value < 1) {
    bookingModalErrors.guests = errors.guestsMissing
    isValid = false
  }

  if (!isValidBookingPersonName(bookingGuestLastName.value)) {
    bookingModalErrors.lastName = errors.lastName
    isValid = false
  }

  if (!isValidBookingPersonName(bookingGuestFirstName.value)) {
    bookingModalErrors.firstName = errors.firstName
    isValid = false
  }

  if (!isValidBookingPhone(bookingGuestPhone.value)) {
    bookingModalErrors.phone = errors.phone
    isValid = false
  }

  if (!isValidBookingGuestEmail(bookingGuestEmail.value)) {
    bookingModalErrors.email = errors.email
    isValid = false
  }

  if (!bookingComment.value.trim()) {
    bookingModalErrors.message = errors.message
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

function openGuestContactModal() {
  closeBookingPopover()
  closeBookingModalPopover()
  closeAmenitiesModal()
  closeSpacesModal()
  closeBookingSuccessModal()
  closeBookingModal()
  isGuestContactModalOpen.value = true
}

function closeGuestContactModal() {
  isGuestContactModalOpen.value = false
}

function openBookingModal() {
  if (props.livePreview) {
    return
  }

  closeBookingPopover()
  closeAmenitiesModal()
  closeSpacesModal()
  closeBookingSuccessModal()
  closeGuestContactModal()
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
const isStripePaymentsReady = computed(() => Boolean(site.value.stripe_payments_ready))

const contactUsesOwnerAuth = computed(() => props.ownerSitePreview || props.livePreview)

async function bookingApiHeaders(): Promise<Record<string, string> | undefined> {
  if (!props.ownerSitePreview || typeof window === "undefined") {
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

function bookingApiPath(suffix: "create-payment-intent" | "complete") {
  if (props.ownerSitePreview) {
    return `/api/admin/${encodeURIComponent(slug.value)}/booking/${suffix}`
  }

  return `/api/booking/${suffix}`
}

async function goToBookingPayment() {
  bookingSubmitError.value = null
  syncBookingDateRefs()

  if (!validateBookingModal()) {
    return
  }

  if (typeof window === "undefined") {
    return
  }

  if (!isStripeConfigured.value) {
    bookingSubmitError.value = bookingModalLabels.value.submitErrors.stripeNotConfigured
    return
  }

  if (!isStripePaymentsReady.value) {
    bookingSubmitError.value = bookingModalLabels.value.submitErrors.paymentsNotReady
    return
  }

  isBookingSubmitting.value = true

  try {
    const headers = await bookingApiHeaders()

    if (props.ownerSitePreview && !headers) {
      bookingSubmitError.value = bookingModalLabels.value.submitErrors.sessionExpired
      return
    }

    const response = await $fetch(bookingApiPath("create-payment-intent"), {
      method: "POST",
      headers,
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
      bookingModalLabels.value.submitErrors.prepareFailed
  } finally {
    isBookingSubmitting.value = false
  }
}

async function onBookingPaymentSuccess(paymentIntentId: string) {
  bookingSubmitError.value = null
  isBookingSubmitting.value = true

  try {
    const headers = await bookingApiHeaders()

    await $fetch(bookingApiPath("complete"), {
      method: "POST",
      headers,
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
      bookingModalLabels.value.submitErrors.emailConfirmFailed
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
    return guestCounts.babies < maxBabies.value
  }

  return totalMainGuests.value < maxTravelers.value
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
    guestCounts.babies = Math.max(0, Math.min(maxBabies.value, guestCounts.babies + delta))
    return
  }

  const nextValue = guestCounts[type] + delta
  const projectedMainGuests = totalMainGuests.value + delta

  if (projectedMainGuests < 1 || projectedMainGuests > maxTravelers.value) {
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
  return toInputDate(addDays(fromInputDate(arrival), minStayNights.value))
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

  arrivalDate.value = minimumArrivalDate.value
  departureDate.value = toInputDate(
    addDays(fromInputDate(minimumArrivalDate.value), minStayNights.value)
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
    const isBeforeMinimumArrival = compareInputDates(isoDate, minimumArrivalDate.value) < 0
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

function onWindowResize() {
  scheduleHeroParallaxUpdate()

  if (typeof window !== "undefined" && window.innerWidth > 900) {
    closeMobileNav()
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
  window.addEventListener("resize", onWindowResize)
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
  window.removeEventListener("resize", onWindowResize)

  if (typeof document !== "undefined") {
    document.body.style.overflow = ""
  }

  if (heroParallaxFrame !== null) {
    window.cancelAnimationFrame(heroParallaxFrame)
  }
})

function isPublishedFeaturedSpace(space: {
  title?: string
  image?: string
} | null | undefined) {
  return Boolean(space?.title?.trim() && space?.image?.trim())
}

const featuredSpaces = computed(() => {
  const content = site.value.content
  const localeBase = content.locale_base
  const frSpaces = localeBase?.featured_spaces ?? content.featured_spaces ?? []
  const enSpaces = content.featured_spaces_en ?? []
  const displaySpaces = content.featured_spaces ?? []

  return displaySpaces
    .filter((space) => isPublishedFeaturedSpace(space))
    .map((space, index) => {
      const resolved = resolveLocalizedFeaturedSpace(
        contentLocale.value,
        frSpaces[index],
        enSpaces[index],
        space
      )

      return {
        title: resolved.title ?? "",
        text: resolved.text ?? "",
        image: resolved.image ?? "",
        tag: resolved.tag ?? "",
        galleryCategoryId: resolved.gallery_category_id ?? ""
      }
    })
})

const spaceGalleryCategories = computed(() =>
  publishableGalleryCategories(site.value.content.space_gallery_categories)
)

type SpaceGalleryCategory = PropertyGalleryCategory

const spaceGalleryFlatItems = computed(() =>
  spaceGalleryCategories.value.flatMap((category) =>
    (category?.images ?? []).map((src, photoIndexInCategory) => ({
      src,
      categoryId: category?.id ?? "",
      categoryTitle: category?.title ?? "",
      description: category?.description ?? "",
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
  scheduleSpacesModalBodyScroll()
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

function openSpacesModal(galleryCategoryId?: string, cardTitle?: string) {
  closeBookingPopover()
  closeBookingModal()
  closeBookingSuccessModal()

  const categoryId = resolveGalleryCategoryIdForCard(spaceGalleryCategories.value, {
    galleryCategoryId,
    title: cardTitle
  })

  spacesModalPendingScrollCategoryId.value = categoryId

  if (categoryId) {
    const firstPhotoIndex = spaceGalleryFlatItems.value.findIndex(
      (item) => item.categoryId === categoryId
    )

    spacesModalPhotoIndex.value = firstPhotoIndex >= 0 ? firstPhotoIndex : null
  } else {
    spacesModalPhotoIndex.value = null
  }

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

const hostPhoto = computed(() => site.value.host_photo_path)

function isPublishedBenefitCard(card: { title?: string } | null | undefined) {
  return Boolean(card?.title?.trim())
}

const publishedBenefitCards = computed(() =>
  (site.value.content.benefit_cards ?? []).filter((card) => isPublishedBenefitCard(card))
)

const showBenefitsSection = computed(() => publishedBenefitCards.value.length > 0)
function isPublishedVisualCard(card: { title?: string; image?: string } | null | undefined) {
  return Boolean(card?.title?.trim() && card?.image?.trim())
}

const visualCards = computed(() =>
  (site.value.content.visual_cards ?? [])
    .filter((card) => isPublishedVisualCard(card))
    .map((card) => ({
      title: card?.title ?? "",
      text: card?.text ?? "",
      image: card?.image ?? "",
      galleryCategoryId: card?.gallery_category_id ?? ""
    }))
)

const showVisualSection = computed(() => visualCards.value.length > 0)

const visualGalleryCta = computed(() => {
  const content = site.value.content
  const frVisual = content.locale_base?.copy.visual ?? content.copy?.visual
  const enVisual = content.copy_en?.visual
  const fallback = siteUi.value.visualGalleryCta

  return {
    eyebrow: resolveLocaleChromeField(
      contentLocale.value,
      frVisual?.gallery_cta_eyebrow,
      enVisual?.gallery_cta_eyebrow,
      fallback.eyebrow
    ),
    title: resolveLocaleChromeField(
      contentLocale.value,
      frVisual?.gallery_cta_title,
      enVisual?.gallery_cta_title,
      fallback.title
    ),
    text: resolveLocaleChromeField(
      contentLocale.value,
      frVisual?.gallery_cta_text,
      enVisual?.gallery_cta_text,
      fallback.text
    ),
    action: resolveLocaleChromeField(
      contentLocale.value,
      frVisual?.gallery_cta_action,
      enVisual?.gallery_cta_action,
      fallback.action
    )
  }
})
const hasPublishedLocation = computed(() => Boolean(site.value.location?.address?.trim()))

const propertyLocation = computed(() => ({
  address: site.value.location.address,
  latitude: site.value.location.latitude,
  longitude: site.value.location.longitude,
  radiusMeters: site.value.location.radius_meters
}))

function isPublishedAmenityItem(item: { name?: string } | null | undefined) {
  return Boolean(item?.name?.trim())
}

function isPublishedAmenitySection(
  section: { title?: string; items?: { name?: string }[] } | null | undefined
) {
  if (!section?.title?.trim()) {
    return false
  }

  return (section.items ?? []).some((item) => isPublishedAmenityItem(item))
}

function isPublishedReview(
  review: { author?: string; quote?: string } | null | undefined
) {
  return Boolean(review?.author?.trim() && review?.quote?.trim())
}

function isPublishedNeighborhoodHighlight(
  highlight: { title?: string } | null | undefined
) {
  return Boolean(highlight?.title?.trim())
}

const publishedNeighborhoodHighlights = computed(() =>
  (site.value.content.neighborhood_highlights ?? []).filter((highlight) =>
    isPublishedNeighborhoodHighlight(highlight)
  )
)

function isPublishedHouseRule(rule: { title?: string; text?: string } | null | undefined) {
  return Boolean(rule?.title?.trim() && rule?.text?.trim())
}

const publishedHouseRules = computed(() =>
  (site.value.content.house_rules ?? []).filter((rule) => isPublishedHouseRule(rule))
)

const rulesCheckInTime = computed(() => formatHouseRuleTimeDisplay(copy.value.rules.check_in_time))
const rulesCheckOutTime = computed(() => formatHouseRuleTimeDisplay(copy.value.rules.check_out_time))
const hasRulesCheckInTime = computed(() => hasValidHouseRuleTime(copy.value.rules.check_in_time))
const hasRulesCheckOutTime = computed(() => hasValidHouseRuleTime(copy.value.rules.check_out_time))
const showRulesSchedule = computed(
  () => hasRulesCheckInTime.value || hasRulesCheckOutTime.value
)

const showRulesSection = computed(
  () =>
    (hasRulesCheckInTime.value && hasRulesCheckOutTime.value) ||
    publishedHouseRules.value.length > 0
)

const rulesScheduleLabels = computed(() => {
  const content = site.value.content
  const frRules = content.locale_base?.copy.rules ?? content.copy?.rules
  const enRules = content.copy_en?.rules
  const fallback = siteUi.value.rulesSchedule

  return {
    checkIn: resolveLocaleChromeField(
      contentLocale.value,
      frRules?.check_in_label,
      enRules?.check_in_label,
      fallback.checkIn
    ),
    checkOut: resolveLocaleChromeField(
      contentLocale.value,
      frRules?.check_out_label,
      enRules?.check_out_label,
      fallback.checkOut
    )
  }
})

const summaryCtaLabel = computed(() => {
  const content = site.value.content
  const frHost = content.locale_base?.copy.host ?? content.copy?.host

  return resolveLocaleChromeField(
    contentLocale.value,
    frHost?.cta,
    content.copy_en?.host?.cta,
    siteUi.value.host.cta
  )
})

function platformScoreLabel(rating: string | number) {
  return siteUiFormat(siteUi.value.platform.averageRating, { rating })
}

const pricingCards = computed(() =>
  buildPricingDisplayCards(bookingConfig.value, contentLocale.value)
)
const bookingCancellationPolicyText = computed(() =>
  formatCancellationRefundPolicy(bookingConfig.value, contentLocale.value)
)
const platformLinks = computed(() =>
  visiblePlatformLinks(site.value.content.platform_links).map((link) => {
    const isPreset = isPresetPlatformId(link.id)

    return {
      ...link,
      logo: isPreset ? resolvePlatformLogoPath(link.logo, link.id) : "",
      url: resolvePlatformLinkHref(link.url, link.id),
      icon: isPreset ? undefined : normalizePlatformCustomIconId(link.icon),
      icon_bg: isPreset ? undefined : normalizePlatformIconBg(link.icon_bg),
      stars: ratingToStars(link.rating) || link.stars
    }
  })
)
const reviews = computed(() =>
  (site.value.content.reviews ?? []).filter((review) => isPublishedReview(review))
)

const showReviewsSection = computed(() => reviews.value.length > 0)

const amenityCatalog = computed(() => site.value.content.amenity_catalog)

const amenityPreviewSections = computed(() =>
  (site.value.content.amenity_preview_sections ?? []).filter((section) =>
    isPublishedAmenitySection(section)
  )
)

const showAmenitiesSection = computed(() => amenityPreviewSections.value.length > 0)

const reviewMarqueeItems = computed(() => [...reviews.value, ...reviews.value])

provide(
  BOOKING_RESERVATION_KEY,
  reactive({
  get MIN_BOOKING_NOTICE_DAYS() {
    return minBookingNoticeDays.value
  },
  get MIN_STAY_NIGHTS() {
    return minStayNights.value
  },
  get MAX_STAY_NIGHTS() {
    return maxStayNights.value
  },
  get MAX_TRAVELERS() {
    return maxTravelers.value
  },
  get MAX_BABIES() {
    return maxBabies.value
  },
  get calendarWeekdayLabels() {
    return calendarWeekdayLabels.value
  },
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
  selectCalendarDate,
  bookingLabels: computed(() => siteUi.value.booking),
  bookAheadNoticeText,
  travelersLimitNote,
  bookingDatesPopoverNote,
  bookingModalLabels
  })
)

const reviewQuoteObservers = new WeakMap<HTMLElement, ResizeObserver>()

function updateReviewQuoteFade(el: HTMLElement) {
  const overflows = el.scrollHeight > el.clientHeight + 1
  el.classList.toggle("review-quote-wrap--fade", overflows)
}

function scrollToLivePreviewAnchor(anchor: string | null | undefined) {
  if (!props.livePreview || !anchor || typeof document === "undefined") {
    return
  }

  nextTick(() => {
    const root = document.querySelector(".property-site-page-view--live-preview")

    if (!(root instanceof HTMLElement)) {
      return
    }

    const target = root.querySelector(`[data-live-section="${anchor}"]`)

    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  })
}

watch(
  () => props.previewScrollAnchor,
  (anchor) => {
    scrollToLivePreviewAnchor(anchor)
  }
)

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
  <div
    :class="[siteTemplateClass, siteLayoutClass, { 'property-site-page-view--live-preview': livePreview }]"
    data-live-section="site-top"
  >
    <header class="site-header" data-live-section="site-header">
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

        <div class="site-header__aside">
          <button
            type="button"
            class="site-header__contact"
            :aria-label="guestContactLabels.title"
            @click="openGuestContactModal"
          >
            <Mail :size="15" stroke-width="2.2" aria-hidden="true" />
            <span>{{ guestContactLabels.header }}</span>
          </button>
          <HostivLocaleSelect class="site-header__locale" />
        </div>
      </div>
    </header>

  <div class="page-shell">
    <section ref="heroCardRef" class="hero-card" data-live-section="site-hero">
      <div class="hero-media">
        <img
          :key="heroImageSrc"
          :src="heroImageSrc"
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
                <span>{{ siteUi.booking.dates }}</span>
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
                    <strong>{{ siteUi.booking.selectDates }}</strong>
                    <span>{{ bookAheadNoticeText }}</span>
                  </div>

                  <div class="booking-date-summary">
                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'arrival' }"
                      @click="activeCalendarStep = 'arrival'"
                    >
                      <span>{{ siteUi.booking.arrival }}</span>
                      <strong>{{ formatLongDisplayDate(arrivalDate) }}</strong>
                    </button>

                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'departure' }"
                      @click="activeCalendarStep = 'departure'"
                    >
                      <span>{{ siteUi.booking.departure }}</span>
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
                  {{ bookingDatesPopoverNote }}
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
                <span>{{ siteUi.booking.travelers }}</span>
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
                  <strong>{{ siteUi.booking.chooseTravelers }}</strong>
                  <span>{{ travelersLimitNote }}</span>
                </div>

                <div class="guest-stepper-list">
                  <div class="guest-stepper-row">
                    <div class="guest-stepper-copy">
                      <strong>{{ siteUi.booking.adultsLabel }}</strong>
                      <span>{{ siteUi.booking.adultsAge }}</span>
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
                      <strong>{{ siteUi.booking.children }}</strong>
                      <span>{{ siteUi.booking.childrenAge }}</span>
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
                      <strong>{{ siteUi.booking.babies }}</strong>
                      <span>{{ siteUi.booking.babyAge }}</span>
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
          {{ siteUi.booking.book }}
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
                <span>{{ siteUi.booking.dates }}</span>
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
                    <strong>{{ siteUi.booking.selectDates }}</strong>
                    <span>{{ bookAheadNoticeText }}</span>
                  </div>

                  <div class="booking-date-summary">
                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'arrival' }"
                      @click="activeCalendarStep = 'arrival'"
                    >
                      <span>{{ siteUi.booking.arrival }}</span>
                      <strong>{{ formatLongDisplayDate(arrivalDate) }}</strong>
                    </button>

                    <button
                      type="button"
                      class="booking-date-chip"
                      :class="{ 'is-active': activeCalendarStep === 'departure' }"
                      @click="activeCalendarStep = 'departure'"
                    >
                      <span>{{ siteUi.booking.departure }}</span>
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
                  {{ bookingDatesPopoverNote }}
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
                <span>{{ siteUi.booking.travelers }}</span>
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
                  <strong>{{ siteUi.booking.chooseTravelers }}</strong>
                  <span>{{ travelersLimitNote }}</span>
                </div>

                <div class="guest-stepper-list">
                  <div class="guest-stepper-row">
                    <div class="guest-stepper-copy">
                      <strong>{{ siteUi.booking.adultsLabel }}</strong>
                      <span>{{ siteUi.booking.adultsAge }}</span>
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
                      <strong>{{ siteUi.booking.children }}</strong>
                      <span>{{ siteUi.booking.childrenAge }}</span>
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
                      <strong>{{ siteUi.booking.babies }}</strong>
                      <span>{{ siteUi.booking.babyAge }}</span>
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
          {{ siteUi.booking.book }}
        </button>
      </div>
  </div>

  <div class="page-flow">

    <section
      v-if="platformLinks.length"
      v-scroll-reveal
      class="page-band section platform-stats-section"
      data-live-section="site-platforms"
      aria-label="Notes des plateformes"
    >
      <div class="page-band__inner">
        <div class="section-head section-head--center platform-stats-head">
          <p class="eyebrow">{{ copy.platform_stats.eyebrow }}</p>
          <h2>{{ copy.platform_stats.title }}</h2>
          <p class="section-intro">{{ copy.platform_stats.intro }}</p>
        </div>
        <div class="platform-stats-grid">
          <component
            v-for="platform in platformLinks"
            :key="platform.name"
            :is="platform.url ? 'a' : 'div'"
            :href="platform.url || undefined"
            :target="platform.url ? '_blank' : undefined"
            :rel="platform.url ? 'noreferrer' : undefined"
            class="stat-card platform-stat-card"
          >
            <span
              class="platform-logo"
              :class="
                isPresetPlatformId(platform.id)
                  ? `platform-logo-${platform.id}`
                  : 'platform-logo--custom'
              "
              :style="
                !isPresetPlatformId(platform.id) && platform.icon_bg
                  ? { backgroundColor: platform.icon_bg }
                  : undefined
              "
            >
              <img
                v-if="isPresetPlatformId(platform.id)"
                :src="propertyAsset(platform.logo)"
                :alt="`${platform.name} logo`"
                class="platform-logo-image"
              />
              <AdminIcon
                v-else
                :name="platform.icon ?? 'star'"
                :size="22"
                class="platform-logo-icon"
              />
            </span>

            <div class="platform-stat-main">
              <strong class="platform-name">{{ platform.name }}</strong>
              <div class="platform-stat-ratings">
                <span class="platform-stars">{{ platform.stars }}</span>
                <span class="platform-score">{{ platformScoreLabel(platform.rating) }}</span>
              </div>
            </div>
          </component>
        </div>
      </div>
    </section>

    <section
      id="resume"
      v-scroll-reveal
      class="page-band page-band--sand section summary-section"
      data-live-section="site-host"
    >
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
              {{ summaryCtaLabel }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="featuredSpaces.length"
      id="espaces"
      v-scroll-reveal
      class="page-band page-band--light section"
      data-live-section="site-featured"
    >
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
            :aria-label="`Voir la galerie — ${featuredSpaces[0]?.title || 'Espace'}`"
            @click="openSpacesModal(featuredSpaces[0]?.galleryCategoryId, featuredSpaces[0]?.title)"
            @keydown.enter.prevent="openSpacesModal(featuredSpaces[0]?.galleryCategoryId, featuredSpaces[0]?.title)"
            @keydown.space.prevent="openSpacesModal(featuredSpaces[0]?.galleryCategoryId, featuredSpaces[0]?.title)"
          >
            <img
              :src="propertyAsset(featuredSpaces[0]?.image)"
              :alt="featuredSpaces[0]?.title"
              class="featured-image"
            />
            <div class="featured-overlay" />
            <div class="featured-content">
              <span v-if="featuredSpaces[0]?.tag" class="featured-tag">{{ featuredSpaces[0]?.tag }}</span>
              <h3>{{ featuredSpaces[0]?.title }}</h3>
              <p>{{ featuredSpaces[0]?.text }}</p>
              <span class="featured-cta">{{ siteUi.featured.seeAllSpaces }}</span>
            </div>
          </article>

          <div v-if="featuredSpaces.length > 1" class="featured-stack">
            <article
              v-for="space in featuredSpaces.slice(1)"
              :key="space.title || space.image"
              class="featured-card featured-card--interactive"
              role="button"
              tabindex="0"
              :aria-label="`Voir la galerie — ${space.title}`"
              @click="openSpacesModal(space.galleryCategoryId, space.title)"
              @keydown.enter.prevent="openSpacesModal(space.galleryCategoryId, space.title)"
              @keydown.space.prevent="openSpacesModal(space.galleryCategoryId, space.title)"
            >
              <img :src="propertyAsset(space.image)" :alt="space.title" class="featured-image" />
              <div class="featured-overlay" />
              <div class="featured-content">
                <span v-if="space.tag" class="featured-tag">{{ space.tag }}</span>
                <h3>{{ space.title }}</h3>
                <p>{{ space.text }}</p>
                <span class="featured-cta">{{ siteUi.featured.seeAllSpaces }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="showBenefitsSection"
      v-scroll-reveal
      class="page-band page-band--sand section"
      data-live-section="site-benefits"
    >
      <div class="page-band__inner">
        <div class="section-head compact">
          <p class="eyebrow">{{ copy.benefits.eyebrow }}</p>
          <h2>{{ copy.benefits.title }}</h2>
        </div>

        <div class="benefits-grid">
          <article v-for="benefit in publishedBenefitCards" :key="benefit.title" class="info-card">
            <span class="block-icon" aria-hidden="true">
              <BenefitIcon :icon="benefit.icon" />
            </span>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.text }}</p>
          </article>
        </div>
      </div>
      </section>

    <section
      v-if="hasPublishedLocation"
      id="quartier"
      v-scroll-reveal
      class="page-band page-band--light section location-section"
      data-live-section="site-location"
    >
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
                v-for="highlight in publishedNeighborhoodHighlights"
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

    <section
      v-if="showVisualSection"
      id="espaces-de-vie"
      v-scroll-reveal
      class="page-band page-band--sand section"
      data-live-section="site-media"
    >
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
            @click="openSpacesModal(card.galleryCategoryId, card.title)"
            @keydown.enter.prevent="openSpacesModal(card.galleryCategoryId, card.title)"
            @keydown.space.prevent="openSpacesModal(card.galleryCategoryId, card.title)"
          >
            <img :src="propertyAsset(card.image)" :alt="card.title" class="visual-image" />
            <div class="visual-copy">
              <h3>{{ card.title }}</h3>
              <p>{{ card.text }}</p>
            </div>
          </article>

          <button
            v-if="visualCards.length"
            type="button"
            class="visual-card visual-card--cta"
            aria-label="Voir tous les espaces de vie en photos"
            @click="openSpacesModal"
          >
            <div class="visual-card-cta-body">
              <span class="visual-card-cta-eyebrow">{{ visualGalleryCta.eyebrow }}</span>
              <h3>{{ visualGalleryCta.title }}</h3>
              <p>{{ visualGalleryCta.text }}</p>
              <span class="visual-card-cta-action">{{ visualGalleryCta.action }}</span>
            </div>
          </button>
        </div>
      </div>
      </section>

    <section
      id="tarifs"
      v-scroll-reveal
      class="page-band page-band--light section"
      data-live-section="site-pricing"
    >
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.pricing.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.pricing.title }}</h2>
            <p class="section-intro">{{ copy.pricing.intro }}</p>
          </div>
        </div>

        <div class="pricing-grid">
          <article
            v-for="price in pricingCards"
            :key="price.title"
            class="price-card"
          >
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

        <p
          v-if="bookingCancellationPolicyText"
          class="pricing-cancellation"
        >
          {{ bookingCancellationPolicyText }}
        </p>
      </div>
      </section>

    <section
      v-if="showAmenitiesSection"
      id="equipements"
      v-scroll-reveal
      class="page-band page-band--sand section"
      data-live-section="site-amenities"
    >
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
              {{ siteUi.amenities.seeMore }}
            </button>
          </article>
        </div>
      </div>
      </section>

    <section
      v-if="showReviewsSection"
      id="avis"
      v-scroll-reveal
      class="page-band page-band--dark section testimonials-section"
      data-live-section="site-reviews"
      :style="{ '--testimonials-section-bg': testimonialsSectionBg }"
    >
      <div class="page-band__inner">
        <div class="testimonials-top">
          <div class="testimonials-head">
            <p class="eyebrow eyebrow-light">{{ copy.reviews.eyebrow }}</p>
            <h2>{{ copy.reviews.title }}</h2>
            <p v-if="copy.reviews.intro.trim()" class="testimonials-intro">
              {{ copy.reviews.intro }}
            </p>
          </div>
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
    <section
      v-if="showRulesSection"
      id="reglement"
      v-scroll-reveal
      class="page-band page-band--light section"
      data-live-section="site-rules"
    >
      <div class="page-band__inner">
        <div class="section-head">
          <p class="eyebrow">{{ copy.rules.eyebrow }}</p>
          <div class="section-head-row">
            <h2>{{ copy.rules.title }}</h2>
            <p class="section-intro">{{ copy.rules.intro }}</p>
          </div>
        </div>

        <div v-if="showRulesSchedule" class="house-rules-schedule">
          <div v-if="hasRulesCheckInTime" class="house-rules-schedule-item">
            <span>{{ rulesScheduleLabels.checkIn }}</span>
            <strong>{{ rulesCheckInTime }}</strong>
          </div>
          <div v-if="hasRulesCheckOutTime" class="house-rules-schedule-item">
            <span>{{ rulesScheduleLabels.checkOut }}</span>
            <strong>{{ rulesCheckOutTime }}</strong>
          </div>
        </div>

        <div v-if="publishedHouseRules.length" class="house-rules-grid">
          <article
            v-for="rule in publishedHouseRules"
            :key="rule.title"
            class="house-rule-card"
          >
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
                    :key="`${category.id}-${index}-${src}`"
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
        :class="bookingModalTemplateClass"
        :style="bookingModalThemeStyle"
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
                :aria-label="bookingModalLabels.backToForm"
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
                  {{
                    bookingModalStep === "payment"
                      ? bookingModalLabels.paymentTitle
                      : bookingModalLabels.title
                  }}
                </h2>
                <p v-if="bookingModalStep === 'details'" class="booking-modal-lead">
                  <template
                    v-for="(part, index) in bookingModalLabels.detailsLead.split('{mark}')"
                    :key="index"
                  >
                    {{ part }}<span v-if="index === 0" class="required-mark">*</span>
                  </template>
                </p>
                <p v-else class="booking-modal-lead">
                  {{ bookingModalLabels.paymentLead }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="booking-modal-close"
              :aria-label="bookingModalLabels.close"
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
              :labels="bookingModalLabels"
              :locale="contentLocale"
              :note="bookingModalPriceRecapNote"
              :cancellation-policy="bookingCancellationPolicyText"
            />

            <div class="booking-modal-name-row">
            <label
                class="booking-modal-comment"
                :class="{ 'has-error': bookingModalErrors.firstName }"
              >
                <span
                  >{{ bookingModalLabels.firstName }}
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
                  :placeholder="bookingModalLabels.firstNamePlaceholder"
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
                  >{{ bookingModalLabels.lastName }}
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
                  :placeholder="bookingModalLabels.lastNamePlaceholder"
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
                >{{ bookingModalLabels.phone }}
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
                :placeholder="bookingModalLabels.phonePlaceholder"
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
                >{{ bookingModalLabels.email }}
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
                :placeholder="bookingModalLabels.emailPlaceholder"
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
                >{{ bookingModalLabels.message }}
                <span class="required-mark" aria-hidden="true">*</span></span
              >
              <textarea
                v-model="bookingComment"
                class="booking-modal-textarea"
                rows="4"
                required
                :aria-invalid="bookingModalErrors.message ? 'true' : undefined"
                :aria-describedby="bookingModalErrors.message ? 'booking-message-error' : undefined"
                :placeholder="bookingModalLabels.messagePlaceholder"
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
                isBookingSubmitting
                  ? bookingModalLabels.preparingPayment
                  : bookingModalLabels.continueToPayment
              }}
            </button>
          </form>

          <div v-else class="booking-modal-body booking-modal-body--payment">
            <BookingModalPriceRecap
              :estimate="bookingModalPriceEstimate"
              :discount-amount-eur="bookingModalDiscountAmountEur"
              :booking-config="bookingConfig"
              :labels="bookingModalLabels"
              :locale="contentLocale"
              title-id="booking-payment-recap-title"
              :note="bookingModalPriceRecapNotePayment"
              :cancellation-policy="bookingCancellationPolicyText"
            />

            <BookingStripePayment
              v-if="bookingPaymentClientSecret"
              :client-secret="bookingPaymentClientSecret"
              :locale="contentLocale"
              :labels="bookingModalLabels"
              :total-label="formatEuro(bookingModalPriceEstimate.totalEur, contentLocale)"
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
        :class="bookingModalTemplateClass"
        :style="bookingModalThemeStyle"
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
              :aria-label="bookingModalLabels.close"
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
            <h2 id="booking-success-modal-title">{{ bookingModalLabels.success.title }}</h2>
          </header>
          <div class="booking-success-modal-body">
            <p>
              {{ bookingModalLabels.success.line1 }}
            </p>
            <p>
              {{ bookingModalLabels.success.line2 }}
            </p>
            <button type="button" class="booking-modal-submit" @click="closeBookingSuccessModal">
              {{ bookingModalLabels.success.button }}
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
            <h2 id="amenities-modal-title">{{ siteUi.amenities.modalTitle }}</h2>
            <p class="amenities-modal-lead">
              {{ siteUi.amenities.modalLead }}
            </p>
            <button
              type="button"
              class="amenities-modal-close"
              :aria-label="siteUi.amenities.modalCloseAria"
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

  <SiteGuestContactModal
    :open="isGuestContactModalOpen"
    :slug="slug"
    :brand-name="site.brand_name"
    :locale="contentLocale"
    :template-class="bookingModalTemplateClass"
    :theme-style="bookingModalThemeStyle"
    :use-owner-auth="contactUsesOwnerAuth"
    @close="closeGuestContactModal"
  />
</template>

<style scoped src="../../../assets/css/pages/index/base.css"></style>
<style scoped src="../../../assets/css/pages/index/responsive.css"></style>
<style>
@import "../../../assets/css/components/hostiv-locale-select.css";
@import "../../../assets/css/pages/index/site-layouts.css";
@import "../../../assets/css/pages/index/hero.css";

/* Non-scoped : garantit le header sticky (y compris aperçu live dans iframe). */
.site-template > .site-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
