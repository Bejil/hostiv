import { getBearerUser } from "../../utils/hostiv-auth"
import { createHostivSubscriptionCheckoutSession } from "../../utils/hostiv-subscription-checkout"
import { resolveHostivSiteBaseUrl } from "../../utils/hostiv-site-base-url"
import { normalizeHostivSubscriptionPlan } from "../../../app/utils/hostiv-subscription-plan"
import { requireSupabaseAdmin } from "../../utils/supabase"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Paiement non configuré : renseignez STRIPE_SECRET_KEY."
    })
  }

  const user = await getBearerUser(event)
  const body = await readBody<{ subscription_plan?: string; property_slug?: string }>(event)
  const plan = normalizeHostivSubscriptionPlan(body?.subscription_plan)
  const propertySlug = String(body?.property_slug || "").trim().toLowerCase()

  if (!propertySlug) {
    throw createError({
      statusCode: 400,
      message: "Indiquez le site associé au paiement."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("slug, owner_user_id")
    .eq("slug", propertySlug)
    .maybeSingle()

  if (propertyError) {
    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier votre site."
    })
  }

  if (!property || String(property.owner_user_id) !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Ce site ne vous appartient pas."
    })
  }

  const siteBaseUrl = resolveHostivSiteBaseUrl(getRequestURL(event).origin)

  const checkout = await createHostivSubscriptionCheckoutSession({
    stripeSecretKey,
    userId: user.id,
    email: user.email ?? "",
    plan,
    propertySlug,
    siteBaseUrl
  })

  return checkout
})
