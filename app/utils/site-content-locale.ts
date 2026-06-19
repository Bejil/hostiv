import type { HostivLocale } from "../types/hostiv-locale"
import type { AmenityPreviewSection, AmenitySection } from "../types/amenity"
import type {
  PropertyBenefitCard,
  PropertyFeaturedSpace,
  PropertyGalleryCategory,
  PropertyHouseRule,
  PropertyNeighborhoodHighlight,
  PropertyReview,
  PropertySiteContent,
  PropertySiteCopy,
  PropertySiteLocaleBase,
  PropertySiteRecord,
  PropertyVisualCard
} from "../types/property-site"
import { withAmenityPreviewHasMore } from "./amenity-preview"

export const LOCALIZED_SITE_LIST_KEYS = [
  "featured_spaces",
  "space_gallery_categories",
  "benefit_cards",
  "visual_cards",
  "neighborhood_highlights",
  "house_rules",
  "reviews"
] as const

export type LocalizedSiteListKey = (typeof LOCALIZED_SITE_LIST_KEYS)[number]

type LocalizedSiteListMap = {
  featured_spaces: PropertyFeaturedSpace[]
  space_gallery_categories: PropertyGalleryCategory[]
  benefit_cards: PropertyBenefitCard[]
  visual_cards: PropertyVisualCard[]
  neighborhood_highlights: PropertyNeighborhoodHighlight[]
  house_rules: PropertyHouseRule[]
  reviews: PropertyReview[]
}

export type LocalizedSiteContentKey = keyof PropertySiteContent | `${LocalizedSiteListKey}_en` | "copy_en"

export function localizedSiteCopyKey(locale: HostivLocale): "copy" | "copy_en" {
  return locale === "en" ? "copy_en" : "copy"
}

export function localizedSiteListKey<K extends LocalizedSiteListKey>(
  key: K,
  locale: HostivLocale
): K | `${K}_en` {
  return locale === "en" ? `${key}_en` : key
}

function mergeCopySectionOverride<T extends Record<string, string>>(
  base: T,
  overrides: T | undefined
): T {
  if (!overrides) {
    return base
  }

  const merged = { ...base }

  for (const fieldKey of Object.keys(base) as (keyof T)[]) {
    const overrideValue = String(overrides[fieldKey] ?? "").trim()

    if (overrideValue) {
      merged[fieldKey] = overrides[fieldKey]
    }
  }

  return merged
}

function mergeCopySectionPrimaryFirst<T extends Record<string, string>>(
  primary: T,
  fallback: T | undefined
): T {
  if (!fallback) {
    return primary
  }

  const merged = { ...primary }

  for (const fieldKey of Object.keys(primary) as (keyof T)[]) {
    const primaryValue = String(primary[fieldKey] ?? "").trim()

    if (!primaryValue) {
      const fallbackValue = String(fallback[fieldKey] ?? "").trim()

      if (fallbackValue) {
        merged[fieldKey] = fallback[fieldKey]
      }
    }
  }

  return merged
}

export function mergeSiteCopyOverride(
  base: PropertySiteCopy,
  overrides?: PropertySiteCopy
): PropertySiteCopy {
  if (!overrides) {
    return base
  }

  const merged = { ...base }

  for (const sectionId of Object.keys(base) as (keyof PropertySiteCopy)[]) {
    merged[sectionId] = mergeCopySectionOverride(base[sectionId], overrides[sectionId])
  }

  return merged
}

export function mergeSiteCopyPrimaryFirst(
  primary: PropertySiteCopy,
  fallback?: PropertySiteCopy
): PropertySiteCopy {
  if (!fallback) {
    return primary
  }

  const merged = { ...primary }

  for (const sectionId of Object.keys(primary) as (keyof PropertySiteCopy)[]) {
    merged[sectionId] = mergeCopySectionPrimaryFirst(primary[sectionId], fallback[sectionId])
  }

  return merged
}

/** Liste de la locale active, sinon repli sur l’autre langue. */
export function resolveLocalizedList<T>(primary: T[] | undefined, fallback: T[] | undefined): T[] {
  const primaryList = primary ?? []
  const fallbackList = fallback ?? []

  if (primaryList.length > 0) {
    return primaryList
  }

  if (fallbackList.length > 0) {
    return fallbackList
  }

  return []
}

export function getSiteContentList<K extends LocalizedSiteListKey>(
  content: PropertySiteContent,
  key: K,
  locale: HostivLocale
): LocalizedSiteListMap[K] {
  const primaryKey = localizedSiteListKey(key, locale)
  const fallbackKey = localizedSiteListKey(key, locale === "en" ? "fr" : "en")
  const primary = content[primaryKey as keyof PropertySiteContent]
  const fallback = content[fallbackKey as keyof PropertySiteContent]

  return resolveLocalizedList(
    Array.isArray(primary) ? primary : undefined,
    Array.isArray(fallback) ? fallback : undefined
  ) as LocalizedSiteListMap[K]
}

export function cloneSiteContentList<T>(items: T[]): T[] {
  return JSON.parse(JSON.stringify(items)) as T[]
}

/** Duplique les listes FR↔EN quand la cible est vide et la source remplie. */
export function seedLocalizedSiteLists(
  content: PropertySiteContent,
  targetLocale: HostivLocale
): PropertySiteContent | null {
  const next = { ...content }
  let changed = false

  for (const key of LOCALIZED_SITE_LIST_KEYS) {
    const targetKey = localizedSiteListKey(key, targetLocale)
    const sourceKey = localizedSiteListKey(key, targetLocale === "en" ? "fr" : "en")
    const targetList = content[targetKey as keyof PropertySiteContent]
    const sourceList = content[sourceKey as keyof PropertySiteContent]

    if (
      !(Array.isArray(targetList) && targetList.length > 0) &&
      Array.isArray(sourceList) &&
      sourceList.length > 0
    ) {
      ;(next as Record<string, unknown>)[targetKey] = cloneSiteContentList(sourceList)
      changed = true
    }
  }

  return changed ? next : null
}

const LOCALIZED_AMENITY_KEYS = [
  ["amenity_catalog", "amenity_catalog_en"],
  ["amenity_preview_sections", "amenity_preview_sections_en"]
] as const

/** Duplique catalogues / cartes équipements FR↔EN quand la cible est vide. */
export function seedLocalizedAmenityContent(
  content: PropertySiteContent,
  targetLocale: HostivLocale
): PropertySiteContent | null {
  const next = { ...content }
  let changed = false

  for (const [sourceKey, targetKey] of LOCALIZED_AMENITY_KEYS) {
    const sourceList = content[sourceKey as keyof PropertySiteContent]
    const targetList = content[targetKey as keyof PropertySiteContent]

    if (
      !(Array.isArray(targetList) && targetList.length > 0) &&
      Array.isArray(sourceList) &&
      sourceList.length > 0
    ) {
      const cloned = cloneSiteContentList(sourceList)

      ;(next as Record<string, unknown>)[targetKey] =
        targetKey === "amenity_preview_sections_en"
          ? withAmenityPreviewHasMore(cloned as AmenityPreviewSection[])
          : cloned
      changed = true
    }
  }

  return changed ? next : null
}

export function resolveLocalizedAmenitySection(
  locale: HostivLocale,
  frSection: AmenitySection,
  enSection: AmenitySection | undefined
): AmenitySection {
  if (locale === "fr" || !enSection) {
    return frSection
  }

  const enItemsById = new Map(enSection.items.map((item) => [item.id, item]))

  return {
    ...frSection,
    title: resolveLocaleContentField(locale, frSection.title, enSection.title) || frSection.title,
    items: frSection.items.map((frItem) => {
      const enItem = enItemsById.get(frItem.id)

      if (!enItem) {
        return frItem
      }

      const name = resolveLocaleContentField(locale, frItem.name, enItem.name) || frItem.name
      const frDescription = frItem.description?.trim()
      const enDescription = enItem.description?.trim()
      let description: string | undefined

      if (frDescription || enDescription) {
        description =
          resolveLocaleContentField(locale, frDescription, enDescription) ||
          frDescription ||
          enDescription
      }

      return description ? { ...frItem, name, description } : { ...frItem, name }
    })
  }
}

export function resolveLocalizedAmenitySections(
  locale: HostivLocale,
  frSections: AmenitySection[],
  enSections: AmenitySection[] | undefined
): AmenitySection[] {
  if (locale === "fr" || !enSections?.length) {
    return frSections
  }

  const enById = new Map(enSections.map((section) => [section.id, section]))

  return frSections.map((section) =>
    resolveLocalizedAmenitySection(locale, section, enById.get(section.id))
  )
}

function buildLocaleBase(content: PropertySiteContent): PropertySiteLocaleBase {
  const existing = content.locale_base

  if (existing) {
    return existing
  }

  return {
    copy: content.copy,
    featured_spaces: content.featured_spaces ?? [],
    space_gallery_categories: content.space_gallery_categories ?? [],
    benefit_cards: content.benefit_cards ?? [],
    visual_cards: content.visual_cards ?? [],
    neighborhood_highlights: content.neighborhood_highlights ?? [],
    house_rules: content.house_rules ?? [],
    reviews: content.reviews ?? []
  }
}

function contentWithLocaleBase(
  content: PropertySiteContent,
  base: PropertySiteLocaleBase
): PropertySiteContent {
  return {
    ...content,
    copy: base.copy,
    featured_spaces: base.featured_spaces,
    space_gallery_categories: base.space_gallery_categories,
    benefit_cards: base.benefit_cards,
    visual_cards: base.visual_cards,
    neighborhood_highlights: base.neighborhood_highlights,
    house_rules: base.house_rules,
    reviews: base.reviews
  }
}

function resolveLocalizedSiteLists(content: PropertySiteContent, locale: HostivLocale) {
  return {
    featured_spaces: getSiteContentList(content, "featured_spaces", locale),
    space_gallery_categories: getSiteContentList(content, "space_gallery_categories", locale),
    benefit_cards: getSiteContentList(content, "benefit_cards", locale),
    visual_cards: getSiteContentList(content, "visual_cards", locale),
    neighborhood_highlights: getSiteContentList(content, "neighborhood_highlights", locale),
    house_rules: getSiteContentList(content, "house_rules", locale),
    reviews: getSiteContentList(content, "reviews", locale)
  }
}

/** Champ de contenu : en EN, ignore une valeur EN identique au FR (copie admin). */
export function resolveLocaleContentField(
  locale: HostivLocale,
  frValue: string | undefined,
  enValue: string | undefined,
  options?: { hideUntranslatedOnEn?: boolean }
): string {
  const fr = String(frValue ?? "").trim()
  const en = String(enValue ?? "").trim()

  if (locale === "fr") {
    return fr || en
  }

  if (en && en !== fr) {
    return en
  }

  if (options?.hideUntranslatedOnEn) {
    return ""
  }

  return fr
}

/** Texte d’interface ou CTA système : en EN, jamais de repli FR fusionné. */
export function resolveLocaleChromeField(
  locale: HostivLocale,
  frValue: string | undefined,
  enValue: string | undefined,
  localeFallback: string
): string {
  const fr = String(frValue ?? "").trim()
  const en = String(enValue ?? "").trim()

  if (locale === "fr") {
    return fr || localeFallback
  }

  if (en && en !== fr) {
    return en
  }

  return localeFallback
}

export function resolveLocalizedFeaturedSpace(
  locale: HostivLocale,
  frSpace: PropertyFeaturedSpace | undefined,
  enSpace: PropertyFeaturedSpace | undefined,
  fallback: PropertyFeaturedSpace
): PropertyFeaturedSpace {
  if (locale === "fr" || !frSpace || !enSpace) {
    return fallback
  }

  return {
    ...fallback,
    title: resolveLocaleContentField(locale, frSpace.title, enSpace.title) || fallback.title,
    text: resolveLocaleContentField(locale, frSpace.text, enSpace.text) || fallback.text,
    tag: resolveLocaleContentField(locale, frSpace.tag, enSpace.tag, {
      hideUntranslatedOnEn: true
    }),
    image: fallback.image,
    gallery_category_id: fallback.gallery_category_id
  }
}

/** Aperçu / site public : contenu de la locale active avec repli sur l’autre langue. */
export function applySiteContentLocale(
  site: PropertySiteRecord,
  locale: HostivLocale
): PropertySiteRecord {
  const content = site.content
  const localeBase = buildLocaleBase(content)
  const sourceContent = contentWithLocaleBase(content, localeBase)
  const lists = resolveLocalizedSiteLists(sourceContent, locale)
  const amenityCatalog = resolveLocalizedAmenitySections(
    locale,
    sourceContent.amenity_catalog ?? [],
    content.amenity_catalog_en
  )
  const amenityPreviewSections = withAmenityPreviewHasMore(
    resolveLocalizedAmenitySections(
      locale,
      sourceContent.amenity_preview_sections ?? [],
      content.amenity_preview_sections_en
    ) as AmenityPreviewSection[]
  )
  const mergedCopy =
    locale === "en"
      ? mergeSiteCopyOverride(localeBase.copy, content.copy_en)
      : mergeSiteCopyPrimaryFirst(localeBase.copy, content.copy_en)
  const heroTitle = mergedCopy.hero?.title?.trim() || site.hero_image_alt

  return {
    ...site,
    brand_name: mergedCopy.header?.brand_name?.trim() || site.brand_name,
    brand_meta: mergedCopy.header?.brand_meta?.trim() || site.brand_meta,
    hero_image_alt: heroTitle,
    content: {
      ...content,
      locale_base: localeBase,
      copy: mergedCopy,
      amenity_catalog: amenityCatalog,
      amenity_preview_sections: amenityPreviewSections,
      ...lists
    }
  }
}
