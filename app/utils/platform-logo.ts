import { getPresetPlatform, isPresetPlatformId } from "../data/admin-platform-tabs"

/** Logos partagés (dossier `public/platforms/`), pas dans le bucket par slug. */
export const PLATFORM_LOGO_PATHS = {
  airbnb: "/platforms/airbnb.png",
  booking: "/platforms/booking.png",
  abritel: "/platforms/abritel.png"
} as const

const LEGACY_PLATFORM_LOGO_PATHS: Record<string, string> = {
  "platforms/airbnb.svg": PLATFORM_LOGO_PATHS.airbnb,
  "platforms/booking.svg": PLATFORM_LOGO_PATHS.booking,
  "platforms/abritel.svg": PLATFORM_LOGO_PATHS.abritel,
  "platforms/airbnb.png": PLATFORM_LOGO_PATHS.airbnb,
  "platforms/booking.png": PLATFORM_LOGO_PATHS.booking,
  "platforms/abritel.png": PLATFORM_LOGO_PATHS.abritel,
  "hostiv/platforms/platform_airbnb.png": PLATFORM_LOGO_PATHS.airbnb,
  "hostiv/platforms/platform_booking.png": PLATFORM_LOGO_PATHS.booking,
  "hostiv/platforms/platform_abritel.png": PLATFORM_LOGO_PATHS.abritel
}

export function normalizePlatformLogoPath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed) {
    return ""
  }

  const relative = trimmed.replace(/^\/+/, "")
  const mapped = LEGACY_PLATFORM_LOGO_PATHS[relative]

  if (mapped) {
    return mapped
  }

  if (isSharedPlatformLogoPath(trimmed)) {
    return trimmed.startsWith("/") ? trimmed : `/${relative}`
  }

  return trimmed
}

export function isSharedPlatformLogoPath(path: string): boolean {
  const relative = path.trim().replace(/^\/+/, "")

  return relative.startsWith("platforms/") && !relative.includes("..")
}

export function defaultPlatformLogoForId(platformId: string): string {
  if (isPresetPlatformId(platformId)) {
    return PLATFORM_LOGO_PATHS[platformId]
  }

  return getPresetPlatform(platformId)?.defaultLogo
    ? normalizePlatformLogoPath(getPresetPlatform(platformId)!.defaultLogo)
    : ""
}

export function resolvePlatformLogoPath(logo: string, platformId?: string): string {
  const normalized = normalizePlatformLogoPath(logo)

  if (normalized) {
    return normalized
  }

  if (platformId) {
    return defaultPlatformLogoForId(platformId)
  }

  return ""
}
