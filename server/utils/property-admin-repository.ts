import type { PropertyAdminRecord, PropertyAdminUpdatePayload } from "../../app/types/property-admin"
import { normalizePropertyAdminRecord } from "../../app/utils/normalize-property-admin"
import { requireSupabaseAdmin } from "./supabase"

const PROPERTY_ADMIN_SELECT =
  "id, slug, published, brand_name, brand_meta, logo_path, seo_title, seo_description, seo_keywords, seo_og_title, seo_og_description, seo_og_image_path, seo_twitter_card, seo_noindex, hero_image_path, hero_image_alt, testimonials_bg_path, host_photo_path, owner_user_id, subscription_plan, booking_config, calendar_config, location, content"

function mapAdminRow(row: Record<string, unknown>): PropertyAdminRecord {
  return normalizePropertyAdminRecord({
    id: String(row.id),
    slug: String(row.slug),
    published: Boolean(row.published),
    brand_name: String(row.brand_name),
    brand_meta: String(row.brand_meta || ""),
    logo_path: String(row.logo_path),
    seo_title: String(row.seo_title),
    seo_description: String(row.seo_description),
    seo_keywords: String(row.seo_keywords ?? ""),
    seo_og_title: String(row.seo_og_title ?? ""),
    seo_og_description: String(row.seo_og_description ?? ""),
    seo_og_image_path: String(row.seo_og_image_path ?? ""),
    seo_twitter_card: row.seo_twitter_card,
    seo_noindex: Boolean(row.seo_noindex),
    hero_image_path: String(row.hero_image_path),
    hero_image_alt: String(row.hero_image_alt || ""),
    testimonials_bg_path: String(row.testimonials_bg_path),
    host_photo_path: String(row.host_photo_path),
    owner_user_id:
      typeof row.owner_user_id === "string" ? row.owner_user_id : null,
    subscription_plan: row.subscription_plan,
    booking_config: row.booking_config as PropertyAdminRecord["booking_config"],
    calendar_config: row.calendar_config as PropertyAdminRecord["calendar_config"],
    location: row.location as PropertyAdminRecord["location"],
    content: row.content as PropertyAdminRecord["content"]
  })
}

export async function getPropertyAdminBySlug(slug: string): Promise<PropertyAdminRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_ADMIN_SELECT)
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-admin] read:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger le site"
    })
  }

  if (!data) {
    return null
  }

  return mapAdminRow(data as Record<string, unknown>)
}

export async function updatePropertyAdmin(
  slug: string,
  payload: PropertyAdminUpdatePayload
): Promise<PropertyAdminRecord> {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const normalized = normalizePropertyAdminRecord(payload)

  const row = {
    published: normalized.published,
    brand_name: normalized.brand_name,
    brand_meta: normalized.brand_meta,
    logo_path: normalized.logo_path,
    seo_title: normalized.seo_title,
    seo_description: normalized.seo_description,
    seo_keywords: normalized.seo_keywords,
    seo_og_title: normalized.seo_og_title,
    seo_og_description: normalized.seo_og_description,
    seo_og_image_path: normalized.seo_og_image_path,
    seo_twitter_card: normalized.seo_twitter_card,
    seo_noindex: normalized.seo_noindex,
    hero_image_path: normalized.hero_image_path,
    hero_image_alt: normalized.hero_image_alt,
    testimonials_bg_path: normalized.testimonials_bg_path,
    host_photo_path: normalized.host_photo_path,
    booking_config: normalized.booking_config,
    calendar_config: normalized.calendar_config,
    location: normalized.location,
    content: normalized.content
  }

  const { data, error } = await supabase
    .from("properties")
    .update(row)
    .eq("slug", normalizedSlug)
    .select(PROPERTY_ADMIN_SELECT)
    .single()

  if (error) {
    console.error("[property-admin] update:", error.message)
    throw createError({
      statusCode: 502,
      message: error.message
    })
  }

  return mapAdminRow(data as Record<string, unknown>)
}

export async function propertyExistsBySlug(slug: string): Promise<boolean> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return false
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-admin] exists:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier l’existence du site."
    })
  }

  return Boolean(data?.id)
}

export async function getPropertyOwnerUserId(slug: string): Promise<string | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("owner_user_id")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-admin] owner:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier le propriétaire du site"
    })
  }

  return typeof data?.owner_user_id === "string" ? data.owner_user_id : null
}
