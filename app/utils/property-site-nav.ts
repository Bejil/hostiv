import type { HostivLocale } from "../types/hostiv-locale"
import { getSiteNavLinks, type SiteNavLink } from "../data/site-ui"

export type SiteNavSectionVisibility = {
  resume: boolean
  espaces: boolean
  quartier: boolean
  tarifs: boolean
  equipements: boolean
  avis: boolean
  reglement: boolean
  contact: boolean
}

const NAV_SECTION_BY_HREF: Record<string, keyof SiteNavSectionVisibility> = {
  "#resume": "resume",
  "#espaces": "espaces",
  "#quartier": "quartier",
  "#tarifs": "tarifs",
  "#equipements": "equipements",
  "#avis": "avis",
  "#reglement": "reglement",
  "#contact": "contact"
}

export function filterSiteNavLinks(
  locale: HostivLocale,
  visibility: SiteNavSectionVisibility
): SiteNavLink[] {
  return getSiteNavLinks(locale).filter((link) => {
    const section = NAV_SECTION_BY_HREF[link.href]

    if (!section) {
      return true
    }

    return visibility[section]
  })
}
