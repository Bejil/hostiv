import type { HostivLocale } from "../types/hostiv-locale"

export const SEO_KEYWORDS_MAX_COUNT = 12

export type SeoKeywordsLocaleConfig = {
  seo_keywords: string
  seo_keywords_en?: string
  seo_keywords_fr_enabled?: boolean
  seo_keywords_en_enabled?: boolean
}

export function isSeoKeywordsFrEnabled(config: SeoKeywordsLocaleConfig) {
  return parseSeoKeywords(config.seo_keywords).length > 0
}

export function isSeoKeywordsEnEnabled(config: SeoKeywordsLocaleConfig) {
  return parseSeoKeywords(String(config.seo_keywords_en ?? "")).length > 0
}

export function resolveSiteSeoKeywords(
  config: SeoKeywordsLocaleConfig,
  locale: HostivLocale = "fr"
): string | undefined {
  const french = joinSeoKeywords(parseSeoKeywords(config.seo_keywords))
  const english = joinSeoKeywords(parseSeoKeywords(String(config.seo_keywords_en ?? "")))

  if (locale === "en" && english) {
    return english
  }

  if (locale === "fr" && french) {
    return french
  }

  if (english) {
    return english
  }

  if (french) {
    return french
  }

  return undefined
}

export function hasConfiguredSeoKeywords(config: SeoKeywordsLocaleConfig) {
  return isSeoKeywordsFrEnabled(config) || isSeoKeywordsEnEnabled(config)
}

export function parseSeoKeywords(raw: string): string[] {
  const seen = new Set<string>()
  const keywords: string[] = []

  for (const part of raw.split(",")) {
    const keyword = normalizeSeoKeyword(part)

    if (!keyword) {
      continue
    }

    const key = keyword.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    keywords.push(keyword)
  }

  return keywords
}

export function joinSeoKeywords(keywords: string[]): string {
  return keywords.join(", ")
}

export function normalizeSeoKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function seoKeywordExists(keywords: string[], candidate: string) {
  const normalized = normalizeSeoKeyword(candidate).toLowerCase()

  if (!normalized) {
    return false
  }

  return keywords.some((keyword) => keyword.toLowerCase() === normalized)
}

export type AddSeoKeywordResult =
  | { ok: true; keywords: string[] }
  | { ok: false; reason: "empty" | "duplicate" | "limit" }

export function addSeoKeyword(
  keywords: string[],
  candidate: string,
  maxCount: number = SEO_KEYWORDS_MAX_COUNT
): AddSeoKeywordResult {
  const keyword = normalizeSeoKeyword(candidate)

  if (!keyword) {
    return { ok: false, reason: "empty" }
  }

  if (seoKeywordExists(keywords, keyword)) {
    return { ok: false, reason: "duplicate" }
  }

  if (keywords.length >= maxCount) {
    return { ok: false, reason: "limit" }
  }

  return { ok: true, keywords: [...keywords, keyword] }
}

export function removeSeoKeywordAt(keywords: string[], index: number) {
  return keywords.filter((_, itemIndex) => itemIndex !== index)
}
