import { requirePropertyPrimaryOwner } from "../../../../utils/admin-auth"
import { createConnectDashboardLink } from "../../../../utils/stripe-connect"
import { getPropertyStripeBySlug } from "../../../../utils/property-stripe-repository"
import { getStripeClient } from "../../../../utils/stripe-client"
import { throwStripeHandlerError } from "../../../../utils/stripe-error"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  try {
    await requirePropertyPrimaryOwner(event, slug)

    const config = useRuntimeConfig()
    const stripeSecretKey = String(config.stripeSecretKey || "").trim()

    if (!stripeSecretKey) {
      throw createError({
        statusCode: 503,
        message: "Stripe non configuré : renseignez STRIPE_SECRET_KEY."
      })
    }

    const row = await getPropertyStripeBySlug(slug)

    if (!row?.stripe_account_id) {
      throw createError({
        statusCode: 400,
        message: "Aucun compte Stripe connecté. Lancez d’abord la configuration."
      })
    }

    const stripe = getStripeClient(stripeSecretKey)
    const url = await createConnectDashboardLink(stripe, row.stripe_account_id)

    return { url }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    throwStripeHandlerError(error)
  }
})
