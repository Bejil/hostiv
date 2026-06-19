import type { HostivLocale } from "../types/hostiv-locale"
import { hostivLegalEditor } from "../data/hostiv-legal-editor"
import {
  HOSTIV_HOME_PATHS,
  HOSTIV_PRICING_PATHS,
  HOSTIV_RESOURCES_PATHS,
  HOSTIV_STATIC_PATHS,
  getHostivHomePath,
  getHostivResourceArticleIdFromPath,
  isHostivResourcesIndexPath,
  normalizeHostivMarketingPath
} from "../data/hostiv-routes"
import { getHostivResourceArticle } from "../data/hostivResources"
import { getHostivStaticPage } from "../data/hostivStaticPages"
import type { HostivStaticPageId } from "../data/hostiv-static-page.types"
import {
  HOSTIV_MARKETING_SITE_NAME,
  resolveHostivMarketingAbsoluteUrl
} from "./hostiv-marketing-seo"

const STATIC_PATH_TO_PAGE_ID = new Map<string, HostivStaticPageId>()

for (const [pageId, paths] of Object.entries(HOSTIV_STATIC_PATHS) as Array<
  [HostivStaticPageId, Record<HostivLocale, string>]
>) {
  STATIC_PATH_TO_PAGE_ID.set(paths.fr, pageId)
  STATIC_PATH_TO_PAGE_ID.set(paths.en, pageId)
}

export type HostivMarketingFaqItem = {
  question: string
  answer: string
}

export type HostivMarketingPricingPlanItem = {
  id: string
  name: string
  price: number
  periodLabel: string
  description: string
}

export type HostivMarketingJsonLdPageKind =
  | "home"
  | "pricing"
  | "static"
  | "resources"
  | "resource-article"
  | "unknown"

export type HostivMarketingJsonLdContext = {
  kind: HostivMarketingJsonLdPageKind
  breadcrumbLabel?: string
  breadcrumbParentLabel?: string
  breadcrumbParentPath?: string
  articlePublishedAt?: string
  articleModifiedAt?: string
}

export function resolveHostivMarketingJsonLdContext(
  path: string,
  locale: HostivLocale
): HostivMarketingJsonLdContext {
  const normalized = normalizeHostivMarketingPath(path)

  if (normalized === HOSTIV_HOME_PATHS.fr || normalized === HOSTIV_HOME_PATHS.en) {
    return { kind: "home" }
  }

  if (normalized === HOSTIV_PRICING_PATHS.fr || normalized === HOSTIV_PRICING_PATHS.en) {
    return { kind: "pricing", breadcrumbLabel: locale === "en" ? "Pricing" : "Tarifs" }
  }

  if (isHostivResourcesIndexPath(normalized)) {
    return {
      kind: "resources",
      breadcrumbLabel: locale === "en" ? "Resources" : "Ressources"
    }
  }

  const resourceArticleId = getHostivResourceArticleIdFromPath(normalized)

  if (resourceArticleId) {
    const article = getHostivResourceArticle(resourceArticleId, locale)

    return {
      kind: "resource-article",
      breadcrumbLabel: article.title,
      breadcrumbParentLabel: locale === "en" ? "Resources" : "Ressources",
      breadcrumbParentPath: HOSTIV_RESOURCES_PATHS[locale],
      articlePublishedAt: article.publishedAt,
      articleModifiedAt: article.publishedAt
    }
  }

  const pageId = STATIC_PATH_TO_PAGE_ID.get(normalized)

  if (pageId) {
    return {
      kind: "static",
      breadcrumbLabel: getHostivStaticPage(pageId, locale).title
    }
  }

  return { kind: "unknown" }
}

export type HostivMarketingJsonLdInput = {
  baseUrl: string
  path: string
  locale: HostivLocale
  pageTitle: string
  pageDescription: string
  homeLabel: string
  context: HostivMarketingJsonLdContext
  faqs?: HostivMarketingFaqItem[]
  pricingPlans?: HostivMarketingPricingPlanItem[]
}

function buildOrganizationNode(baseUrl: string) {
  const orgId = `${baseUrl}/#organization`
  const { email, tradeName, fullName } = hostivLegalEditor

  return {
    "@type": "Organization",
    "@id": orgId,
    name: tradeName,
    legalName: fullName,
    url: resolveHostivMarketingAbsoluteUrl(baseUrl, "/"),
    logo: resolveHostivMarketingAbsoluteUrl(baseUrl, "/hostiv/logo-mark.svg"),
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "2 chemin du bord de l'eau",
      postalCode: "78300",
      addressLocality: "Poissy",
      addressCountry: "FR"
    }
  }
}

function buildFaqPageNode(pageUrl: string, faqs: HostivMarketingFaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  }
}

function buildPricingProductNodes(
  baseUrl: string,
  pageUrl: string,
  plans: HostivMarketingPricingPlanItem[]
) {
  return plans.map((plan) => ({
    "@type": "Product",
    "@id": `${pageUrl}#product-${plan.id}`,
    name: `Hostiv ${plan.name}`,
    description: plan.description,
    brand: {
      "@type": "Brand",
      name: HOSTIV_MARKETING_SITE_NAME
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      price: plan.price,
      priceCurrency: "EUR",
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: "https://schema.org/InStock",
      description: `${plan.price} EUR / ${plan.periodLabel}`
    }
  }))
}

function buildBreadcrumbNode(
  pageUrl: string,
  homeLabel: string,
  homeUrl: string,
  crumbs: Array<{ name: string; item: string }>
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item
    }))
  }
}

export function buildHostivMarketingJsonLd(input: HostivMarketingJsonLdInput) {
  if (!input.baseUrl || input.context.kind === "unknown") {
    return null
  }

  const pageUrl = resolveHostivMarketingAbsoluteUrl(input.baseUrl, input.path)
  const orgId = `${input.baseUrl}/#organization`
  const websiteId = `${input.baseUrl}/#website`
  const pageNodeId = `${pageUrl}#webpage`
  const homeUrl = resolveHostivMarketingAbsoluteUrl(input.baseUrl, getHostivHomePath(input.locale))
  const inLanguage = input.locale === "en" ? "en-GB" : "fr-FR"
  const graph: Record<string, unknown>[] = [buildOrganizationNode(input.baseUrl)]

  if (input.context.kind === "home") {
    graph.push({
      "@type": "WebSite",
      "@id": websiteId,
      url: resolveHostivMarketingAbsoluteUrl(input.baseUrl, "/"),
      name: HOSTIV_MARKETING_SITE_NAME,
      description: input.pageDescription,
      publisher: { "@id": orgId },
      inLanguage: ["fr-FR", "en-GB"]
    })
  }

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": pageNodeId,
    url: pageUrl,
    name: input.pageTitle,
    description: input.pageDescription,
    inLanguage,
    isPartOf:
      input.context.kind === "home"
        ? { "@id": websiteId }
        : {
            "@type": "WebSite",
            name: HOSTIV_MARKETING_SITE_NAME,
            url: resolveHostivMarketingAbsoluteUrl(input.baseUrl, "/")
          }
  }

  if (input.context.kind === "home") {
    webPage.about = { "@id": orgId }
  }

  if (input.context.kind === "resource-article") {
    webPage["@type"] = "Article"
    webPage.headline = input.pageTitle
    webPage.datePublished = input.context.articlePublishedAt
    webPage.dateModified = input.context.articleModifiedAt ?? input.context.articlePublishedAt
    webPage.author = { "@id": orgId }
    webPage.publisher = { "@id": orgId }
  }

  graph.push(webPage)

  if (input.context.kind === "home" && input.faqs?.length) {
    graph.push(buildFaqPageNode(pageUrl, input.faqs))
  }

  if (input.context.kind === "pricing" && input.pricingPlans?.length) {
    graph.push(...buildPricingProductNodes(input.baseUrl, pageUrl, input.pricingPlans))
  }

  if (input.context.kind !== "home" && input.context.breadcrumbLabel) {
    const crumbs = [{ name: input.homeLabel, item: homeUrl }]

    if (input.context.breadcrumbParentLabel && input.context.breadcrumbParentPath) {
      crumbs.push({
        name: input.context.breadcrumbParentLabel,
        item: resolveHostivMarketingAbsoluteUrl(input.baseUrl, input.context.breadcrumbParentPath)
      })
    }

    crumbs.push({ name: input.context.breadcrumbLabel, item: pageUrl })

    graph.push(buildBreadcrumbNode(pageUrl, input.homeLabel, homeUrl, crumbs))
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  }
}
