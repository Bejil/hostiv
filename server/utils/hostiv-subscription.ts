import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import { buildHostivSubscriptionAccess, isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { getPropertySiteBySlug } from "./property-site-repository"
import { getUserEmailById, sendHostivSubscriptionExpiredEmail } from "./transactional-email"
import { requireSupabaseAdmin } from "./supabase"

export type HostivAccountRow = {
  id: string
  subscription_plan: string
  paid_until: string | null
  subscription_started_at: string | null
  premium_tools_until: string | null
  premium_tools_started_at: string | null
}

export async function getHostivAccountByUserId(userId: string): Promise<HostivAccountRow | null> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_accounts")
    .select(
      "id, subscription_plan, paid_until, subscription_started_at, premium_tools_until, premium_tools_started_at"
    )
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-subscription] read account:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier votre forfait."
    })
  }

  if (!data) {
    return null
  }

  return {
    id: String(data.id),
    subscription_plan: String(data.subscription_plan || "pro"),
    paid_until: typeof data.paid_until === "string" ? data.paid_until : null,
    subscription_started_at:
      typeof data.subscription_started_at === "string" ? data.subscription_started_at : null,
    premium_tools_until:
      typeof data.premium_tools_until === "string" ? data.premium_tools_until : null,
    premium_tools_started_at:
      typeof data.premium_tools_started_at === "string" ? data.premium_tools_started_at : null
  }
}

/** Dépublie le site si le forfait est expiré. Retourne true si une mise à jour a eu lieu. */
export async function unpublishPropertyIfSubscriptionExpired(
  ownerUserId: string,
  propertySlug: string
): Promise<boolean> {
  const account = await getHostivAccountByUserId(ownerUserId)

  if (!account || isHostivSubscriptionActive(account.paid_until)) {
    return false
  }

  const supabase = requireSupabaseAdmin()
  const slug = propertySlug.trim().toLowerCase()

  const { data: property, error: readError } = await supabase
    .from("properties")
    .select("id, published")
    .eq("slug", slug)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle()

  if (readError || !property?.published) {
    return false
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ published: false })
    .eq("id", property.id)

  if (updateError) {
    console.error("[hostiv-subscription] unpublish:", updateError.message)

    return false
  }

  const ownerEmail = await getUserEmailById(ownerUserId)

  if (ownerEmail) {
    const site = await getPropertySiteBySlug(slug, { publishedOnly: false })
    const brandName = site?.brand_name?.trim() || slug

    void sendHostivSubscriptionExpiredEmail({
      to: ownerEmail,
      slug,
      brandName,
      paidUntil: account.paid_until
    })
  }

  return true
}

export async function getSubscriptionAccessForOwner(
  ownerUserId: string,
  propertySlug: string
): Promise<HostivSubscriptionAccess> {
  await unpublishPropertyIfSubscriptionExpired(ownerUserId, propertySlug)

  const account = await getHostivAccountByUserId(ownerUserId)

  return buildHostivSubscriptionAccess({
    subscription_plan: account?.subscription_plan,
    paid_until: account?.paid_until,
    subscription_started_at: account?.subscription_started_at,
    premium_tools_until: account?.premium_tools_until,
    premium_tools_started_at: account?.premium_tools_started_at
  })
}

export async function assertCanPublishProperty(ownerUserId: string) {
  const account = await getHostivAccountByUserId(ownerUserId)

  if (!account || !isHostivSubscriptionActive(account.paid_until)) {
    throw createError({
      statusCode: 402,
      message:
        "Votre forfait Hostiv a expiré. Renouvelez-le pour publier votre site."
    })
  }
}
