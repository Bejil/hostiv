import type { HostivLocale } from "../types/hostiv-locale"
import {
  HOSTIV_HOME_PATHS,
  HOSTIV_PRICING_PATHS,
  HOSTIV_RESOURCES_PATHS,
  HOSTIV_STATIC_PATHS,
  getHostivResourceArticleIdFromPath,
  isHostivResourcesIndexPath,
  normalizeHostivMarketingPath
} from "./hostiv-routes"
import type { HostivResourceArticleId } from "./hostiv-resources.types"

const FR_HOME_KEYWORDS = [
  "générateur site location saisonnière",
  "générateur site location vacances",
  "créer site location saisonnière",
  "site web location vacances",
  "site location courte durée",
  "réservation directe",
  "location saisonnière",
  "location vacances",
  "hôte Airbnb",
  "sans commission",
  "calendrier iCal",
  "paiement Stripe"
].join(", ")

const EN_HOME_KEYWORDS = [
  "vacation rental website generator",
  "holiday rental site builder",
  "create rental website",
  "short-term rental site",
  "seasonal rental website",
  "direct booking website",
  "Airbnb host website",
  "commission-free rental site",
  "iCal calendar sync",
  "Stripe payments"
].join(", ")

const FR_PRICING_KEYWORDS = [
  "tarif site location saisonnière",
  "prix générateur site location vacances",
  "abonnement site location",
  "Hostiv tarifs",
  "site réservation directe",
  "location saisonnière hôte"
].join(", ")

const EN_PRICING_KEYWORDS = [
  "vacation rental website pricing",
  "holiday rental site subscription",
  "rental website builder cost",
  "Hostiv pricing",
  "direct booking site plans"
].join(", ")

const FR_RESOURCES_KEYWORDS = [
  "guide site location saisonnière",
  "location vacances directe",
  "synchroniser calendrier Airbnb",
  "promouvoir site location",
  "réservation directe hôte"
].join(", ")

const EN_RESOURCES_KEYWORDS = [
  "vacation rental website guide",
  "direct booking resources",
  "iCal sync guide",
  "promote rental website",
  "holiday rental host tips"
].join(", ")

const FR_ABOUT_KEYWORDS = [
  "générateur site location",
  "Hostiv",
  "réservation directe",
  "location saisonnière",
  "outil hôte"
].join(", ")

const EN_ABOUT_KEYWORDS = [
  "vacation rental website generator",
  "Hostiv",
  "direct booking",
  "short-term rental hosts",
  "rental website tool"
].join(", ")

const FR_DEFAULT_KEYWORDS = [
  "Hostiv",
  "site location saisonnière",
  "site location vacances",
  "réservation directe"
].join(", ")

const EN_DEFAULT_KEYWORDS = [
  "Hostiv",
  "vacation rental website",
  "holiday rental site",
  "direct booking"
].join(", ")

const FR_ARTICLE_KEYWORDS: Partial<Record<HostivResourceArticleId, string>> = {
  "passer-au-direct":
    "passer réservation directe, site location saisonnière, OTA Airbnb Booking, sans commission",
  "sync-calendrier-ical":
    "synchroniser calendrier location saisonnière, iCal Airbnb Booking, éviter double réservation",
  "promouvoir-site-direct":
    "promouvoir site location vacances, lien réservation directe, marketing hôte",
  "configurer-stripe-connect":
    "Stripe Connect location saisonnière, paiement réservation directe, encaisser loyers vacances",
  "choisir-template-site":
    "template site location saisonnière, design site location vacances, générateur site hôte",
  "optimiser-fiche-logement":
    "optimiser annonce location saisonnière, photos location vacances, fiche logement direct",
  "convertir-visiteurs":
    "convertir visiteurs site location, réservation directe vacances, taux conversion hôte",
  "comparer-starter-pro":
    "forfait site location saisonnière, Hostiv Starter Pro, abonnement site vacances",
  "premiere-reservation-directe":
    "première réservation directe, lancer site location saisonnière, hôte vacances",
  "factures-pdf": "facture location saisonnière PDF, réservation directe facturation",
  "guide-accueil-voyageurs":
    "guide accueil location vacances, livret accueil saisonnière, PDF voyageurs"
}

const EN_ARTICLE_KEYWORDS: Partial<Record<HostivResourceArticleId, string>> = {
  "passer-au-direct":
    "go direct booking, vacation rental website, OTA Airbnb Booking, commission-free",
  "sync-calendrier-ical":
    "iCal sync vacation rental, Airbnb Booking calendar, avoid double booking",
  "promouvoir-site-direct":
    "promote rental website, direct booking link, host marketing",
  "configurer-stripe-connect":
    "Stripe Connect vacation rental, direct booking payments, host payouts",
  "choisir-template-site":
    "vacation rental website template, holiday rental site design, site builder",
  "optimiser-fiche-logement":
    "optimize rental listing, vacation rental photos, direct booking page",
  "convertir-visiteurs":
    "convert rental website visitors, direct booking conversion, host tips",
  "comparer-starter-pro":
    "vacation rental website plans, Hostiv Starter Pro, subscription pricing",
  "premiere-reservation-directe":
    "first direct booking, launch rental website, holiday rental host",
  "factures-pdf": "vacation rental invoice PDF, direct booking billing",
  "guide-accueil-voyageurs":
    "guest welcome guide, vacation rental welcome book, host PDF"
}

export function resolveHostivMarketingSeoKeywords(
  path: string,
  locale: HostivLocale
): string {
  const normalized = normalizeHostivMarketingPath(path)

  if (normalized === HOSTIV_HOME_PATHS.fr || normalized === HOSTIV_HOME_PATHS.en) {
    return locale === "en" ? EN_HOME_KEYWORDS : FR_HOME_KEYWORDS
  }

  if (normalized === HOSTIV_PRICING_PATHS.fr || normalized === HOSTIV_PRICING_PATHS.en) {
    return locale === "en" ? EN_PRICING_KEYWORDS : FR_PRICING_KEYWORDS
  }

  if (isHostivResourcesIndexPath(normalized)) {
    return locale === "en" ? EN_RESOURCES_KEYWORDS : FR_RESOURCES_KEYWORDS
  }

  const articleId = getHostivResourceArticleIdFromPath(normalized)

  if (articleId) {
    const articleKeywords =
      locale === "en" ? EN_ARTICLE_KEYWORDS[articleId] : FR_ARTICLE_KEYWORDS[articleId]

    if (articleKeywords) {
      return articleKeywords
    }

    return locale === "en" ? EN_RESOURCES_KEYWORDS : FR_RESOURCES_KEYWORDS
  }

  if (
    normalized === HOSTIV_STATIC_PATHS["a-propos"].fr ||
    normalized === HOSTIV_STATIC_PATHS["a-propos"].en
  ) {
    return locale === "en" ? EN_ABOUT_KEYWORDS : FR_ABOUT_KEYWORDS
  }

  return locale === "en" ? EN_DEFAULT_KEYWORDS : FR_DEFAULT_KEYWORDS
}
