import type { H3Event } from "h3"
import { isOwnerBookingPreview } from "./booking-owner-preview"
import { sendBookingReservationEmails } from "./booking-notify"
import type { ParsedBookingReservation } from "./booking-reservation"
import { sendGuestBookingInvoiceEmail } from "./booking-invoice-email"
import { saveConfirmedBookingReservation } from "./booking-reservation-repository"
import { getPropertyBookingNotifyEmail } from "./property-site-repository"
import { getStripeClient } from "./stripe-client"
import { sendPlatformNewReservationAlert } from "./transactional-email"

function metadataToReservation(
  metadata: Record<string, string>
): ParsedBookingReservation | null {
  const {
    propertySlug,
    propertyBrandName,
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
    !propertySlug ||
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
    propertySlug,
    propertyBrandName: propertyBrandName || "",
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

export async function completeBookingPayment(
  event: H3Event,
  body: unknown,
  options?: { publishedOnly?: boolean; expectedPropertySlug?: string }
) {
  const config = useRuntimeConfig()

  const stripeSecretKey = String(config.stripeSecretKey || "").trim()
  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = String(config.bookingEmailFrom || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Paiement non configuré."
    })
  }

  if (!resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message: "Confirmation par e-mail non configurée : renseignez RESEND_API_KEY."
    })
  }

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

  const reservation = metadataToReservation(
    paymentIntent.metadata as Record<string, string>
  )

  if (!reservation) {
    throw createError({
      statusCode: 500,
      message: "Données de réservation incomplètes."
    })
  }

  const expectedSlug = options?.expectedPropertySlug?.trim().toLowerCase()

  if (expectedSlug && reservation.propertySlug !== expectedSlug) {
    throw createError({
      statusCode: 403,
      message: "Ce paiement ne correspond pas à ce site."
    })
  }

  if (paymentIntent.amount !== reservation.amountCents) {
    throw createError({
      statusCode: 400,
      message: "Le montant payé ne correspond pas à la réservation."
    })
  }

  if (paymentIntent.metadata.emailsSent === "true") {
    await saveConfirmedBookingReservation(reservation, paymentIntentId)

    return { ok: true as const, alreadySent: true as const }
  }

  const publishedOnly =
    options?.publishedOnly !== false &&
    !(await isOwnerBookingPreview(event, reservation.propertySlug))

  const notifyTo = await getPropertyBookingNotifyEmail(reservation.propertySlug, {
    publishedOnly
  })

  if (!notifyTo) {
    throw createError({
      statusCode: 503,
      message:
        "E-mail hôte non configuré : associez un compte Hostiv au site ou vérifiez l’e-mail dans Mon compte > Paramètres."
    })
  }

  try {
    await sendBookingReservationEmails(reservation, {
      notifyTo,
      resendApiKey,
      from,
      publishedOnly
    })

    void sendPlatformNewReservationAlert({
      slug: reservation.propertySlug,
      brandName: reservation.propertyBrandName,
      guestName: `${reservation.firstName} ${reservation.lastName}`.trim(),
      guestEmail: reservation.guestEmail,
      datesSummary: reservation.datesSummary,
      totalEur: reservation.totalEur
    })

    const saved = await saveConfirmedBookingReservation(reservation, paymentIntentId)

    if (saved) {
      void sendGuestBookingInvoiceEmail({
        slug: reservation.propertySlug,
        reservation: saved,
        brandName: reservation.propertyBrandName || reservation.propertySlug,
        replyTo: notifyTo
      })
    }

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
}
