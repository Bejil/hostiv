import { computeBookingPriceEstimate } from "../../app/utils/booking-price"
import { getMergedBlockedNightDatesForProperty } from "./calendar-blocked"
import { getPropertySiteBySlug } from "./property-site-repository"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
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

function compareInputDates(left: string, right: string) {
  return fromInputDate(left).getTime() - fromInputDate(right).getTime()
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

function normalizePersonField(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "")
}

function normalizeMessage(text: string, maxLen: number) {
  const trimmed = text.trim().replace(/\r\n/g, "\n")

  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen)
  }

  return trimmed
}

function isValidPersonName(value: string) {
  const t = normalizePersonField(value)

  return t.length >= 2 && t.length <= 80
}

function isValidPhone(value: string) {
  const digits = normalizePhone(value)

  return digits.length >= 8 && digits.length <= 15
}

function enumerateStayNights(arrivalDate: string, departureDate: string) {
  const nights: string[] = []
  const departure = fromInputDate(departureDate)

  for (
    let cursor = fromInputDate(arrivalDate);
    cursor < departure;
    cursor = addDays(cursor, 1)
  ) {
    nights.push(toInputDate(cursor))
  }

  return nights
}

export type ParsedBookingReservation = {
  propertySlug: string
  propertyBrandName: string
  arrivalDate: string
  departureDate: string
  adults: number
  children: number
  babies: number
  lastName: string
  firstName: string
  phone: string
  guestEmail: string
  message: string
  stayNights: number
  mainGuests: number
  datesSummary: string
  datesMeta: string
  guestSummary: string
  guestMeta: string
  totalEur: number
  amountCents: number
  estimateLabel: string
}

export async function parseBookingReservationBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, message: "Corps de requête invalide." }
  }

  const o = body as Record<string, unknown>

  const propertySlug =
    typeof o.propertySlug === "string" ? o.propertySlug.trim().toLowerCase() : ""
  const normalizedSlug = propertySlug

  if (!propertySlug) {
    return { ok: false as const, message: "Site de réservation non précisé." }
  }

  const site = await getPropertySiteBySlug(propertySlug)

  if (!site) {
    return { ok: false as const, message: "Site de réservation introuvable." }
  }

  const booking = site.booking_config

  const arrivalDate = typeof o.arrivalDate === "string" ? o.arrivalDate.trim() : ""
  const departureDate = typeof o.departureDate === "string" ? o.departureDate.trim() : ""
  const adults = typeof o.adults === "number" ? Math.round(o.adults) : Number(o.adults)
  const children = typeof o.children === "number" ? Math.round(o.children) : Number(o.children)
  const babies = typeof o.babies === "number" ? Math.round(o.babies) : Number(o.babies)
  const lastName = typeof o.lastName === "string" ? o.lastName : ""
  const firstName = typeof o.firstName === "string" ? o.firstName : ""
  const phone = typeof o.phone === "string" ? o.phone : ""
  const guestEmail = typeof o.guestEmail === "string" ? o.guestEmail.trim() : ""
  const message = typeof o.message === "string" ? o.message : ""

  const minimumArrivalDate = toInputDate(
    addDays(new Date(), booking.min_booking_notice_days)
  )

  if (!arrivalDate || !departureDate) {
    return { ok: false as const, message: "Dates de séjour invalides." }
  }

  const minimumDepartureDate = toInputDate(
    addDays(fromInputDate(arrivalDate), booking.min_stay_nights)
  )
  const maximumDepartureDate = toInputDate(
    addDays(fromInputDate(arrivalDate), booking.max_stay_nights)
  )

  if (
    compareInputDates(arrivalDate, minimumArrivalDate) < 0 ||
    compareInputDates(departureDate, minimumDepartureDate) < 0 ||
    compareInputDates(departureDate, maximumDepartureDate) > 0
  ) {
    return { ok: false as const, message: "Les dates sélectionnées ne sont pas valides." }
  }

  const stayNights = enumerateStayNights(arrivalDate, departureDate).length

  if (stayNights < booking.min_stay_nights || stayNights > booking.max_stay_nights) {
    return { ok: false as const, message: "Durée de séjour invalide." }
  }

  const { dates: blockedDateList } = await getMergedBlockedNightDatesForProperty(normalizedSlug)
  const blockedDates = new Set(blockedDateList)
  const blockedNight = enumerateStayNights(arrivalDate, departureDate).find((night) =>
    blockedDates.has(night)
  )

  if (blockedNight) {
    return {
      ok: false as const,
      message: "Ces dates ne sont plus disponibles. Choisissez d’autres dates."
    }
  }

  if (!Number.isFinite(adults) || adults < 1) {
    return { ok: false as const, message: "Nombre de voyageurs invalide." }
  }

  const safeChildren = Number.isFinite(children) ? Math.max(0, children) : 0
  const safeBabies = Number.isFinite(babies) ? Math.max(0, babies) : 0
  const mainGuests = adults + safeChildren

  if (mainGuests < 1 || mainGuests > booking.max_travelers) {
    return { ok: false as const, message: "Nombre de voyageurs invalide." }
  }

  if (safeBabies > booking.max_babies) {
    return { ok: false as const, message: "Nombre de bébés invalide." }
  }

  if (!isValidPersonName(lastName)) {
    return { ok: false as const, message: "Nom invalide." }
  }

  if (!isValidPersonName(firstName)) {
    return { ok: false as const, message: "Prénom invalide." }
  }

  if (!isValidPhone(phone)) {
    return { ok: false as const, message: "Numéro de téléphone invalide." }
  }

  if (!guestEmail || !EMAIL_RE.test(guestEmail)) {
    return { ok: false as const, message: "Adresse e-mail invalide." }
  }

  if (!message.trim()) {
    return { ok: false as const, message: "Message obligatoire." }
  }

  const estimate = computeBookingPriceEstimate(stayNights, mainGuests, booking)
  const amountCents = estimate.totalEur * 100

  if (amountCents < 50) {
    return { ok: false as const, message: "Montant de réservation invalide." }
  }

  const guestSegments = [pluralize(adults, "adulte", "adultes")]

  if (safeChildren > 0) {
    guestSegments.push(pluralize(safeChildren, "enfant", "enfants"))
  }

  if (safeBabies > 0) {
    guestSegments.push(pluralize(safeBabies, "bébé", "bébés"))
  }

  const data: ParsedBookingReservation = {
    propertySlug,
    propertyBrandName: site.brand_name,
    arrivalDate,
    departureDate,
    adults,
    children: safeChildren,
    babies: safeBabies,
    lastName: normalizePersonField(lastName),
    firstName: normalizePersonField(firstName),
    phone: normalizePhone(phone),
    guestEmail,
    message: normalizeMessage(message, 8000),
    stayNights,
    mainGuests,
    datesSummary: `${formatDisplayDate(arrivalDate)} - ${formatDisplayDate(departureDate)}`,
    datesMeta: pluralize(stayNights, "nuit", "nuits"),
    guestSummary: guestSegments.join(" · "),
    guestMeta: safeBabies > 0 ? pluralize(safeBabies, "bébé", "bébés") : "",
    totalEur: estimate.totalEur,
    amountCents,
    estimateLabel: `${estimate.totalEur} €`
  }

  return { ok: true as const, data }
}

export function reservationToEmailPayload(data: ParsedBookingReservation) {
  return {
    propertySlug: data.propertySlug,
    guestEmail: data.guestEmail,
    lastName: data.lastName,
    firstName: data.firstName,
    phone: data.phone,
    datesSummary: data.datesSummary,
    datesMeta: data.datesMeta,
    guestSummary: data.guestSummary,
    guestMeta: data.guestMeta,
    stayNights: data.stayNights,
    mainGuests: data.mainGuests,
    paidByCard: true,
    message: data.message
  }
}

export function reservationStripeMetadata(data: ParsedBookingReservation) {
  return {
    propertySlug: data.propertySlug,
    propertyBrandName: data.propertyBrandName.slice(0, 500),
    arrivalDate: data.arrivalDate,
    departureDate: data.departureDate,
    adults: String(data.adults),
    children: String(data.children),
    babies: String(data.babies),
    lastName: data.lastName.slice(0, 500),
    firstName: data.firstName.slice(0, 500),
    phone: data.phone.slice(0, 500),
    guestEmail: data.guestEmail.slice(0, 500),
    datesSummary: data.datesSummary.slice(0, 500),
    datesMeta: data.datesMeta.slice(0, 500),
    guestSummary: data.guestSummary.slice(0, 500),
    guestMeta: data.guestMeta.slice(0, 500),
    estimateLabel: data.estimateLabel.slice(0, 500),
    message: data.message.slice(0, 500),
    totalEur: String(data.totalEur),
    emailsSent: "false"
  }
}
