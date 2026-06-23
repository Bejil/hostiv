import { getHostivLanding } from "../data/hostivLanding"
import type { PropertySiteRecord } from "../types/property-site"
import { applySiteContentLocale } from "../utils/site-content-locale"

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

  const site = computed(() => applySiteContentLocale(rawSite.value!, locale.value))

  return {
    site,
    slug
  }
}
