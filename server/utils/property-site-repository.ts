import type {
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
import { requireSupabaseAdmin } from "./supabase"

/** Colonnes exposées au front (sans e-mail hôte). */
const PROPERTY_SITE_PUBLIC_SELECT =
  "id, slug, published, brand_name, brand_meta, logo_path, favicon_path, seo_title, seo_description, hero_image_path, hero_image_alt, testimonials_bg_path, host_photo_path, subscription_plan, stripe_charges_enabled, booking_config, location, content"

const DEFAULT_EMAIL_CONTENT: PropertySiteEmailContent = {
  access_lines: []
}

function normalizeContent(content: PropertySiteContent): PropertySiteContent {
  return {
    ...content,
    template: {
      id: normalizeSiteTemplateId(content.template?.id)
    },
    email: content.email ?? DEFAULT_EMAIL_CONTENT,
    reviews: (content.reviews ?? []).map((review) => ({
      ...review,
      rating: normalizeReviewRatingValue(review.rating)
    }))
  }
}

function mapRow(row: PropertySiteRow): PropertySiteRecord {
  return {
    id: row.id,
    slug: row.slug,
    published: row.published,
    brand_name: row.brand_name,
    brand_meta: row.brand_meta || "",
    logo_path: row.logo_path,
    favicon_path: row.favicon_path || row.logo_path,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    hero_image_path: row.hero_image_path,
    hero_image_alt: row.hero_image_alt || "",
    testimonials_bg_path: row.testimonials_bg_path,
    host_photo_path: row.host_photo_path,
    subscription_plan: normalizeHostivSubscriptionPlan(row.subscription_plan),
    stripe_payments_ready: Boolean(row.stripe_charges_enabled),
    booking_config: normalizeBookingConfig(row.booking_config),
    location: row.location,
    content: normalizeContent(row.content)
  }
}

export async function getPropertySiteBySlug(slug: string): Promise<PropertySiteRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SITE_PUBLIC_SELECT)
    .eq("slug", normalizedSlug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    console.error("[property-site] Supabase error:", error.message)
    throw createError({
      statusCode: 502,
      statusMessage: "Impossible de charger le site depuis la base de données"
    })
  }

  if (!data) {
    return null
  }

  return mapRow(data as PropertySiteRow)
}

export async function getPropertyBookingNotifyEmail(slug: string): Promise<string | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("booking_notify_email")
    .eq("slug", normalizedSlug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    console.error("[property-site] notify email:", error.message)
    throw createError({
      statusCode: 502,
      statusMessage: "Impossible de charger le site depuis la base de données"
    })
  }

  const email = typeof data?.booking_notify_email === "string" ? data.booking_notify_email.trim() : ""

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
      statusMessage: "Impossible de charger la configuration calendrier"
    })
  }

  return normalizeCalendarConfig(data?.calendar_config as PropertyCalendarConfig | null | undefined)
}
