import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import { buildHostivSubscriptionAccess, isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { requireSupabaseAdmin } from "./supabase"

export type HostivAccountRow = {
  id: string
  subscription_plan: string
  paid_until: string | null
  subscription_started_at: string | null
}

export async function getHostivAccountByUserId(userId: string): Promise<HostivAccountRow | null> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_accounts")
    .select("id, subscription_plan, paid_until, subscription_started_at")
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
      typeof data.subscription_started_at === "string" ? data.subscription_started_at : null
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
  }

  return !updateError
}

export async function getSubscriptionAccessForOwner(
  ownerUserId: string,
  propertySlug: string
): Promise<HostivSubscriptionAccess> {
  await unpublishPropertyIfSubscriptionExpired(ownerUserId, propertySlug)

  const account = await getHostivAccountByUserId(ownerUserId)

  return buildHostivSubscriptionAccess({
    subscription_plan: account?.subscription_plan,
    paid_until: account?.paid_until
  })
}

export async function assertCanPublishProperty(ownerUserId: string) {
  const account = await getHostivAccountByUserId(ownerUserId)

  if (!account || !isHostivSubscriptionActive(account.paid_until)) {
    throw createError({
      statusCode: 402,
      message:
        "Un forfait Hostiv actif est requis pour publier votre site. Réglez le paiement annuel depuis votre backoffice."
    })
  }
}
