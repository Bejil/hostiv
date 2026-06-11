import type { HostivLocale } from "../types/hostiv-locale"

export type SiteTemplateId =
  | "signature"
  | "riviera"
  | "panorama"
  | "toky"
  | "cabin"
  | "resort"
  | "marina"

export type SiteTemplateOption = {
  id: SiteTemplateId
  name: string
  eyebrow: string
  description: string
}

export const DEFAULT_SITE_TEMPLATE_ID: SiteTemplateId = "signature"

const siteTemplateOptionsFr: SiteTemplateOption[] = [
  {
    id: "signature",
    name: "Signature",
    eyebrow: "Chaleureux · Premium",
    description: "L’ambiance actuelle : tons sable, cartes douces et expérience très éditoriale."
  },
  {
    id: "riviera",
    name: "Riviera",
    eyebrow: "Lumineux · Vacances",
    description: "Hero arrondi, titres serif, cartes plus généreuses et sections plus aérées."
  },
  {
    id: "panorama",
    name: "Panorama",
    eyebrow: "Immersif · Narratif",
    description:
      "Mise en page inédite : sections plus cinématographiques, compositions asymétriques et focus visuel."
  },
  {
    id: "toky",
    name: "Toky",
    eyebrow: "Éditorial · Jaune",
    description:
      "Inspiré hôtel boutique : fond clair, serif décoratif, accents jaune vif et boutons noirs."
  },
  {
    id: "cabin",
    name: "Cabin",
    eyebrow: "Nature · Forêt",
    description:
      "Crème et vert forêt, titres serif élégants, cartes douces et formulaire sombre."
  },
  {
    id: "resort",
    name: "Resort",
    eyebrow: "Voyage · Rouge",
    description:
      "Blanc et rouge, hero lumineux en arc, barre de réservation horizontale type hôtel."
  },
  {
    id: "marina",
    name: "Marina",
    eyebrow: "Luxe · Marine",
    description:
      "Bleu marine et corail, cartes nettes, CTA arrondis et sections contrastées."
  }
]

const siteTemplateOptionsEn: SiteTemplateOption[] = [
  {
    id: "signature",
    name: "Signature",
    eyebrow: "Warm · Premium",
    description: "The current look: sand tones, soft cards and a highly editorial feel."
  },
  {
    id: "riviera",
    name: "Riviera",
    eyebrow: "Bright · Holiday",
    description: "Rounded hero, serif titles, generous cards and airier sections."
  },
  {
    id: "panorama",
    name: "Panorama",
    eyebrow: "Immersive · Story-driven",
    description:
      "A fresh layout: more cinematic sections, asymmetric compositions and visual focus."
  },
  {
    id: "toky",
    name: "Toky",
    eyebrow: "Editorial · Yellow",
    description:
      "Boutique hotel inspired: light background, decorative serif, bright yellow accents and black buttons."
  },
  {
    id: "cabin",
    name: "Cabin",
    eyebrow: "Nature · Forest",
    description: "Cream and forest green, elegant serif titles, soft cards and a dark booking form."
  },
  {
    id: "resort",
    name: "Resort",
    eyebrow: "Travel · Red",
    description: "White and red, bright arched hero, horizontal hotel-style booking bar."
  },
  {
    id: "marina",
    name: "Marina",
    eyebrow: "Luxury · Marine",
    description: "Navy and coral, crisp cards, rounded CTAs and contrasting sections."
  }
]

/** @deprecated Utiliser getSiteTemplateOptions(locale) */
export const siteTemplateOptions = siteTemplateOptionsFr

export function getSiteTemplateOptions(locale: HostivLocale = "fr"): SiteTemplateOption[] {
  return locale === "en" ? siteTemplateOptionsEn : siteTemplateOptionsFr
}

const templateIdSet = new Set(siteTemplateOptionsFr.map((option) => option.id))

/** Retourne null si aucun thème n’a été choisi (onboarding / brouillon). */
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

export function normalizeSiteTemplateId(value: unknown): SiteTemplateId {
  return parseSiteTemplateId(value) ?? DEFAULT_SITE_TEMPLATE_ID
}
