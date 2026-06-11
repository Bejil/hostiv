import type { PropertySiteRecord } from "../types/property-site"

export type DerivedPropertySeo = Pick<
  PropertySiteRecord,
  "seo_title" | "seo_description" | "seo_og_title" | "seo_og_description" | "seo_og_image_path"
>

type SeoSourceRecord = Pick<
  PropertySiteRecord,
  "brand_name" | "brand_meta" | "hero_image_path" | "content"
>

/** SEO et Open Graph dérivés de l’en-tête et du bandeau « Moteur de recherche » (personnalisation). */
export function derivePropertySeo(record: SeoSourceRecord): DerivedPropertySeo {
  const hero = record.content?.copy?.hero
  const header = record.content?.copy?.header

  const heroTitle = String(hero?.title ?? "").trim()
  const heroText = String(hero?.text ?? "").trim()
  const brandName = String(record.brand_name ?? header?.brand_name ?? "").trim()
  const brandMeta = String(record.brand_meta ?? header?.brand_meta ?? "").trim()

  const seo_title = heroTitle || brandName
  const seo_description = heroText || brandMeta

  return {
    seo_title,
    seo_description,
    seo_og_title: seo_title,
    seo_og_description: seo_description,
    seo_og_image_path: String(record.hero_image_path ?? "").trim()
  }
}

export function applyDerivedPropertySeo<T extends SeoSourceRecord>(record: T): T & DerivedPropertySeo {
  return {
    ...record,
    ...derivePropertySeo(record)
  }
}
