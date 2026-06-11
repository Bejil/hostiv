import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteRecord } from "../types/property-site"
import { normalizePropertyAdminRecord } from "./normalize-property-admin"
import { applySiteContentLocale } from "./site-content-locale"

export type MapAdminSitePreviewOptions = {
  /** Aligné sur `stripe_charges_enabled` / Connect `paymentsReady` pour tester le tunnel de réservation. */
  stripePaymentsReady?: boolean
  locale?: HostivLocale
}

/** Données admin → format site public (aperçu brouillon). */
export function mapAdminRecordToSitePreview(
  admin: PropertyAdminRecord,
  options?: MapAdminSitePreviewOptions
): PropertySiteRecord {
  const normalized = normalizePropertyAdminRecord(admin)

  const site: PropertySiteRecord = {
    id: normalized.id,
    slug: normalized.slug,
    published: normalized.published,
    brand_name: normalized.brand_name,
    brand_meta: normalized.brand_meta,
    logo_path: normalized.logo_path,
    seo_title: normalized.seo_title,
    seo_description: normalized.seo_description,
    seo_keywords: normalized.seo_keywords,
    seo_keywords_en: normalized.seo_keywords_en,
    seo_keywords_fr_enabled: normalized.seo_keywords_fr_enabled,
    seo_keywords_en_enabled: normalized.seo_keywords_en_enabled,
    seo_og_title: normalized.seo_og_title,
    seo_og_description: normalized.seo_og_description,
    seo_og_image_path: normalized.seo_og_image_path,
    seo_twitter_card: normalized.seo_twitter_card,
    seo_noindex: normalized.seo_noindex,
    hero_image_path: normalized.hero_image_path,
    hero_image_alt: normalized.hero_image_alt,
    testimonials_bg_path: normalized.testimonials_bg_path,
    host_photo_path: normalized.host_photo_path,
    subscription_plan: normalized.subscription_plan,
    stripe_payments_ready: Boolean(options?.stripePaymentsReady),
    booking_config: normalized.booking_config,
    location: normalized.location,
    content: normalized.content
  }

  if (options?.locale) {
    return applySiteContentLocale(site, options.locale)
  }

  return site
}
