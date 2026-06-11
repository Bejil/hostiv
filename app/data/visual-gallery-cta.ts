import { getSiteUiLabels } from "./site-ui-labels"
import type { HostivLocale } from "../types/hostiv-locale"

/** Textes fixes de la carte « Voir la galerie » (repli si champs admin vides). */
export const VISUAL_GALLERY_CTA = getSiteUiLabels("fr").visualGalleryCta

export function getVisualGalleryCtaFallback(locale: HostivLocale = "fr") {
  return getSiteUiLabels(locale).visualGalleryCta
}
