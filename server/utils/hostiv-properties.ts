import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { getPropertyIdBySlug } from "./property-cohost"
import { requireSupabaseAdmin } from "./supabase"

export type HostivAccessibleProperty = {
  slug: string
  brand_name: string
  published: boolean
  role: "owner" | "cohost"
  subscription_plan: string
  subscription_active: boolean
}

export async function listAccessiblePropertiesForUser(
  userId: string
): Promise<HostivAccessibleProperty[]> {
  const supabase = requireSupabaseAdmin()
  const bySlug = new Map<string, HostivAccessibleProperty>()

  const { data: owned, error: ownedError } = await supabase
    .from("properties")
    .select("slug, brand_name, published, subscription_plan, paid_until")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })

  if (ownedError) {
    console.error("[hostiv-properties] owned:", ownedError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger vos sites."
    })
  }

  for (const row of owned ?? []) {
    const slug = String(row.slug || "").trim().toLowerCase()

    if (!slug) {
      continue
    }

    bySlug.set(slug, {
      slug,
      brand_name: String(row.brand_name || slug),
      published: Boolean(row.published),
      role: "owner",
      subscription_plan: String(row.subscription_plan || "pro"),
      subscription_active: isHostivSubscriptionActive(
        typeof row.paid_until === "string" ? row.paid_until : null
      )
    })
  }

  const { data: cohostRows, error: cohostError } = await supabase
    .from("property_cohosts")
    .select("property_id")
    .eq("user_id", userId)

  if (cohostError) {
    console.error("[hostiv-properties] cohost:", cohostError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger vos sites."
    })
  }

  const cohostPropertyIds = [...new Set((cohostRows ?? []).map((row) => String(row.property_id)))]

  if (cohostPropertyIds.length) {
    const { data: cohostProperties, error: propertiesError } = await supabase
      .from("properties")
      .select("slug, brand_name, published, subscription_plan, paid_until")
      .in("id", cohostPropertyIds)

    if (propertiesError) {
      console.error("[hostiv-properties] cohost properties:", propertiesError.message)

      throw createError({
        statusCode: 502,
        message: "Impossible de charger vos sites."
      })
    }

    for (const row of cohostProperties ?? []) {
      const slug = String(row.slug || "").trim().toLowerCase()

      if (!slug || bySlug.has(slug)) {
        continue
      }

      bySlug.set(slug, {
        slug,
        brand_name: String(row.brand_name || slug),
        published: Boolean(row.published),
        role: "cohost",
        subscription_plan: String(row.subscription_plan || "pro"),
        subscription_active: isHostivSubscriptionActive(
          typeof row.paid_until === "string" ? row.paid_until : null
        )
      })
    }
  }

  return [...bySlug.values()]
}

export async function userCanAccessPropertySlug(userId: string, slug: string): Promise<boolean> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return false
  }

  const properties = await listAccessiblePropertiesForUser(userId)

  return properties.some((property) => property.slug === normalizedSlug)
}

export async function countOwnedPropertiesForUser(userId: string): Promise<number> {
  const supabase = requireSupabaseAdmin()

  const { count, error } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId)

  if (error) {
    console.error("[hostiv-properties] count:", error.message)

    return 0
  }

  return count ?? 0
}

export async function assertUserOwnsPropertySlug(userId: string, slug: string) {
  const propertyId = await getPropertyIdBySlug(slug)
  const supabase = requireSupabaseAdmin()

  if (!propertyId) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const { data, error } = await supabase
    .from("properties")
    .select("owner_user_id")
    .eq("id", propertyId)
    .maybeSingle()

  if (error || String(data?.owner_user_id) !== userId) {
    throw createError({
      statusCode: 403,
      message: "Vous n’êtes pas propriétaire de ce site."
    })
  }
}
