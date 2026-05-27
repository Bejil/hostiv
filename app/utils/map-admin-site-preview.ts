import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteRecord } from "../types/property-site"

/** Données admin → format site public (aperçu brouillon). */
export function mapAdminRecordToSitePreview(admin: PropertyAdminRecord): PropertySiteRecord {
  return {
    id: admin.id,
    slug: admin.slug,
    published: admin.published,
    brand_name: admin.brand_name,
    brand_meta: admin.brand_meta,
    logo_path: admin.logo_path,
    favicon_path: admin.favicon_path,
    seo_title: admin.seo_title,
    seo_description: admin.seo_description,
    hero_image_path: admin.hero_image_path,
    hero_image_alt: admin.hero_image_alt,
    testimonials_bg_path: admin.testimonials_bg_path,
    host_photo_path: admin.host_photo_path,
    subscription_plan: admin.subscription_plan,
    stripe_payments_ready: false,
    booking_config: admin.booking_config,
    location: admin.location,
    content: admin.content
  }
}
