import { getHostivLanding } from "../data/hostivLanding"
import type { PropertySiteRecord } from "../types/property-site"
import { useLocalizedPropertySite } from "./useLocalizedPropertySite"

export async function usePropertySitePage() {
  const route = useRoute()
  const { locale } = useHostivLocale()
  const slug = computed(() => String(route.params.slug))

  const { data: rawSite, error } = await useAsyncData(
    () => `property-site-${slug.value}`,
    () => $fetch<PropertySiteRecord>(`/api/sites/${slug.value}`),
    { watch: [slug] }
  )

  if (error.value?.statusCode === 404 || !rawSite.value) {
    const notFound = getHostivLanding(locale.value).notFound

    throw createError({
      statusCode: 404,
      statusMessage: notFound.messages.site,
      data: { notFoundKind: "site" as const }
    })
  }

  const site = useLocalizedPropertySite(rawSite)

  return {
    site,
    slug
  }
}
