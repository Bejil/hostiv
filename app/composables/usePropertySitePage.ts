import type { PropertySiteRecord } from "../types/property-site"

export async function usePropertySitePage() {
  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data: site, error } = await useAsyncData(
    () => `property-site-${slug.value}`,
    () => $fetch<PropertySiteRecord>(`/api/sites/${slug.value}`)
  )

  if (error.value?.statusCode === 404 || !site.value) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ce site n’existe pas ou n’est pas encore publié."
    })
  }

  return {
    site: site.value,
    slug
  }
}
