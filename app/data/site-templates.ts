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

export const siteTemplateOptions: SiteTemplateOption[] = [
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

const templateIdSet = new Set(siteTemplateOptions.map((option) => option.id))

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
