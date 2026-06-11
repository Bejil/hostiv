import type { PropertyAdminRecord } from "../types/property-admin"

/** Chemins Storage par défaut (alignés sur `default-path` dans AdminWelcomeGuideEditor). */
export const WELCOME_GUIDE_IMAGE_DEFAULTS = {
  cover: "gallery/welcome-guide-cover.jpeg",
  host: "gallery/welcome-guide-host.jpeg",
  emergency: "gallery/welcome-guide-emergency.jpeg",
  dining: "gallery/welcome-guide-dining.jpeg"
} as const

export type WelcomeGuidePageImageSlot = keyof typeof WELCOME_GUIDE_IMAGE_DEFAULTS

export function welcomeGuidePlaceDefaultImagePath(placeIndex: number) {
  return `gallery/welcome-guide-place-${placeIndex + 1}.jpeg`
}

/**
 * Chemin guide dédié pour l’éditeur : vide si le champ réutilise le repli visuel (hero, photo hôte…).
 * Évite d’écraser l’asset du site lors d’un upload sur une autre page du guide.
 */
export function welcomeGuideDedicatedImagePath(
  guidePath: string | undefined | null,
  siteFallbackPath: string | undefined | null
): string {
  const stored = String(guidePath ?? "").trim()
  const site = String(siteFallbackPath ?? "").trim()

  if (!stored) {
    return ""
  }

  if (site && stored === site) {
    return ""
  }

  return stored
}

/**
 * Même logique que l’aperçu admin : chemin guide → repli site (hero / hôte) → asset guide par défaut.
 */
export function resolveWelcomeGuideImagePath(
  guidePath: string | undefined | null,
  siteFallbackPath: string | undefined | null,
  defaultPath: string
): string {
  const stored = welcomeGuideDedicatedImagePath(guidePath, siteFallbackPath)

  if (stored) {
    return stored
  }

  const site = String(siteFallbackPath ?? "").trim()

  if (site) {
    return site
  }

  return defaultPath.trim()
}

export function resolveWelcomeGuideCoverImagePath(
  guidePath: string | undefined | null,
  record: PropertyAdminRecord
) {
  return resolveWelcomeGuideImagePath(
    guidePath,
    record.hero_image_path,
    WELCOME_GUIDE_IMAGE_DEFAULTS.cover
  )
}

export function resolveWelcomeGuideHostImagePath(
  guidePath: string | undefined | null,
  record: PropertyAdminRecord
) {
  return resolveWelcomeGuideImagePath(
    guidePath,
    record.host_photo_path,
    WELCOME_GUIDE_IMAGE_DEFAULTS.host
  )
}

export function resolveWelcomeGuideEmergencyImagePath(
  guidePath: string | undefined | null,
  record: PropertyAdminRecord
) {
  return resolveWelcomeGuideImagePath(
    guidePath,
    record.hero_image_path,
    WELCOME_GUIDE_IMAGE_DEFAULTS.emergency
  )
}

export function resolveWelcomeGuideDiningImagePath(
  guidePath: string | undefined | null,
  record: PropertyAdminRecord
) {
  return resolveWelcomeGuideImagePath(
    guidePath,
    record.hero_image_path,
    WELCOME_GUIDE_IMAGE_DEFAULTS.dining
  )
}

export function resolveWelcomeGuidePlaceImagePath(
  guidePath: string | undefined | null,
  placeIndex: number
) {
  return resolveWelcomeGuideImagePath(guidePath, "", welcomeGuidePlaceDefaultImagePath(placeIndex))
}
