import { defaultPlatformUrlForId, isPresetPlatformId } from "../data/admin-platform-tabs"
import type { PropertyPlatformLink } from "../types/property-site"
import { isSharedPlatformLogoPath, normalizePlatformLogoPath } from "./platform-logo"

/** Évite d’utiliser un chemin d’image (`/platforms/...`) comme lien cliquable (SPA + 404). */
export function resolvePlatformLinkHref(url: string, platformId?: string): string {
  const trimmed = url.trim()

  if (!trimmed) {
    return platformId && isPresetPlatformId(platformId) ? defaultPlatformUrlForId(platformId) : ""
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const relative = trimmed.replace(/^\/+/, "")
  const normalizedLogo = normalizePlatformLogoPath(trimmed)

  if (
    isSharedPlatformLogoPath(relative) ||
    isSharedPlatformLogoPath(normalizedLogo) ||
    relative.startsWith("hostiv/platforms/")
  ) {
    return platformId && isPresetPlatformId(platformId) ? defaultPlatformUrlForId(platformId) : ""
  }

  return trimmed
}

export function isPlatformLinkHidden(link: PropertyPlatformLink): boolean {
  return Boolean(link.hidden)
}

export function visiblePlatformLinks(links: PropertyPlatformLink[]): PropertyPlatformLink[] {
  return links.filter((link) => !isPlatformLinkHidden(link))
}
