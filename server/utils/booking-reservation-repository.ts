import type {
  AdminBookingReservation,
  AdminBookingReservationStatus
} from "../../app/types/booking-reservation"
import type { ParsedAdminBookingReservationUpdate } from "./admin-booking-reservation"
import type { ParsedBookingReservation } from "./booking-reservation"
import { requireSupabaseAdmin } from "./supabase"

const BOOKING_RESERVATION_SELECT =
  "id, status, arrival_date, departure_date, stay_nights, adults, children, babies, main_guests, guest_first_name, guest_last_name, guest_email, guest_phone, message, total_eur, stripe_payment_intent_id, refunded_at, stripe_refund_id, created_at, updated_at, cancelled_at"

function todayInputDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function displayStatus(row: {
  status: string
  departure_date: string
}): AdminBookingReservationStatus {
  if (row.status === "cancelled") {
    return "cancelled"
  }

  return row.departure_date < todayInputDate() ? "past" : "upcoming"
}

function mapReservationRow(row: Record<string, unknown>): AdminBookingReservation {
  return {
    id: String(row.id),
    status: row.status === "cancelled" ? "cancelled" : "confirmed",
    arrival_date: String(row.arrival_date),
    departure_date: String(row.departure_date),
    stay_nights: Number(row.stay_nights || 0),
    adults: Number(row.adults || 0),
    children: Number(row.children || 0),
    babies: Number(row.babies || 0),
    main_guests: Number(row.main_guests || 0),
    guest_first_name: String(row.guest_first_name || ""),
    guest_last_name: String(row.guest_last_name || ""),
    guest_email: String(row.guest_email || ""),
    guest_phone: String(row.guest_phone || ""),
    message: String(row.message || ""),
    total_eur: Number(row.total_eur || 0),
    stripe_payment_intent_id:
      typeof row.stripe_payment_intent_id === "string" ? row.stripe_payment_intent_id : null,
    refunded_at: typeof row.refunded_at === "string" ? row.refunded_at : null,
    stripe_refund_id: typeof row.stripe_refund_id === "string" ? row.stripe_refund_id : null,
    created_at: String(row.created_at || ""),
    display_status: displayStatus({
      status: String(row.status || "confirmed"),
      departure_date: String(row.departure_date)
    })
  }
}

async function getPropertyIdBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    throw error
  }

  return typeof data?.id === "string" ? data.id : null
}

export async function saveConfirmedBookingReservation(
  reservation: ParsedBookingReservation,
  stripePaymentIntentId: string
) {
  try {
    const propertyId = await getPropertyIdBySlug(reservation.propertySlug)

    if (!propertyId) {
      console.warn("[booking-reservations] property not found:", reservation.propertySlug)
      return
    }

    const supabase = requireSupabaseAdmin()
    const { error } = await supabase.from("booking_reservations").upsert(
      {
        property_id: propertyId,
        property_slug: reservation.propertySlug,
        stripe_payment_intent_id: stripePaymentIntentId,
        status: "confirmed",
        arrival_date: reservation.arrivalDate,
        departure_date: reservation.departureDate,
        stay_nights: reservation.stayNights,
        adults: reservation.adults,
        children: reservation.children,
        babies: reservation.babies,
        main_guests: reservation.mainGuests,
        guest_first_name: reservation.firstName,
        guest_last_name: reservation.lastName,
        guest_email: reservation.guestEmail,
        guest_phone: reservation.phone,
        message: reservation.message,
        total_eur: reservation.totalEur
      },
      { onConflict: "stripe_payment_intent_id" }
    )

    if (error) {
      throw error
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur inconnue"
    console.error("[booking-reservations] save:", detail)
  }
}

export async function listAdminBookingReservations(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return []
  }

  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("booking_reservations")
    .select(BOOKING_RESERVATION_SELECT)
    .eq("property_slug", normalizedSlug)
    .order("arrival_date", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[booking-reservations] list:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger les réservations."
    })
  }

  return (data || []).map((row) => mapReservationRow(row as Record<string, unknown>))
}

export async function getAdminBookingReservationById(
  slug: string,
  reservationId: string
): Promise<AdminBookingReservation | null> {
  const normalizedSlug = slug.trim().toLowerCase()
  const id = reservationId.trim()

  if (!normalizedSlug || !id) {
    return null
  }

  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("booking_reservations")
    .select(BOOKING_RESERVATION_SELECT)
    .eq("property_slug", normalizedSlug)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[booking-reservations] get:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger la réservation."
    })
  }

  if (!data) {
    return null
  }

  return mapReservationRow(data as Record<string, unknown>)
}

export async function updateAdminBookingReservation(
  slug: string,
  reservationId: string,
  update: ParsedAdminBookingReservationUpdate
): Promise<AdminBookingReservation> {
  const normalizedSlug = slug.trim().toLowerCase()
  const id = reservationId.trim()
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("booking_reservations")
    .update({
      arrival_date: update.arrival_date,
      departure_date: update.departure_date,
      stay_nights: update.stay_nights,
      adults: update.adults,
      children: update.children,
      babies: update.babies,
      main_guests: update.main_guests,
      guest_first_name: update.guest_first_name,
      guest_last_name: update.guest_last_name,
      guest_email: update.guest_email,
      guest_phone: update.guest_phone,
      message: update.message,
      total_eur: update.total_eur,
      status: update.status,
      cancelled_at: update.cancelled_at
    })
    .eq("property_slug", normalizedSlug)
    .eq("id", id)
    .select(BOOKING_RESERVATION_SELECT)
    .single()

  if (error) {
    console.error("[booking-reservations] update:", error.message)
    throw createError({
      statusCode: 502,
      message: error.message || "Impossible de mettre à jour la réservation."
    })
  }

  return mapReservationRow(data as Record<string, unknown>)
}

export async function deleteAdminBookingReservation(
  slug: string,
  reservationId: string
): Promise<void> {
  const normalizedSlug = slug.trim().toLowerCase()
  const id = reservationId.trim()
  const supabase = requireSupabaseAdmin()

  const { error } = await supabase
    .from("booking_reservations")
    .delete()
    .eq("property_slug", normalizedSlug)
    .eq("id", id)

  if (error) {
    console.error("[booking-reservations] delete:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de supprimer la réservation."
    })
  }
}
