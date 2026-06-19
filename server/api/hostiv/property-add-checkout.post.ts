import { getBearerUser } from "../../utils/hostiv-auth"
import { validatePropertySlugFormat } from "../../../app/utils/property-slug"
import { normalizeHostivSubscriptionPlan } from "../../../app/utils/hostiv-subscription-plan"
import { createHostivPropertyAddCheckoutSession } from "../../utils/hostiv-property-add-checkout"
import { countOwnedPropertiesForUser } from "../../utils/hostiv-properties"
import { assertProPlanForAdditionalProperty } from "../../utils/hostiv-property-ownership"
import { resolveHostivSiteBaseUrl } from "../../utils/hostiv-site-base-url"
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

  const ownedCount = await countOwnedPropertiesForUser(user.id)

  if (ownedCount < 1) {
    throw createError({
      statusCode: 403,
      message: "Seul un hôte propriétaire peut ajouter un logement."
    })
  }

  const body = await readBody<{
    property_name?: string
    property_slug?: string
    subscription_plan?: string
    return_slug?: string
    promo_code?: string
  }>(event)

  const propertyName = String(body?.property_name || "").trim()
  const validity = validatePropertySlugFormat(String(body?.property_slug || ""))
  const plan = normalizeHostivSubscriptionPlan(body?.subscription_plan)
  const returnSlug = String(body?.return_slug || "").trim().toLowerCase()

  if (!propertyName || !validity.valid) {
    throw createError({
      statusCode: 400,
      message: "Indiquez un nom et une adresse valides pour le nouveau logement."
    })
  }

  if (!returnSlug) {
    throw createError({
      statusCode: 400,
      message: "Slug de retour manquant."
    })
  }

  await assertProPlanForAdditionalProperty(user.id, plan)

  const supabase = requireSupabaseAdmin()

  const { data: existing } = await supabase
    .from("properties")
    .select("id, owner_user_id")
    .eq("slug", validity.slug)
    .maybeSingle()

  if (existing && String(existing.owner_user_id) !== user.id) {
    throw createError({
      statusCode: 409,
      message: "Cette adresse de site est déjà utilisée."
    })
  }

  const siteBaseUrl = resolveHostivSiteBaseUrl(getRequestURL(event).origin)

  const checkout = await createHostivPropertyAddCheckoutSession({
    stripeSecretKey,
    userId: user.id,
    email: user.email ?? "",
    propertyName,
    propertySlug: validity.slug,
    plan,
    siteBaseUrl,
    returnSlug,
    promoCode: body?.promo_code
  })

  return {
    url: checkout.url,
    sessionId: checkout.sessionId,
    slug: checkout.slug
  }
})
