import type { H3Event } from "h3"
import {
  parseBookingReservationBody,
  reservationStripeMetadata
} from "./booking-reservation"
import { getPropertyStripeBySlug } from "./property-stripe-repository"
import { computePlatformFeeCents, normalizePlatformFeePercent } from "./stripe-connect"
import { getStripeClient } from "./stripe-client"

export async function createBookingPaymentIntent(
  event: H3Event,
  body: unknown,
  options: { publishedOnly?: boolean; propertySlug?: string }
) {
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message:
        "Paiement non configuré : renseignez STRIPE_SECRET_KEY sur le serveur."
    })
  }

  const mergedBody =
    options.propertySlug && body && typeof body === "object"
      ? { ...(body as Record<string, unknown>), propertySlug: options.propertySlug }
      : body

  const parsed = await parseBookingReservationBody(mergedBody, {
    publishedOnly: options.publishedOnly !== false
  })

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      message: parsed.message
    })
  }

  const { data } = parsed
  const stripeRow = await getPropertyStripeBySlug(data.propertySlug)

  if (!stripeRow?.stripe_account_id || !stripeRow.stripe_charges_enabled) {
    throw createError({
      statusCode: 503,
      message:
        "Les paiements en ligne ne sont pas encore activés pour ce logement. L’hôte doit terminer la configuration Stripe dans Comptabilité."
    })
  }

  const platformFeePercent = normalizePlatformFeePercent(config.hestiaPlatformFeePercent)
  const applicationFeeAmount = computePlatformFeeCents(data.amountCents, platformFeePercent)
  const stripe = getStripeClient(stripeSecretKey)
  const paymentMethodConfiguration = String(
    config.stripePaymentMethodConfiguration || ""
  ).trim()

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amountCents,
      currency: "eur",
      transfer_data: {
        destination: stripeRow.stripe_account_id
      },
      ...(applicationFeeAmount > 0 ? { application_fee_amount: applicationFeeAmount } : {}),
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always"
      },
      ...(paymentMethodConfiguration.startsWith("pmc_")
        ? { payment_method_configuration: paymentMethodConfiguration }
        : {}),
      receipt_email: data.guestEmail,
      description: `${data.propertyBrandName} — ${data.datesSummary}`,
      metadata: reservationStripeMetadata(data)
    })

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe n’a pas renvoyé de client_secret.")
    }

    return {
      ok: true as const,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amountCents: data.amountCents,
      totalEur: data.totalEur
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur Stripe."

    throw createError({
      statusCode: 502,
      message: detail
    })
  }
}
