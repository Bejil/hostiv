import type { HostivLocale } from "../types/hostiv-locale"
import type { HostivResourceArticle, HostivResourceArticleId } from "./hostiv-resources.types"
import { hostivResourceArticlesExtra as hostivResourceArticlesExtraEn } from "./hostiv-resource-articles-extra.en"
import { hostivResourceArticlesExtra as hostivResourceArticlesExtraFr } from "./hostiv-resource-articles-extra.fr"
import {
  hostivResourceArticles as hostivResourceArticlesEn,
  hostivResourcesIndex as hostivResourcesIndexEn
} from "./hostivResources.en"
import {
  hostivResourceArticles as hostivResourceArticlesFr,
  hostivResourcesIndex as hostivResourcesIndexFr
} from "./hostivResources.fr"

export type {
  HostivResourceArticle,
  HostivResourceArticleId,
  HostivResourcesIndexContent
} from "./hostiv-resources.types"

export const HOSTIV_RESOURCE_ARTICLE_PATHS: Record<
  HostivResourceArticleId,
  Record<HostivLocale, string>
> = {
  "passer-au-direct": {
    fr: "/ressources/passer-au-direct",
    en: "/en/resources/go-direct-booking"
  },
  "sync-calendrier-ical": {
    fr: "/ressources/synchroniser-calendrier-ical",
    en: "/en/resources/sync-ical-calendar"
  },
  "promouvoir-site-direct": {
    fr: "/ressources/promouvoir-son-site-direct",
    en: "/en/resources/promote-direct-website"
  },
  "configurer-stripe-connect": {
    fr: "/ressources/configurer-stripe-connect",
    en: "/en/resources/setup-stripe-connect"
  },
  "choisir-template-site": {
    fr: "/ressources/choisir-un-template",
    en: "/en/resources/choose-a-template"
  },
  "optimiser-fiche-logement": {
    fr: "/ressources/optimiser-fiche-logement",
    en: "/en/resources/optimize-listing-page"
  },
  "convertir-visiteurs": {
    fr: "/ressources/convertir-les-visiteurs",
    en: "/en/resources/convert-site-visitors"
  },
  "comparer-starter-pro": {
    fr: "/ressources/starter-vs-pro",
    en: "/en/resources/starter-vs-pro"
  },
  "premiere-reservation-directe": {
    fr: "/ressources/premiere-reservation-directe",
    en: "/en/resources/first-direct-booking"
  },
  "factures-pdf": {
    fr: "/ressources/factures-reservations-pdf",
    en: "/en/resources/booking-invoice-pdf"
  },
  "guide-accueil-voyageurs": {
    fr: "/ressources/guide-accueil-voyageurs",
    en: "/en/resources/welcome-guide-for-guests"
  },
  "referencement-site-direct": {
    fr: "/ressources/referencement-site-direct",
    en: "/en/resources/direct-site-seo"
  }
}

function mergeArticles(
  base: Record<string, HostivResourceArticle>,
  extra: Record<string, HostivResourceArticle>
) {
  return { ...base, ...extra } as Record<HostivResourceArticleId, HostivResourceArticle>
}

const bundles = {
  fr: {
    index: hostivResourcesIndexFr,
    articles: mergeArticles(hostivResourceArticlesFr, hostivResourceArticlesExtraFr)
  },
  en: {
    index: hostivResourcesIndexEn,
    articles: mergeArticles(hostivResourceArticlesEn, hostivResourceArticlesExtraEn)
  }
} as const

const ARTICLE_PATH_TO_ID = new Map<string, HostivResourceArticleId>()

for (const [articleId, paths] of Object.entries(HOSTIV_RESOURCE_ARTICLE_PATHS) as Array<
  [HostivResourceArticleId, Record<HostivLocale, string>]
>) {
  ARTICLE_PATH_TO_ID.set(paths.fr, articleId)
  ARTICLE_PATH_TO_ID.set(paths.en, articleId)
}

export function getHostivResourcesIndex(locale: HostivLocale) {
  return bundles[locale].index
}

export function getHostivResourceArticle(id: HostivResourceArticleId, locale: HostivLocale) {
  return bundles[locale].articles[id]
}

export function getHostivResourceArticleByPath(path: string, locale: HostivLocale) {
  const articleId = ARTICLE_PATH_TO_ID.get(path)

  if (!articleId) {
    return null
  }

  return getHostivResourceArticle(articleId, locale)
}

export function getHostivResourceArticlePath(id: HostivResourceArticleId, locale: HostivLocale) {
  return HOSTIV_RESOURCE_ARTICLE_PATHS[id][locale]
}

export function listHostivResourceArticles(locale: HostivLocale): HostivResourceArticle[] {
  return Object.values(bundles[locale].articles).sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt)
  )
}

export function getHostivResourceSitemapPaths(): string[] {
  return Object.values(HOSTIV_RESOURCE_ARTICLE_PATHS).flatMap((paths) => [paths.fr, paths.en])
}
