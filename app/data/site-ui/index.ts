import type { HostivLocale } from "../../types/hostiv-locale"
import { siteUiLabelsEn } from "./labels.en"
import { siteUiLabelsFr } from "./labels.fr"

export type SiteNavLink = {
  href: string
  label: string
}

export function getSiteUi(locale: HostivLocale = "fr") {
  return locale === "en" ? siteUiLabelsEn : siteUiLabelsFr
}

export function getSiteNavLinks(locale: HostivLocale = "fr"): SiteNavLink[] {
  const nav = getSiteUi(locale).nav

  return [
    { href: "#resume", label: nav.about },
    { href: "#espaces", label: nav.spaces },
    { href: "#quartier", label: nav.neighborhood },
    { href: "#tarifs", label: nav.pricing },
    { href: "#equipements", label: nav.amenities },
    { href: "#avis", label: nav.reviews },
    { href: "#reglement", label: nav.rules },
    { href: "#contact", label: nav.contact }
  ]
}
