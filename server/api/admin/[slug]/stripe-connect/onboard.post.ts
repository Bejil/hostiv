import { requirePropertyOwner } from "../../../../utils/admin-auth"
import {
  buildStripeConnectAdminUrls,
  createConnectOnboardingLink,
  ensureExpressConnectAccount,
  normalizePlatformFeePercent,
  refreshPropertyStripeStatus
} from "../../../../utils/stripe-connect"
import { getStripeClient } from "../../../../utils/stripe-client"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const user = await requirePropertyOwner(event, slug)
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Stripe non configuré : renseignez STRIPE_SECRET_KEY."
    })
  }

  const stripe = getStripeClient(stripeSecretKey)
  const accountId = await ensureExpressConnectAccount(stripe, slug, user.email)
  const { returnUrl, refreshUrl } = buildStripeConnectAdminUrls(event, slug)
  const url = await createConnectOnboardingLink(stripe, accountId, returnUrl, refreshUrl)

  const platformFeePercent = normalizePlatformFeePercent(config.hestiaPlatformFeePercent)

  await refreshPropertyStripeStatus(stripeSecretKey, slug, platformFeePercent)

  return { url }
})
