import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertySiteRecord } from "../types/property-site"

const PROPERTY_SITE_EN_PREFIX = "/en/"

export function isPropertySiteRoute(path: string) {
  const normalized = normalizePropertySitePath(path)

  if (!normalized || normalized === "/") {
    return false
  }

  if (isPropertySiteEnglishRoute(normalized)) {
    const slug = extractPropertySlugFromPath(normalized)

    return Boolean(slug)
  }

  const segment = normalized.slice(1).split("/")[0] ?? ""

  if (!segment || segment.includes(".")) {
    return false
  }

  return !isReservedPropertySitePrefix(segment)
}

export function isPropertySiteEnglishRoute(path: string) {
  const normalized = normalizePropertySitePath(path)

  return normalized.startsWith(PROPERTY_SITE_EN_PREFIX) && normalized.length > PROPERTY_SITE_EN_PREFIX.length
}

export function extractPropertySlugFromPath(path: string) {
  const normalized = normalizePropertySitePath(path)
  const segments = normalized.split("/").filter(Boolean)

  if (!segments.length) {
    return ""
  }

  if (segments[0] === "en") {
    return (segments[1] ?? "").trim().toLowerCase()
  }

  return segments[0]?.trim().toLowerCase() ?? ""
}

export function detectPropertySiteLocaleFromPath(path: string): HostivLocale {
  return isPropertySiteEnglishRoute(path) ? "en" : "fr"
}

export function getPropertySitePath(slug: string, locale: HostivLocale = "fr") {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return locale === "en" ? "/en" : "/"
  }

  return locale === "en" ? `/en/${normalizedSlug}` : `/${normalizedSlug}`
}

export function switchPropertySiteLocalePath(path: string, slug: string, targetLocale: HostivLocale) {
  const hash = path.includes("#") ? path.slice(path.indexOf("#")) : ""
  const query = path.includes("?")
    ? path.slice(path.indexOf("?"), path.includes("#") ? path.indexOf("#") : undefined)
    : ""

  return `${getPropertySitePath(slug, targetLocale)}${query}${hash}`
}

export function propertySiteHasEnglishLocale(
  site: Pick<PropertySiteRecord, "seo_keywords_en_enabled" | "content">
) {
  if (site.seo_keywords_en_enabled) {
    return true
  }

  const copyEn = site.content?.copy_en
  const heroTitle = String(copyEn?.hero?.title ?? "").trim()
  const heroText = String(copyEn?.hero?.text ?? "").trim()

  return Boolean(heroTitle || heroText)
}

function normalizePropertySitePath(path: string) {
  const withoutQuery = (path.split("?")[0]?.split("#")[0] || "/").trim() || "/"

  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1)
  }

  return withoutQuery
}

function isReservedPropertySitePrefix(segment: string) {
  const reserved = new Set([
    "admin",
    "api",
    "en",
    "inscription",
    "mot-de-passe",
    "ressources",
    "tarifs",
    "contact",
    "a-propos",
    "mentions-legales",
    "politique-de-confidentialite",
    "conditions-generales"
  ])

  return reserved.has(segment)
}
