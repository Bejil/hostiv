import { normalizeHostivSubscriptionPlan } from "../../../app/utils/hostiv-subscription-plan"
import { createHostivSignupCheckoutSession } from "../../utils/hostiv-signup-checkout"
import { resolveHostivSiteBaseUrl } from "../../utils/hostiv-site-base-url"
import { resolveHostivSignupEncryptionSecret } from "../../utils/hostiv-pending-signup-crypto"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Paiement non configuré : renseignez STRIPE_SECRET_KEY."
    })
  }

  const body = await readBody<{
    full_name?: string
    email?: string
    password?: string
    property_name?: string
    property_slug?: string
    subscription_plan?: string
    promo_code?: string
  }>(event)

  const fullName = String(body?.full_name || "").trim()
  const email = String(body?.email || "").trim()
  const password = String(body?.password || "")
  const propertyName = String(body?.property_name || "").trim()
  const propertySlug = String(body?.property_slug || "").trim()

  if (!fullName || !email || !password || !propertyName || !propertySlug) {
    throw createError({
      statusCode: 400,
      message: "Renseignez tous les champs pour continuer."
    })
  }

  const encryptionSecret = resolveHostivSignupEncryptionSecret({
    hostivSignupEncryptionKey: String(config.hostivSignupEncryptionKey || ""),
    supabaseServiceRoleKey: String(config.supabaseServiceRoleKey || "")
  })

  const siteBaseUrl = resolveHostivSiteBaseUrl(getRequestURL(event).origin)

  return createHostivSignupCheckoutSession({
    stripeSecretKey,
    encryptionSecret,
    fullName,
    email,
    password,
    propertyName,
    propertySlug,
    plan: normalizeHostivSubscriptionPlan(body?.subscription_plan),
    siteBaseUrl,
    promoCode: body?.promo_code
  })
})
