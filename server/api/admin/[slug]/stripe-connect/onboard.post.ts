import { requirePropertyOwner } from "../../../../utils/admin-auth"
import {
  buildStripeConnectAdminUrls,
  createConnectOnboardingLink,
  disconnectStripeConnectIfUnavailable,
  ensureExpressConnectAccount,
  normalizePlatformFeePercent,
  refreshPropertyStripeStatus
} from "../../../../utils/stripe-connect"
import { getStripeClient } from "../../../../utils/stripe-client"
import { formatStripeErrorMessage, throwStripeHandlerError } from "../../../../utils/stripe-error"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  try {
    const user = await requirePropertyOwner(event, slug)
    const config = useRuntimeConfig()
    const stripeSecretKey = String(config.stripeSecretKey || "").trim()

    if (!stripeSecretKey) {
      throw createError({
        statusCode: 503,
        message: "Stripe non configuré : renseignez STRIPE_SECRET_KEY sur Vercel (Production)."
      })
    }

    if (!stripeSecretKey.startsWith("sk_live_") && !stripeSecretKey.startsWith("sk_test_")) {
      throw createError({
        statusCode: 503,
        message: "STRIPE_SECRET_KEY invalide (attendu sk_live_… ou sk_test_…)."
      })
    }

    const stripe = getStripeClient(stripeSecretKey)

    await disconnectStripeConnectIfUnavailable(stripe, slug)

    const accountId = await ensureExpressConnectAccount(stripe, slug, user.email)
    const { returnUrl, refreshUrl } = buildStripeConnectAdminUrls(
      event,
      slug,
      String(config.public.siteUrl || "")
    )
    const url = await createConnectOnboardingLink(stripe, accountId, returnUrl, refreshUrl)

    const platformFeePercent = normalizePlatformFeePercent(config.hestiaPlatformFeePercent)

    await refreshPropertyStripeStatus(stripeSecretKey, slug, platformFeePercent)

    return { url }
  } catch (error: unknown) {
    console.error("[stripe-connect/onboard]", slug, error)

    if (error && typeof error === "object" && "statusCode" in error) {
      const h3Error = error as {
        statusCode?: number
        message?: string
        statusMessage?: string
      }
      const message =
        formatStripeErrorMessage(error) ||
        h3Error.message ||
        h3Error.statusMessage ||
        "Erreur lors de la connexion Stripe."

      if (message !== "Server Error") {
        throw createError({
          statusCode: h3Error.statusCode ?? 502,
          message
        })
      }
    }

    throwStripeHandlerError(error)
  }
})
