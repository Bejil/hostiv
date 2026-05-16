import { sendBookingReservationEmails } from "../../utils/booking-notify"
import type { ParsedBookingReservation } from "../../utils/booking-reservation"
import { getStripeClient } from "../../utils/stripe-client"

function metadataToReservation(
  metadata: Record<string, string>
): ParsedBookingReservation | null {
  const {
    arrivalDate,
    departureDate,
    adults,
    children,
    babies,
    lastName,
    firstName,
    phone,
    guestEmail,
    datesSummary,
    datesMeta,
    guestSummary,
    guestMeta,
    estimateLabel,
    message,
    totalEur
  } = metadata

  if (
    !arrivalDate ||
    !departureDate ||
    !lastName ||
    !firstName ||
    !phone ||
    !guestEmail ||
    !datesSummary ||
    !message ||
    !totalEur
  ) {
    return null
  }

  const adultsNum = Number(adults)
  const childrenNum = Number(children)
  const babiesNum = Number(babies)
  const totalEurNum = Number(totalEur)

  if (
    !Number.isFinite(adultsNum) ||
    !Number.isFinite(childrenNum) ||
    !Number.isFinite(babiesNum) ||
    !Number.isFinite(totalEurNum)
  ) {
    return null
  }

  const [aY, aM, aD] = arrivalDate.split("-").map(Number)
  const [dY, dM, dD] = departureDate.split("-").map(Number)
  const arrival = new Date(aY, aM - 1, aD)
  const departure = new Date(dY, dM - 1, dD)
  const stayNights = Math.max(
    1,
    Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24))
  )

  return {
    arrivalDate,
    departureDate,
    adults: adultsNum,
    children: childrenNum,
    babies: babiesNum,
    lastName,
    firstName,
    phone,
    guestEmail,
    message,
    stayNights,
    mainGuests: adultsNum + childrenNum,
    datesSummary,
    datesMeta: datesMeta || "",
    guestSummary: guestSummary || "",
    guestMeta: guestMeta || "",
    totalEur: totalEurNum,
    amountCents: Math.round(totalEurNum * 100),
    estimateLabel: estimateLabel || `${totalEurNum} €`
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const stripeSecretKey = String(config.stripeSecretKey || "").trim()
  const notifyTo = String(config.bookingNotifyEmail || "").trim()
  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = String(config.bookingEmailFrom || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Paiement non configuré."
    })
  }

  if (!notifyTo || !resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message:
        "Confirmation par e-mail non configurée : renseignez BOOKING_NOTIFY_EMAIL et RESEND_API_KEY."
    })
  }

  const body = await readBody(event)
  const paymentIntentId =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).paymentIntentId === "string"
      ? (body as Record<string, string>).paymentIntentId.trim()
      : ""

  if (!paymentIntentId.startsWith("pi_")) {
    throw createError({
      statusCode: 400,
      message: "Identifiant de paiement invalide."
    })
  }

  const stripe = getStripeClient(stripeSecretKey)

  let paymentIntent

  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Paiement introuvable."

    throw createError({
      statusCode: 404,
      message: detail
    })
  }

  if (paymentIntent.status !== "succeeded") {
    throw createError({
      statusCode: 402,
      message: "Le paiement n’est pas encore confirmé."
    })
  }

  if (paymentIntent.metadata.emailsSent === "true") {
    return { ok: true as const, alreadySent: true as const }
  }

  const reservation = metadataToReservation(
    paymentIntent.metadata as Record<string, string>
  )

  if (!reservation) {
    throw createError({
      statusCode: 500,
      message: "Données de réservation incomplètes."
    })
  }

  if (paymentIntent.amount !== reservation.amountCents) {
    throw createError({
      statusCode: 400,
      message: "Le montant payé ne correspond pas à la réservation."
    })
  }

  try {
    await sendBookingReservationEmails(reservation, {
      notifyTo,
      resendApiKey,
      from
    })

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { emailsSent: "true" }
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur d’envoi."

    throw createError({
      statusCode: 502,
      message: detail
    })
  }

  return { ok: true as const, alreadySent: false as const }
})
