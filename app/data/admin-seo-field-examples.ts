import type { HostivLocale } from "../types/hostiv-locale"

const adminSeoKeywordSuggestionsFr = [
  "location courte durée",
  "Versailles",
  "appartement familial",
  "6 voyageurs",
  "gîte",
  "piscine",
  "week-end",
  "Paris",
  "centre-ville",
  "wifi",
  "parking",
  "bord de mer",
  "Le Chesnay",
  "lumineux",
  "rénové"
] as const

const adminSeoKeywordSuggestionsEn = [
  "short-term rental",
  "Versailles",
  "family apartment",
  "6 guests",
  "holiday home",
  "pool",
  "weekend",
  "Paris",
  "city centre",
  "wifi",
  "parking",
  "seaside",
  "Le Chesnay",
  "bright",
  "renovated"
] as const

/** @deprecated Utiliser getAdminSeoKeywordSuggestions(locale) */
export const adminSeoKeywordSuggestions = adminSeoKeywordSuggestionsFr

export function getAdminSeoKeywordSuggestions(locale: HostivLocale = "fr") {
  return locale === "en" ? adminSeoKeywordSuggestionsEn : adminSeoKeywordSuggestionsFr
}
