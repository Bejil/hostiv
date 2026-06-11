import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import type { PropertySiteRecord } from "../types/property-site"
import { applySiteContentLocale } from "../utils/site-content-locale"

/** Applique `copy_en` / listes `_en` selon la langue visiteur (site public). */
export function useLocalizedPropertySite(
  rawSite: MaybeRefOrGetter<PropertySiteRecord | null | undefined>
) {
  const { locale } = useHostivLocale()

  return computed(() => {
    const site = toValue(rawSite)

    if (!site) {
      return null
    }

    return applySiteContentLocale(site, locale.value)
  })
}
