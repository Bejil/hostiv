import type { HostivLocale } from "../types/hostiv-locale"
import type { HostivResourceArticleId } from "./hostiv-resources.types"
import {
  getHostivResourceArticle,
  getHostivResourceArticlePath,
  type HostivResourceArticle
} from "./hostivResources"

export type HostivResourceClusterId =
  | "direct-booking"
  | "setup"
  | "payments"
  | "conversion"

export type HostivResourceCluster = {
  id: HostivResourceClusterId
  title: Record<HostivLocale, string>
  description: Record<HostivLocale, string>
  articleIds: HostivResourceArticleId[]
}

export const HOSTIV_RESOURCE_CLUSTERS: HostivResourceCluster[] = [
  {
    id: "direct-booking",
    title: {
      fr: "Réservation directe",
      en: "Direct booking"
    },
    description: {
      fr: "Passer au direct, promouvoir votre site et recevoir la première réservation.",
      en: "Go direct, promote your site and land your first booking."
    },
    articleIds: ["passer-au-direct", "promouvoir-site-direct", "premiere-reservation-directe"]
  },
  {
    id: "setup",
    title: {
      fr: "Mise en route",
      en: "Getting started"
    },
    description: {
      fr: "Template, fiche logement et synchronisation des calendriers.",
      en: "Template, listing page and calendar sync."
    },
    articleIds: ["choisir-template-site", "optimiser-fiche-logement", "sync-calendrier-ical"]
  },
  {
    id: "payments",
    title: {
      fr: "Paiements & facturation",
      en: "Payments & invoicing"
    },
    description: {
      fr: "Stripe Connect, factures PDF et forfaits Hostiv.",
      en: "Stripe Connect, PDF invoices and Hostiv plans."
    },
    articleIds: ["configurer-stripe-connect", "factures-pdf", "comparer-starter-pro"]
  },
  {
    id: "conversion",
    title: {
      fr: "Conversion & accueil",
      en: "Conversion & guest experience"
    },
    description: {
      fr: "Convertir les visiteurs et soigner l’accueil des voyageurs.",
      en: "Convert visitors and polish the guest welcome."
    },
    articleIds: ["convertir-visiteurs", "guide-accueil-voyageurs", "referencement-site-direct"]
  }
]

/** Guides mis en avant depuis la landing (index feature / step). */
export const HOSTIV_LANDING_FEATURE_GUIDES: HostivResourceArticleId[] = [
  "passer-au-direct",
  "sync-calendrier-ical",
  "configurer-stripe-connect"
]

export const HOSTIV_LANDING_STEP_GUIDES: HostivResourceArticleId[] = [
  "choisir-template-site",
  "sync-calendrier-ical",
  "premiere-reservation-directe"
]

export const HOSTIV_RESOURCE_RELATED: Record<HostivResourceArticleId, HostivResourceArticleId[]> = {
  "passer-au-direct": ["promouvoir-site-direct", "configurer-stripe-connect", "sync-calendrier-ical"],
  "sync-calendrier-ical": ["passer-au-direct", "premiere-reservation-directe", "promouvoir-site-direct"],
  "promouvoir-site-direct": ["passer-au-direct", "convertir-visiteurs", "optimiser-fiche-logement"],
  "configurer-stripe-connect": ["premiere-reservation-directe", "factures-pdf", "comparer-starter-pro"],
  "choisir-template-site": ["optimiser-fiche-logement", "convertir-visiteurs", "passer-au-direct"],
  "optimiser-fiche-logement": ["choisir-template-site", "convertir-visiteurs", "promouvoir-site-direct"],
  "convertir-visiteurs": ["optimiser-fiche-logement", "promouvoir-site-direct", "guide-accueil-voyageurs"],
  "comparer-starter-pro": ["configurer-stripe-connect", "factures-pdf", "guide-accueil-voyageurs"],
  "premiere-reservation-directe": ["configurer-stripe-connect", "sync-calendrier-ical", "promouvoir-site-direct"],
  "factures-pdf": ["configurer-stripe-connect", "comparer-starter-pro", "premiere-reservation-directe"],
  "guide-accueil-voyageurs": ["convertir-visiteurs", "optimiser-fiche-logement", "premiere-reservation-directe"],
  "referencement-site-direct": [
    "optimiser-fiche-logement",
    "promouvoir-site-direct",
    "convertir-visiteurs"
  ]
}

/** Liens FAQ → guide détaillé (clé = question FR ou EN). */
export const HOSTIV_FAQ_ARTICLE_BY_QUESTION: Partial<
  Record<HostivLocale, Record<string, HostivResourceArticleId>>
> = {
  fr: {
    "Puis-je garder mon annonce sur Airbnb ou Booking ?": "sync-calendrier-ical",
    "Combien de temps pour mettre en ligne mon site ?": "choisir-template-site",
    "Puis-je personnaliser le design de mon site ?": "choisir-template-site",
    "Quelle différence entre Starter et Pro ?": "comparer-starter-pro",
    "Comment fonctionne le paiement en ligne ?": "configurer-stripe-connect",
    "Dois-je créer un compte Stripe ?": "configurer-stripe-connect",
    "Comment synchroniser mon calendrier ?": "sync-calendrier-ical",
    "Comment éviter une double réservation ?": "sync-calendrier-ical"
  },
  en: {
    "Can I keep my listing on Airbnb or Booking?": "sync-calendrier-ical",
    "How long does it take to publish my site?": "choisir-template-site",
    "Can I customize my site design?": "choisir-template-site",
    "What is the difference between Starter and Pro?": "comparer-starter-pro",
    "How does online payment work?": "configurer-stripe-connect",
    "Do I need to create a Stripe account?": "configurer-stripe-connect",
    "How do I sync my calendar?": "sync-calendrier-ical",
    "How do I avoid double bookings?": "sync-calendrier-ical"
  }
}

export function getHostivResourceCluster(id: HostivResourceClusterId) {
  return HOSTIV_RESOURCE_CLUSTERS.find((cluster) => cluster.id === id) ?? null
}

export function listHostivResourceClusters(locale: HostivLocale) {
  return HOSTIV_RESOURCE_CLUSTERS.map((cluster) => ({
    id: cluster.id,
    title: cluster.title[locale],
    description: cluster.description[locale],
    articles: cluster.articleIds
      .map((articleId) => getHostivResourceArticle(articleId, locale))
      .filter((article): article is HostivResourceArticle => Boolean(article))
  }))
}

export function getRelatedHostivResourceArticles(
  articleId: HostivResourceArticleId,
  locale: HostivLocale,
  limit = 3
) {
  const relatedIds = HOSTIV_RESOURCE_RELATED[articleId] ?? []

  return relatedIds
    .slice(0, limit)
    .map((id) => getHostivResourceArticle(id, locale))
    .filter((article): article is HostivResourceArticle => Boolean(article))
}

export function resolveHostivFaqArticleId(question: string, locale: HostivLocale) {
  return HOSTIV_FAQ_ARTICLE_BY_QUESTION[locale]?.[question] ?? null
}

export function getHostivResourceGuideLinkLabel(locale: HostivLocale) {
  return locale === "en" ? "Read the guide" : "Lire le guide"
}

export function getHostivRelatedResourcesTitle(locale: HostivLocale) {
  return locale === "en" ? "Related guides" : "Guides associés"
}

export function getHostivResourceInlineLinksTitle(locale: HostivLocale) {
  return locale === "en" ? "Continue reading" : "Pour aller plus loin"
}

export function buildHostivResourceGuidePath(articleId: HostivResourceArticleId, locale: HostivLocale) {
  return getHostivResourceArticlePath(articleId, locale)
}
