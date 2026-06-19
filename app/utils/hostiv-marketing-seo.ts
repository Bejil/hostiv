import type { HostivLocale } from "../types/hostiv-locale"
import {
  HOSTIV_HOME_PATHS,
  HOSTIV_PRICING_PATHS,
  HOSTIV_RESOURCES_PATHS,
  HOSTIV_STATIC_PATHS,
  detectHostivLocaleFromPath,
  isHostivResourcesIndexPath,
  normalizeHostivMarketingPath,
  switchHostivLocalePath
} from "../data/hostiv-routes"
import { getHostivResourceSitemapPaths } from "../data/hostivResources"
import type { HostivStaticPageId } from "../data/hostiv-static-page.types"

export const HOSTIV_MARKETING_SITE_NAME = "Hostiv"
export const HOSTIV_MARKETING_OG_IMAGE_PATH = "/hostiv/cta-welcome.png"
export const HOSTIV_MARKETING_DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"

const STATIC_PATH_TO_PAGE_ID = new Map<string, HostivStaticPageId>()

for (const [pageId, paths] of Object.entries(HOSTIV_STATIC_PATHS) as Array<
  [HostivStaticPageId, Record<HostivLocale, string>]
>) {
  STATIC_PATH_TO_PAGE_ID.set(paths.fr, pageId)
  STATIC_PATH_TO_PAGE_ID.set(paths.en, pageId)
}

export function resolveHostivMarketingBaseUrl(configuredSiteUrl: string, fallbackOrigin?: string) {
  const configured = configuredSiteUrl.trim().replace(/\/+$/, "")

  if (configured) {
    return configured
  }

  const fallback = fallbackOrigin?.trim().replace(/\/+$/, "") ?? ""

  return fallback
}

export function resolveHostivMarketingAbsoluteUrl(baseUrl: string, path: string) {
  const normalizedPath = normalizeHostivMarketingPath(path)

  if (!baseUrl) {
    return normalizedPath
  }

  if (normalizedPath === "/") {
    return `${baseUrl}/`
  }

  return `${baseUrl}${normalizedPath}`
}

export function resolveHostivMarketingOgImageUrl(
  baseUrl: string,
  imagePath = HOSTIV_MARKETING_OG_IMAGE_PATH
) {
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`

  if (!baseUrl) {
    return normalizedPath
  }

  return `${baseUrl}${normalizedPath}`
}

export function hostivMarketingPageHasLocaleAlternates(path: string) {
  const normalized = normalizeHostivMarketingPath(path)

  if (normalized === HOSTIV_HOME_PATHS.fr || normalized === HOSTIV_HOME_PATHS.en) {
    return true
  }

  if (normalized === HOSTIV_PRICING_PATHS.fr || normalized === HOSTIV_PRICING_PATHS.en) {
    return true
  }

  if (isHostivResourcesIndexPath(normalized)) {
    return true
  }

  if (normalized.startsWith("/ressources/") || normalized.startsWith("/en/resources/")) {
    return true
  }

  return STATIC_PATH_TO_PAGE_ID.has(normalized)
}

export function buildHostivMarketingHreflangLinks(path: string, baseUrl: string) {
  if (!baseUrl || !hostivMarketingPageHasLocaleAlternates(path)) {
    return [] as Array<{ rel: string; hreflang: string; href: string }>
  }

  const normalized = normalizeHostivMarketingPath(path)
  const frPath = switchHostivLocalePath(normalized, "fr")
  const enPath = switchHostivLocalePath(normalized, "en")
  const frHref = resolveHostivMarketingAbsoluteUrl(baseUrl, frPath)
  const enHref = resolveHostivMarketingAbsoluteUrl(baseUrl, enPath)

  return [
    { rel: "alternate", hreflang: "fr", href: frHref },
    { rel: "alternate", hreflang: "en", href: enHref },
    { rel: "alternate", hreflang: "x-default", href: frHref }
  ]
}

export function resolveHostivMarketingCanonicalUrl(path: string, baseUrl: string) {
  if (!baseUrl) {
    return ""
  }

  return resolveHostivMarketingAbsoluteUrl(baseUrl, path)
}

export function hostivMarketingOgLocale(locale: HostivLocale) {
  return locale === "en" ? "en_GB" : "fr_FR"
}

export function getHostivMarketingSitemapPaths(): string[] {
  const staticPaths = Object.values(HOSTIV_STATIC_PATHS).flatMap((paths) => [paths.fr, paths.en])
  const resourcePaths = [
    HOSTIV_RESOURCES_PATHS.fr,
    HOSTIV_RESOURCES_PATHS.en,
    ...getHostivResourceSitemapPaths()
  ]

  return [
    HOSTIV_HOME_PATHS.fr,
    HOSTIV_HOME_PATHS.en,
    HOSTIV_PRICING_PATHS.fr,
    HOSTIV_PRICING_PATHS.en,
    ...resourcePaths,
    ...staticPaths
  ]
}

/** Chemins marketing à pré-rendre au build (alignés sur le sitemap). */
export function getHostivMarketingPrerenderPaths(): string[] {
  return getHostivMarketingSitemapPaths()
}

export function detectHostivMarketingLocaleFromPath(path: string): HostivLocale {
  return detectHostivLocaleFromPath(normalizeHostivMarketingPath(path))
}
