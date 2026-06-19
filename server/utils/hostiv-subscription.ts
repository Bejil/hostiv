import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import {
  getSubscriptionAccessForProperty,
  unpublishPropertyIfPropertySubscriptionExpired
} from "./hostiv-property-subscription"
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

/** Dépublie le site si le forfait du logement est expiré. */
export async function unpublishPropertyIfSubscriptionExpired(
  ownerUserId: string,
  propertySlug: string
): Promise<boolean> {
  return unpublishPropertyIfPropertySubscriptionExpired(ownerUserId, propertySlug)
}

export async function getSubscriptionAccessForOwner(
  ownerUserId: string,
  propertySlug: string
): Promise<HostivSubscriptionAccess> {
  return getSubscriptionAccessForProperty(ownerUserId, propertySlug)
}
