import type {
  AdminBookingReservation,
  BookingReservationStatus
} from "../../app/types/booking-reservation"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function isValidInputDate(value: string) {
  return fromInputDate(value) !== null
}

export function computeStayNights(arrivalDate: string, departureDate: string): number {
  const arrival = fromInputDate(arrivalDate)
  const departure = fromInputDate(departureDate)

  if (!arrival || !departure || departure <= arrival) {
    return 0
  }

  const msPerDay = 24 * 60 * 60 * 1000

  return Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
}

export type ParsedAdminBookingReservationUpdate = {
  arrival_date: string
  departure_date: string
  stay_nights: number
  adults: number
  children: number
  babies: number
  main_guests: number
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  guest_phone: string
  message: string
  total_eur: number
  status: BookingReservationStatus
  cancelled_at: string | null
}

export function parseAdminBookingReservationUpdate(
  body: unknown
): { ok: true; data: ParsedAdminBookingReservationUpdate } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Corps de requête invalide." }
  }

  const o = body as Record<string, unknown>
  const arrival_date = typeof o.arrival_date === "string" ? o.arrival_date.trim() : ""
  const departure_date = typeof o.departure_date === "string" ? o.departure_date.trim() : ""
  const guest_first_name =
    typeof o.guest_first_name === "string" ? o.guest_first_name.trim() : ""
  const guest_last_name = typeof o.guest_last_name === "string" ? o.guest_last_name.trim() : ""
  const guest_email = typeof o.guest_email === "string" ? o.guest_email.trim() : ""
  const guest_phone = typeof o.guest_phone === "string" ? o.guest_phone.trim() : ""
  const message = typeof o.message === "string" ? o.message.trim() : ""
  const status: BookingReservationStatus =
    o.status === "cancelled" ? "cancelled" : "confirmed"

  const adults = Number(o.adults)
  const children = Number(o.children ?? 0)
  const babies = Number(o.babies ?? 0)
  const total_eur = Number(o.total_eur)

  if (!isValidInputDate(arrival_date) || !isValidInputDate(departure_date)) {
    return { ok: false, message: "Dates d’arrivée ou de départ invalides." }
  }

  const stay_nights = computeStayNights(arrival_date, departure_date)

  if (stay_nights < 1) {
    return { ok: false, message: "La date de départ doit être après l’arrivée." }
  }

  if (!Number.isFinite(adults) || adults < 1 || adults > 20) {
    return { ok: false, message: "Nombre d’adultes invalide." }
  }

  if (!Number.isFinite(children) || children < 0 || children > 20) {
    return { ok: false, message: "Nombre d’enfants invalide." }
  }

  if (!Number.isFinite(babies) || babies < 0 || babies > 10) {
    return { ok: false, message: "Nombre de bébés invalide." }
  }

  if (!Number.isFinite(total_eur) || total_eur < 0) {
    return { ok: false, message: "Montant invalide." }
  }

  if (guest_first_name.length < 2 || guest_last_name.length < 2) {
    return { ok: false, message: "Prénom et nom du voyageur requis." }
  }

  if (!EMAIL_RE.test(guest_email)) {
    return { ok: false, message: "E-mail du voyageur invalide." }
  }

  const phoneDigits = guest_phone.replace(/\D/g, "")

  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { ok: false, message: "Téléphone du voyageur invalide." }
  }

  if (message.length > 2000) {
    return { ok: false, message: "Message trop long (2000 caractères max.)." }
  }

  return {
    ok: true,
    data: {
      arrival_date,
      departure_date,
      stay_nights,
      adults,
      children,
      babies,
      main_guests: adults + children,
      guest_first_name,
      guest_last_name,
      guest_email,
      guest_phone,
      message,
      total_eur: Math.round(total_eur * 100) / 100,
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null
    }
  }
}

export type AdminBookingReservationDetail = AdminBookingReservation & {
  updated_at?: string
  cancelled_at?: string | null
}
