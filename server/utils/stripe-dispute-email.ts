import type Stripe from "stripe"
import { formatEuro } from "../../app/utils/booking-price"
import { getPropertyStripeBySlug } from "./property-stripe-repository"
import { getPropertySiteBySlug } from "./property-site-repository"
import { getPropertyBookingNotifyEmail } from "./property-site-repository"
import {
  sendOwnerStripeDisputeEmail,
  sendPlatformStripeDisputeAlert
} from "./transactional-email"

function disputeReasonLabel(reason: string | null | undefined) {
  const labels: Record<string, string> = {
    fraudulent: "Fraude présumée",
    duplicate: "Doublon",
    product_not_received: "Produit / service non reçu",
    product_unacceptable: "Produit / service non conforme",
    subscription_canceled: "Abonnement annulé",
    unrecognized: "Transaction non reconnue",
    credit_not_processed: "Crédit non traité",
    general: "Litige général",
    incorrect_account_details: "Coordonnées incorrectes",
    insufficient_funds: "Fonds insuffisants",
    bank_cannot_process: "Banque ne peut pas traiter",
    debit_not_authorized: "Débit non autorisé",
    customer_initiated: "Initié par le client"
  }

  return reason && labels[reason] ? labels[reason] : reason || "Motif non précisé"
}

function formatDisputeDueBy(dueBy: number | null | undefined) {
  if (!dueBy) {
    return "Non précisé"
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(dueBy * 1000))
}

export async function handleStripeDisputeCreated(stripe: Stripe, dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id

  if (!chargeId) {
    console.error("[stripe-dispute] missing charge id")
    return
  }

  let charge: Stripe.Charge

  try {
    charge = await stripe.charges.retrieve(chargeId)
  } catch (error) {
    console.error("[stripe-dispute] charge retrieve:", error)
    return
  }

  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id

  let metadata: Record<string, string> = {}

  if (paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      metadata = Object.fromEntries(
        Object.entries(paymentIntent.metadata || {}).map(([key, value]) => [key, String(value)])
      )
    } catch (error) {
      console.error("[stripe-dispute] payment intent retrieve:", error)
    }
  }

  const propertySlug = metadata.propertySlug?.trim().toLowerCase() || ""
  const brandName =
    metadata.propertyBrandName?.trim() ||
    (propertySlug ? (await getPropertySiteBySlug(propertySlug, { publishedOnly: false }))?.brand_name : "") ||
    propertySlug ||
    "Site inconnu"

  const amountEur = (dispute.amount || charge.amount || 0) / 100
  const reason = disputeReasonLabel(dispute.reason)
  const dueBy = formatDisputeDueBy(dispute.evidence_details?.due_by ?? null)
  const guestEmail = metadata.guestEmail?.trim() || charge.billing_details?.email?.trim() || ""
  const datesSummary = metadata.datesSummary?.trim() || ""
  const disputeId = dispute.id

  void sendPlatformStripeDisputeAlert({
    disputeId,
    slug: propertySlug || "inconnu",
    brandName,
    amountEur,
    reason,
    dueBy,
    guestEmail,
    datesSummary,
    paymentIntentId: paymentIntentId || ""
  })

  if (!propertySlug) {
    return
  }

  const ownerEmail = await getPropertyBookingNotifyEmail(propertySlug, { publishedOnly: false })

  if (!ownerEmail) {
    return
  }

  const stripeRow = await getPropertyStripeBySlug(propertySlug)

  void sendOwnerStripeDisputeEmail({
    to: ownerEmail,
    slug: propertySlug,
    brandName,
    amountEur,
    reason,
    dueBy,
    guestEmail,
    datesSummary,
    disputeId,
    stripeAccountId: stripeRow?.stripe_account_id || ""
  })
}
