import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import {
  HOSTIV_MARKETING_DEFAULT_ROBOTS,
  HOSTIV_MARKETING_OG_IMAGE_PATH,
  HOSTIV_MARKETING_SITE_NAME,
  buildHostivMarketingHreflangLinks,
  hostivMarketingOgLocale,
  resolveHostivMarketingBaseUrl,
  resolveHostivMarketingCanonicalUrl,
  resolveHostivMarketingOgImageUrl
} from "../utils/hostiv-marketing-seo"
import {
  buildHostivMarketingJsonLd,
  resolveHostivMarketingJsonLdContext
} from "../utils/hostiv-marketing-json-ld"
import { normalizeHostivMarketingPath } from "../data/hostiv-routes"
import { resolveHostivMarketingSeoKeywords } from "../data/hostiv-marketing-seo-keywords"
import { useHostivMarketingHead } from "./useHostivMarketingHead"

export type HostivMarketingSeoOptions = {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string | undefined>
  ogDescription?: MaybeRefOrGetter<string | undefined>
  ogImagePath?: MaybeRefOrGetter<string | undefined>
  keywords?: MaybeRefOrGetter<string | undefined>
  robots?: MaybeRefOrGetter<string | undefined>
  /** Chemin marketing sans query (défaut : route courante). */
  path?: MaybeRefOrGetter<string | undefined>
  /** Désactive le JSON-LD (ex. pages utilitaires noindex). */
  jsonLd?: MaybeRefOrGetter<boolean | undefined>
}

export function useHostivMarketingSeo(options: HostivMarketingSeoOptions) {
  useHostivMarketingHead()

  const route = useRoute()
  const config = useRuntimeConfig()
  const { locale, landing } = useHostivLocale()

  const marketingPath = computed(() => {
    const explicit = toValue(options.path)

    if (explicit) {
      return normalizeHostivMarketingPath(explicit)
    }

    return normalizeHostivMarketingPath(route.path)
  })

  const fallbackOrigin = import.meta.server ? useRequestURL().origin : ""

  const baseUrl = computed(() => {
    const configured = String(config.public.siteUrl ?? "")

    if (configured.trim()) {
      return resolveHostivMarketingBaseUrl(configured)
    }

    if (import.meta.client && typeof window !== "undefined") {
      return window.location.origin
    }

    return fallbackOrigin
  })

  const canonicalUrl = computed(() =>
    resolveHostivMarketingCanonicalUrl(marketingPath.value, baseUrl.value)
  )

  const ogImageUrl = computed(() =>
    resolveHostivMarketingOgImageUrl(
      baseUrl.value,
      toValue(options.ogImagePath) ?? HOSTIV_MARKETING_OG_IMAGE_PATH
    )
  )

  const hreflangLinks = computed(() =>
    buildHostivMarketingHreflangLinks(marketingPath.value, baseUrl.value)
  )

  const resolvedTitle = computed(() => toValue(options.title))
  const resolvedDescription = computed(() => toValue(options.description))
  const resolvedOgTitle = computed(() => toValue(options.ogTitle) ?? resolvedTitle.value)
  const resolvedOgDescription = computed(
    () => toValue(options.ogDescription) ?? resolvedDescription.value
  )
  const resolvedRobots = computed(
    () => toValue(options.robots) ?? HOSTIV_MARKETING_DEFAULT_ROBOTS
  )
  const resolvedKeywords = computed(() => {
    const explicit = toValue(options.keywords)

    if (explicit !== undefined) {
      return explicit
    }

    if (resolvedRobots.value.includes("noindex")) {
      return ""
    }

    return resolveHostivMarketingSeoKeywords(marketingPath.value, locale.value)
  })

  const jsonLdEnabled = computed(() => {
    const explicit = toValue(options.jsonLd)

    if (explicit === false) {
      return false
    }

    return !resolvedRobots.value.includes("noindex")
  })

  const jsonLdGraph = computed(() => {
    if (!jsonLdEnabled.value || !baseUrl.value) {
      return null
    }

    const context = resolveHostivMarketingJsonLdContext(marketingPath.value, locale.value)
    const extras: {
      faqs?: Array<{ question: string; answer: string }>
      pricingPlans?: Array<{
        id: string
        name: string
        price: number
        periodLabel: string
        description: string
      }>
    } = {}

    if (context.kind === "home") {
      extras.faqs = landing.value.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer
      }))
    }

    if (context.kind === "pricing") {
      extras.pricingPlans = landing.value.pricing.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        periodLabel: plan.period,
        description: plan.tagline
      }))
    }

    return buildHostivMarketingJsonLd({
      baseUrl: baseUrl.value,
      path: marketingPath.value,
      locale: locale.value,
      pageTitle: resolvedTitle.value,
      pageDescription: resolvedDescription.value,
      homeLabel: landing.value.seo.breadcrumbHomeLabel,
      context,
      ...extras
    })
  })

  useSeoMeta({
    title: () => resolvedTitle.value,
    description: () => resolvedDescription.value,
    keywords: () => resolvedKeywords.value || undefined,
    robots: () => resolvedRobots.value,
    ogTitle: () => resolvedOgTitle.value,
    ogDescription: () => resolvedOgDescription.value,
    ogType: "website",
    ogLocale: () => hostivMarketingOgLocale(locale.value),
    ogLocaleAlternate: () =>
      locale.value === "en" ? "fr_FR" : "en_GB",
    ogSiteName: HOSTIV_MARKETING_SITE_NAME,
    ogImage: () => ogImageUrl.value,
    ogUrl: () => canonicalUrl.value || undefined,
    twitterCard: "summary_large_image",
    twitterTitle: () => resolvedOgTitle.value,
    twitterDescription: () => resolvedOgDescription.value,
    twitterImage: () => ogImageUrl.value
  })

  useHead({
    link: computed(() => {
      const links: Array<{ rel: string; href: string; hreflang?: string }> = []

      if (canonicalUrl.value) {
        links.push({ rel: "canonical", href: canonicalUrl.value })
      }

      for (const alternate of hreflangLinks.value) {
        links.push(alternate)
      }

      return links
    }),
    script: computed(() => {
      if (!jsonLdGraph.value) {
        return []
      }

      return [
        {
          key: "hostiv-marketing-json-ld",
          type: "application/ld+json",
          innerHTML: JSON.stringify(jsonLdGraph.value)
        }
      ]
    })
  })
}
