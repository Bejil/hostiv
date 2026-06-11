import type {
  PropertyGalleryCategory,
  PropertySiteContent,
  PropertyCalendarConfig,
  PropertySiteEmailContent,
  PropertySiteRecord,
  PropertySiteRow
} from "../../app/types/property-site"
import { normalizeBookingConfig } from "../../app/utils/booking-config"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { normalizeSiteTemplateId } from "../../app/data/site-templates"
import { normalizeReviewRatingValue } from "../../app/utils/platform-rating-stars"
import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { asGalleryText, filledGalleryImages } from "../../app/utils/gallery-category-admin"
import { applyDerivedPropertySeo } from "../../app/utils/derive-property-seo"
import { requireSupabaseAdmin } from "./supabase"

/** Colonnes exposées au front (sans e-mail hôte). */
const PROPERTY_SITE_PUBLIC_SELECT =
  "id, slug, published, brand_name, brand_meta, logo_path, seo_title, seo_description, seo_keywords, seo_keywords_en, seo_keywords_fr_enabled, seo_keywords_en_enabled, seo_og_title, seo_og_description, seo_og_image_path, seo_twitter_card, seo_noindex, hero_image_path, hero_image_alt, testimonials_bg_path, host_photo_path, subscription_plan, stripe_charges_enabled, booking_config, location, content"

const DEFAULT_EMAIL_CONTENT: PropertySiteEmailContent = {
  access_lines: []
}

function normalizeSpaceGalleryCategories(
  categories: PropertyGalleryCategory[] | null | undefined
): PropertyGalleryCategory[] {
  return (categories ?? []).map((category, index) => ({
    id: asGalleryText(category?.id).trim() || `section-${index + 1}`,
    title: asGalleryText(category?.title),
    description: asGalleryText(category?.description),
    images: filledGalleryImages(category?.images)
  }))
}

function normalizeContent(content: PropertySiteContent): PropertySiteContent {
  return {
    ...content,
    template: {
      id: normalizeSiteTemplateId(content.template?.id)
    },
    email: content.email ?? DEFAULT_EMAIL_CONTENT,
    space_gallery_categories: normalizeSpaceGalleryCategories(content.space_gallery_categories),
    reviews: (content.reviews ?? []).map((review) => ({
      ...review,
      rating: normalizeReviewRatingValue(review.rating)
    }))
  }
}

function mapRow(row: PropertySiteRow): PropertySiteRecord {
  return applyDerivedPropertySeo({
    id: row.id,
    slug: row.slug,
    published: row.published,
    brand_name: row.brand_name,
    brand_meta: row.brand_meta || "",
    logo_path: row.logo_path,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_keywords: row.seo_keywords ?? "",
    seo_keywords_en: row.seo_keywords_en ?? "",
    seo_keywords_fr_enabled: row.seo_keywords_fr_enabled !== false,
    seo_keywords_en_enabled: Boolean(row.seo_keywords_en_enabled),
    seo_og_title: row.seo_og_title ?? "",
    seo_og_description: row.seo_og_description ?? "",
    seo_og_image_path: row.seo_og_image_path ?? "",
    seo_twitter_card: row.seo_twitter_card === "summary" ? "summary" : "summary_large_image",
    seo_noindex: Boolean(row.seo_noindex),
    hero_image_path: row.hero_image_path,
    hero_image_alt: row.hero_image_alt || "",
    testimonials_bg_path: row.testimonials_bg_path,
    host_photo_path: row.host_photo_path,
    subscription_plan: normalizeHostivSubscriptionPlan(row.subscription_plan),
    stripe_payments_ready: Boolean(row.stripe_charges_enabled),
    booking_config: normalizeBookingConfig(row.booking_config),
    location: row.location,
    content: normalizeContent(row.content)
  })
}

export async function getPropertySiteBySlug(
  slug: string,
  options?: { publishedOnly?: boolean }
): Promise<PropertySiteRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase()
  const publishedOnly = options?.publishedOnly !== false

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  let query = supabase
    .from("properties")
    .select(PROPERTY_SITE_PUBLIC_SELECT)
    .eq("slug", normalizedSlug)

  if (publishedOnly) {
    query = query.eq("published", true)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error("[property-site] Supabase error:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger le site depuis la base de données"
    })
  }

  if (!data) {
    return null
  }

  return mapRow(data as PropertySiteRow)
}

/** E-mail du propriétaire Hostiv (compte admin du site) pour les notifications de réservation. */
export async function getPropertyBookingNotifyEmail(
  slug: string,
  options?: { publishedOnly?: boolean }
): Promise<string | null> {
  const normalizedSlug = slug.trim().toLowerCase()
  const publishedOnly = options?.publishedOnly !== false

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  let query = supabase
    .from("properties")
    .select("owner_user_id")
    .eq("slug", normalizedSlug)

  if (publishedOnly) {
    query = query.eq("published", true)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error("[property-site] notify email:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger le site depuis la base de données"
    })
  }

  const ownerUserId = typeof data?.owner_user_id === "string" ? data.owner_user_id : null

  if (!ownerUserId) {
    return null
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(ownerUserId)

  if (userError) {
    console.error("[property-site] owner email:", userError.message)
    return null
  }

  const email = userData.user?.email?.trim() ?? ""

  return email || null
}

export async function getPropertyCalendarConfig(slug: string): Promise<PropertyCalendarConfig> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return normalizeCalendarConfig(null)
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("calendar_config")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-site] calendar config:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger la configuration calendrier"
    })
  }

  return normalizeCalendarConfig(data?.calendar_config as PropertyCalendarConfig | null | undefined)
}
