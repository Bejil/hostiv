import type { HostivLocale } from "../types/hostiv-locale"

export type SiteTemplateId =
  | "signature"
  | "riviera"
  | "panorama"
  | "cabin"
  | "marina"

export type SiteTemplateOption = {
  id: SiteTemplateId
  name: string
  eyebrow: string
  description: string
}

export const DEFAULT_SITE_TEMPLATE_ID: SiteTemplateId = "signature"

const LEGACY_SITE_TEMPLATE_MIGRATION: Record<string, SiteTemplateId> = {
  toky: "signature",
  resort: "marina"
}

const siteTemplateOptionsFr: SiteTemplateOption[] = [
  {
    id: "signature",
    name: "Signature",
    eyebrow: "Chaleureux · Premium",
    description: "Tons sable, cartes douces et expérience éditoriale."
  },
  {
    id: "riviera",
    name: "Riviera",
    eyebrow: "Lumineux · Vacances",
    description: "Hero arrondi, titres serif et sections aérées."
  },
  {
    id: "panorama",
    name: "Panorama",
    eyebrow: "Immersif · Narratif",
    description: "Sections cinématographiques et compositions asymétriques."
  },
  {
    id: "cabin",
    name: "Cabin",
    eyebrow: "Nature · Forêt",
    description: "Crème et vert forêt, serif élégant, formulaire sombre."
  },
  {
    id: "marina",
    name: "Marina",
    eyebrow: "Luxe · Marine",
    description: "Bleu marine et corail, cartes nettes et CTA arrondis."
  }
]

const siteTemplateOptionsEn: SiteTemplateOption[] = [
  {
    id: "signature",
    name: "Signature",
    eyebrow: "Warm · Premium",
    description: "Sand tones, soft cards and an editorial feel."
  },
  {
    id: "riviera",
    name: "Riviera",
    eyebrow: "Bright · Holiday",
    description: "Rounded hero, serif titles and airy sections."
  },
  {
    id: "panorama",
    name: "Panorama",
    eyebrow: "Immersive · Story-driven",
    description: "Cinematic sections and asymmetric compositions."
  },
  {
    id: "cabin",
    name: "Cabin",
    eyebrow: "Nature · Forest",
    description: "Cream and forest green, elegant serif, dark booking form."
  },
  {
    id: "marina",
    name: "Marina",
    eyebrow: "Luxury · Marine",
    description: "Navy and coral, crisp cards and rounded CTAs."
  }
]

/** @deprecated Utiliser getSiteTemplateOptions(locale) */
export const siteTemplateOptions = siteTemplateOptionsFr

export function getSiteTemplateOptions(locale: HostivLocale = "fr"): SiteTemplateOption[] {
  return locale === "en" ? siteTemplateOptionsEn : siteTemplateOptionsFr
}

const templateIdSet = new Set(siteTemplateOptionsFr.map((option) => option.id))

/** Retourne null si aucun thème actif n’a été choisi (onboarding / brouillon). */
export function parseSiteTemplateId(value: unknown): SiteTemplateId | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed || !templateIdSet.has(trimmed as SiteTemplateId)) {
    return null
  }

  return trimmed as SiteTemplateId
}

/** Résout un thème pour le site public (inclut migration des anciens thèmes retirés). */
export function resolveSiteTemplateId(value: unknown): SiteTemplateId {
  const parsed = parseSiteTemplateId(value)

  if (parsed) {
    return parsed
  }

  if (typeof value === "string") {
    const migrated = LEGACY_SITE_TEMPLATE_MIGRATION[value.trim()]

    if (migrated) {
      return migrated
    }
  }

  return DEFAULT_SITE_TEMPLATE_ID
}

export function normalizeSiteTemplateId(value: unknown): SiteTemplateId {
  return resolveSiteTemplateId(value)
}
