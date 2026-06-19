import type { HostivLocale } from "../types/hostiv-locale"
import {
  DEFAULT_SITE_TEMPLATE_ID,
  parseSiteTemplateId,
  resolveSiteTemplateId,
  type SiteTemplateId
} from "./site-templates"

export type SiteLayoutId = "classic" | "split" | "hotel" | "editorial"

export const DEFAULT_SITE_LAYOUT_ID: SiteLayoutId = "classic"

export type PropertySiteTemplateConfig = {
  layout: SiteLayoutId | null
  theme: SiteTemplateId | null
  /** Alias rétrocompatibilité (thème). */
  id: SiteTemplateId | null
}

type NormalizeSiteTemplateOptions = {
  /** Site public / API : applique les valeurs par défaut. */
  forPublic?: boolean
}

export type SiteLayoutOption = {
  id: SiteLayoutId
  name: string
  eyebrow: string
  description: string
}

const siteLayoutOptionsFr: SiteLayoutOption[] = [
  {
    id: "classic",
    name: "Classic",
    eyebrow: "Plein écran",
    description: "Hero immersif pleine largeur avec bandeau de réservation intégré."
  },
  {
    id: "split",
    name: "Split",
    eyebrow: "Sidebar",
    description: "Image en haut, texte et carte de réservation côte à côte."
  },
  {
    id: "hotel",
    name: "Hotel",
    eyebrow: "Centré",
    description: "Hero centré et barre de réservation horizontale."
  },
  {
    id: "editorial",
    name: "Editorial",
    eyebrow: "Colonne",
    description: "Colonne étroite de lecture : hero empilé et sections monolithiques."
  }
]

const siteLayoutOptionsEn: SiteLayoutOption[] = [
  {
    id: "classic",
    name: "Classic",
    eyebrow: "Full width",
    description: "Immersive full-width hero with integrated booking strip."
  },
  {
    id: "split",
    name: "Split",
    eyebrow: "Sidebar",
    description: "Image on top, copy and booking card side by side."
  },
  {
    id: "hotel",
    name: "Hotel",
    eyebrow: "Centered",
    description: "Centered hero and horizontal booking bar."
  },
  {
    id: "editorial",
    name: "Editorial",
    eyebrow: "Column",
    description: "Narrow reading column with stacked hero and single-column sections."
  }
]

const layoutIdSet = new Set(siteLayoutOptionsFr.map((option) => option.id))

export function getSiteLayoutOptions(locale: HostivLocale = "fr"): SiteLayoutOption[] {
  return locale === "en" ? siteLayoutOptionsEn : siteLayoutOptionsFr
}

export function parseSiteLayoutId(value: unknown): SiteLayoutId | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed || !layoutIdSet.has(trimmed as SiteLayoutId)) {
    return null
  }

  return trimmed as SiteLayoutId
}

export function normalizeSiteLayoutId(value: unknown): SiteLayoutId {
  return parseSiteLayoutId(value) ?? DEFAULT_SITE_LAYOUT_ID
}

function inferLayoutFromLegacyTheme(rawTheme: unknown): SiteLayoutId {
  if (typeof rawTheme === "string" && rawTheme.trim() === "resort") {
    return "hotel"
  }

  return DEFAULT_SITE_LAYOUT_ID
}

export function normalizeSiteTemplate(
  raw: Partial<PropertySiteTemplateConfig> | { id?: SiteTemplateId | null; layout?: SiteLayoutId | null } | null | undefined,
  options: NormalizeSiteTemplateOptions = {}
): PropertySiteTemplateConfig {
  const forPublic = options.forPublic === true
  const rawTheme = raw?.theme ?? raw?.id
  const theme = forPublic ? resolveSiteTemplateId(rawTheme) : parseSiteTemplateId(rawTheme)
  const explicitLayout = parseSiteLayoutId(raw?.layout)

  if (forPublic) {
    const resolvedTheme = theme ?? DEFAULT_SITE_TEMPLATE_ID
    const resolvedLayout = explicitLayout ?? inferLayoutFromLegacyTheme(rawTheme)

    return {
      layout: resolvedLayout,
      theme: resolvedTheme,
      id: resolvedTheme
    }
  }

  return {
    layout: explicitLayout,
    theme,
    id: theme
  }
}
