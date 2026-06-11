import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import { parseAdminBookingReservationUpdate } from "./admin-booking-reservation"
import { getAdminBookingReservationById } from "./booking-reservation-repository"
import { requireSupabaseAdmin } from "./supabase"
import { getStripeClient } from "./stripe-client"
import { sendReservationCancelledEmails } from "./transactional-email"

const BOOKING_RESERVATION_SELECT =
  "id, status, arrival_date, departure_date, stay_nights, adults, children, babies, main_guests, guest_first_name, guest_last_name, guest_email, guest_phone, message, total_eur, stripe_payment_intent_id, refunded_at, stripe_refund_id, created_at, updated_at, cancelled_at"

function mapRefundedRow(row: Record<string, unknown>): AdminBookingReservation {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const todayIso = `${year}-${month}-${day}`
  const status = row.status === "cancelled" ? "cancelled" : "confirmed"
  const departure = String(row.departure_date)

  return {
    id: String(row.id),
    status,
    arrival_date: String(row.arrival_date),
    departure_date: departure,
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
    display_status:
      status === "cancelled" ? "cancelled" : departure < todayIso ? "past" : "upcoming"
  }
}

export async function refundAdminBookingReservation(
  slug: string,
  reservationId: string,
  stripeSecretKey: string
): Promise<AdminBookingReservation> {
  const reservation = await getAdminBookingReservationById(slug, reservationId)

  if (!reservation) {
    throw createError({ statusCode: 404, message: "Réservation introuvable." })
  }

  const paymentIntentId = reservation.stripe_payment_intent_id?.trim()

  if (!paymentIntentId?.startsWith("pi_")) {
    throw createError({
      statusCode: 400,
      message: "Cette réservation n’a pas de paiement Stripe associé."
    })
  }

  if (reservation.refunded_at) {
    throw createError({
      statusCode: 400,
      message: "Cette réservation a déjà été remboursée."
    })
  }

  const stripe = getStripeClient(stripeSecretKey)

  let paymentIntent

  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Paiement introuvable."

    throw createError({ statusCode: 404, message: detail })
  }

  if (paymentIntent.status !== "succeeded") {
    throw createError({
      statusCode: 400,
      message: "Seuls les paiements confirmés peuvent être remboursés."
    })
  }

  let refund

  try {
    refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reverse_transfer: true,
      refund_application_fee: true
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Remboursement Stripe impossible."

    throw createError({ statusCode: 502, message: detail })
  }

  const parsed = parseAdminBookingReservationUpdate({
    arrival_date: reservation.arrival_date,
    departure_date: reservation.departure_date,
    adults: reservation.adults,
    children: reservation.children,
    babies: reservation.babies,
    guest_first_name: reservation.guest_first_name,
    guest_last_name: reservation.guest_last_name,
    guest_email: reservation.guest_email,
    guest_phone: reservation.guest_phone,
    message: reservation.message,
    total_eur: reservation.total_eur,
    status: "cancelled"
  })

  if (!parsed.ok) {
    throw createError({
      statusCode: 500,
      message: "Impossible de préparer la mise à jour après remboursement."
    })
  }

  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("booking_reservations")
    .update({
      arrival_date: parsed.data.arrival_date,
      departure_date: parsed.data.departure_date,
      stay_nights: parsed.data.stay_nights,
      adults: parsed.data.adults,
      children: parsed.data.children,
      babies: parsed.data.babies,
      main_guests: parsed.data.main_guests,
      guest_first_name: parsed.data.guest_first_name,
      guest_last_name: parsed.data.guest_last_name,
      guest_email: parsed.data.guest_email,
      guest_phone: parsed.data.guest_phone,
      message: parsed.data.message,
      total_eur: parsed.data.total_eur,
      status: "cancelled",
      cancelled_at: parsed.data.cancelled_at,
      refunded_at: new Date().toISOString(),
      stripe_refund_id: refund.id
    })
    .eq("property_slug", slug.trim().toLowerCase())
    .eq("id", reservationId.trim())
    .select(BOOKING_RESERVATION_SELECT)
    .single()

  if (error || !data) {
    console.error("[booking-refund] update:", error?.message)
    throw createError({
      statusCode: 502,
      message:
        "Remboursement Stripe effectué, mais la mise à jour en base a échoué. Vérifiez Stripe."
    })
  }

  const refundedReservation = mapRefundedRow(data as Record<string, unknown>)

  void sendReservationCancelledEmails({
    slug,
    reservation: refundedReservation,
    refunded: true
  })

  return refundedReservation
}
