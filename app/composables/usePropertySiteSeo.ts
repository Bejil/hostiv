import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import type { PropertySiteRecord } from "../types/property-site"
import { faviconMimeType } from "../utils/favicon-mime"

export function usePropertySiteSeo(options: {
  site: MaybeRefOrGetter<PropertySiteRecord>
  propertyAsset: (path: string) => string
  slug: MaybeRefOrGetter<string>
}) {
  const config = useRuntimeConfig()

  const site = computed(() => toValue(options.site))
  const slug = computed(() => toValue(options.slug))

  const ogTitle = computed(() => site.value.seo_og_title.trim() || site.value.seo_title)
  const ogDescription = computed(
    () => site.value.seo_og_description.trim() || site.value.seo_description
  )

  const ogImagePath = computed(
    () => site.value.seo_og_image_path.trim() || site.value.hero_image_path
  )

  const ogImageUrl = computed(() => {
    const href = options.propertyAsset(ogImagePath.value)

    if (!href || href.startsWith("data:")) {
      return href || undefined
    }

    try {
      return new URL(href, typeof window !== "undefined" ? window.location.origin : undefined).href
    } catch {
      return href
    }
  })

  const robots = computed(() => {
    if (!site.value.published || site.value.seo_noindex) {
      return "noindex, nofollow"
    }

    return "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  })

  const canonicalUrl = computed(() => {
    const configured = String(config.public.siteUrl ?? "").replace(/\/$/, "")

    if (configured) {
      return `${configured}/${slug.value}`
    }

    if (typeof window !== "undefined") {
      const { origin, pathname } = window.location
      return `${origin}${pathname}`
    }

    return ""
  })

  const keywords = computed(() => {
    const raw = site.value.seo_keywords.trim()

    return raw.length ? raw : undefined
  })

  useSeoMeta({
    title: () => site.value.seo_title,
    description: () => site.value.seo_description,
    keywords,
    robots,
    ogTitle: () => ogTitle.value,
    ogDescription: () => ogDescription.value,
    ogType: "website",
    ogLocale: "fr_FR",
    ogSiteName: () => site.value.brand_name,
    ogImage: () => ogImageUrl.value,
    twitterCard: () => site.value.seo_twitter_card,
    twitterTitle: () => ogTitle.value,
    twitterDescription: () => ogDescription.value,
    twitterImage: () => ogImageUrl.value
  })

  useHead({
    htmlAttrs: {
      lang: "fr"
    },
    link: computed(() => {
      const links: Array<{ rel: string; href: string; type?: string }> = []

      if (canonicalUrl.value) {
        links.push({ rel: "canonical", href: canonicalUrl.value })
      }

      const faviconHref = options.propertyAsset(site.value.logo_path.trim())

      if (faviconHref) {
        links.push({
          rel: "icon",
          href: faviconHref,
          type: faviconMimeType(site.value.logo_path)
        })
      }

      return links
    })
  })
}
