import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import type { PropertySiteRecord } from "../types/property-site"
import { derivePropertySeo } from "../utils/derive-property-seo"
import { resolveSiteSeoKeywords } from "../utils/seo-keywords"
import { faviconMimeType } from "../utils/favicon-mime"
import { buildPropertySiteJsonLd } from "../utils/property-site-json-ld"
import {
  detectPropertySiteLocaleFromPath,
  getPropertySitePath,
  propertySiteHasEnglishLocale
} from "../utils/property-site-routes"

export function usePropertySiteSeo(options: {
  site: MaybeRefOrGetter<PropertySiteRecord>
  propertyAsset: (path: string) => string
  slug: MaybeRefOrGetter<string>
}) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const site = computed(() => toValue(options.site))
  const slug = computed(() => toValue(options.slug))
  const { locale } = useHostivLocale()

  const derivedSeo = computed(() => derivePropertySeo(site.value))

  const ogTitle = computed(() => derivedSeo.value.seo_og_title)
  const ogDescription = computed(() => derivedSeo.value.seo_og_description)

  const ogImagePath = computed(() => derivedSeo.value.seo_og_image_path)

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

  const baseUrl = computed(() => {
    const configured = String(config.public.siteUrl ?? "").replace(/\/$/, "")

    if (configured) {
      return configured
    }

    if (typeof window !== "undefined") {
      return window.location.origin
    }

    if (import.meta.server) {
      return useRequestURL().origin
    }

    return ""
  })

  const pageLocale = computed(() => detectPropertySiteLocaleFromPath(route.path))

  const canonicalUrl = computed(() => {
    if (!baseUrl.value) {
      return ""
    }

    return `${baseUrl.value}${getPropertySitePath(slug.value, pageLocale.value)}`
  })

  const hreflangLinks = computed(() => {
    if (!baseUrl.value || !site.value.published || site.value.seo_noindex) {
      return [] as Array<{ rel: string; hreflang: string; href: string }>
    }

    const frHref = `${baseUrl.value}${getPropertySitePath(slug.value, "fr")}`
    const links: Array<{ rel: string; hreflang: string; href: string }> = [
      { rel: "alternate", hreflang: "fr", href: frHref },
      { rel: "alternate", hreflang: "x-default", href: frHref }
    ]

    if (propertySiteHasEnglishLocale(site.value)) {
      links.splice(1, 0, {
        rel: "alternate",
        hreflang: "en",
        href: `${baseUrl.value}${getPropertySitePath(slug.value, "en")}`
      })
    }

    return links
  })

  const keywords = computed(() => resolveSiteSeoKeywords(site.value, locale.value))

  const jsonLdGraph = computed(() =>
    buildPropertySiteJsonLd({
      site: site.value,
      slug: slug.value,
      pageUrl: canonicalUrl.value,
      imageUrl: ogImageUrl.value,
      locale: pageLocale.value
    })
  )

  useSeoMeta({
    title: () => derivedSeo.value.seo_title,
    description: () => derivedSeo.value.seo_description,
    keywords,
    robots,
    ogTitle: () => ogTitle.value,
    ogDescription: () => ogDescription.value,
    ogType: "website",
    ogLocale: () => (pageLocale.value === "en" ? "en_GB" : "fr_FR"),
    ogSiteName: () => site.value.brand_name,
    ogImage: () => ogImageUrl.value,
    ogUrl: () => canonicalUrl.value || undefined,
    twitterCard: () => site.value.seo_twitter_card,
    twitterTitle: () => ogTitle.value,
    twitterDescription: () => ogDescription.value,
    twitterImage: () => ogImageUrl.value
  })

  useHead({
    htmlAttrs: {
      lang: () => pageLocale.value
    },
    link: computed(() => {
      const links: Array<{ rel: string; href: string; type?: string; hreflang?: string }> = []

      if (canonicalUrl.value) {
        links.push({ rel: "canonical", href: canonicalUrl.value })
      }

      for (const alternate of hreflangLinks.value) {
        links.push(alternate)
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
    }),
    script: computed(() => {
      if (!jsonLdGraph.value) {
        return []
      }

      return [
        {
          key: `property-site-json-ld-${slug.value}`,
          type: "application/ld+json",
          innerHTML: JSON.stringify(jsonLdGraph.value)
        }
      ]
    })
  })
}
