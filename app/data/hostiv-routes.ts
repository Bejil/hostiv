import type { HostivLocale } from "../types/hostiv-locale"
import type { HostivStaticPageId } from "./hostiv-static-page.types"
import {
  HOSTIV_RESOURCE_ARTICLE_PATHS,
  type HostivResourceArticleId
} from "./hostivResources"

export const HOSTIV_HOME_PATHS: Record<HostivLocale, string> = {
  fr: "/",
  en: "/en"
}

export const HOSTIV_PASSWORD_RESET_PATHS: Record<HostivLocale, string> = {
  fr: "/mot-de-passe/reinitialiser",
  en: "/en/reset-password"
}

export const HOSTIV_PRICING_PATHS: Record<HostivLocale, string> = {
  fr: "/tarifs",
  en: "/en/pricing"
}

export const HOSTIV_RESOURCES_PATHS: Record<HostivLocale, string> = {
  fr: "/ressources",
  en: "/en/resources"
}

const PASSWORD_RESET_PATHS = new Set(Object.values(HOSTIV_PASSWORD_RESET_PATHS))

/** Ancienne URL produite avant le mapping dédié FR ↔ EN. */
export const HOSTIV_PASSWORD_RESET_LEGACY_EN_PATH = "/en/mot-de-passe/reinitialiser"

export function normalizeHostivMarketingPath(path: string) {
  const withoutQuery = (path.split("?")[0]?.split("#")[0] || "/").trim() || "/"

  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1)
  }

  return withoutQuery
}

export function isHostivPasswordResetRoute(path: string) {
  return PASSWORD_RESET_PATHS.has(normalizeHostivMarketingPath(path))
}

export const HOSTIV_STATIC_PATHS: Record<HostivStaticPageId, Record<HostivLocale, string>> = {
  "a-propos": { fr: "/a-propos", en: "/en/about" },
  contact: { fr: "/contact", en: "/en/contact" },
  "mentions-legales": { fr: "/mentions-legales", en: "/en/legal-notice" },
  "politique-de-confidentialite": {
    fr: "/politique-de-confidentialite",
    en: "/en/privacy-policy"
  },
  "conditions-generales": { fr: "/conditions-generales", en: "/en/terms-of-use" }
}

const PATH_TO_PAGE_ID = new Map<string, HostivStaticPageId>()

for (const [pageId, paths] of Object.entries(HOSTIV_STATIC_PATHS) as Array<
  [HostivStaticPageId, Record<HostivLocale, string>]
>) {
  PATH_TO_PAGE_ID.set(paths.fr, pageId)
  PATH_TO_PAGE_ID.set(paths.en, pageId)
}

const PRICING_PATHS = new Set(Object.values(HOSTIV_PRICING_PATHS))
const RESOURCES_INDEX_PATHS = new Set(Object.values(HOSTIV_RESOURCES_PATHS))

const RESOURCE_ARTICLE_PATH_TO_ID = new Map<string, HostivResourceArticleId>()

for (const [articleId, paths] of Object.entries(HOSTIV_RESOURCE_ARTICLE_PATHS) as Array<
  [HostivResourceArticleId, Record<HostivLocale, string>]
>) {
  RESOURCE_ARTICLE_PATH_TO_ID.set(paths.fr, articleId)
  RESOURCE_ARTICLE_PATH_TO_ID.set(paths.en, articleId)
}

const HOSTIV_MARKETING_PATHS_FR = new Set([
  "/",
  "/tarifs",
  "/ressources",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/conditions-generales",
  "/inscription/confirmation",
  "/mot-de-passe/reinitialiser"
])

export function detectHostivLocaleFromPath(path: string): HostivLocale {
  return path === "/en" || path.startsWith("/en/") ? "en" : "fr"
}

export function isHostivMarketingRoute(path: string) {
  const normalized = normalizeHostivMarketingPath(path)

  if (isHostivPasswordResetRoute(normalized)) {
    return true
  }

  if (normalized === "/en" || normalized.startsWith("/en/")) {
    return true
  }

  if (normalized.startsWith("/ressources")) {
    return true
  }

  return HOSTIV_MARKETING_PATHS_FR.has(normalized)
}

export function getHostivHomePath(locale: HostivLocale) {
  return HOSTIV_HOME_PATHS[locale]
}

export function getHostivPasswordResetPath(locale: HostivLocale) {
  return HOSTIV_PASSWORD_RESET_PATHS[locale]
}

export function getHostivStaticPath(pageId: HostivStaticPageId, locale: HostivLocale) {
  return HOSTIV_STATIC_PATHS[pageId][locale]
}

export function getHostivPricingPath(locale: HostivLocale) {
  return HOSTIV_PRICING_PATHS[locale]
}

export function getHostivResourcesPath(locale: HostivLocale) {
  return HOSTIV_RESOURCES_PATHS[locale]
}

export function getHostivResourceArticleIdFromPath(path: string) {
  return RESOURCE_ARTICLE_PATH_TO_ID.get(normalizeHostivMarketingPath(path)) ?? null
}

export function isHostivResourcesIndexPath(path: string) {
  return RESOURCES_INDEX_PATHS.has(normalizeHostivMarketingPath(path))
}

export function switchHostivLocalePath(path: string, targetLocale: HostivLocale) {
  const normalized = normalizeHostivMarketingPath(path)
  const currentLocale = detectHostivLocaleFromPath(normalized)
  const hash = path.includes("#") ? path.slice(path.indexOf("#")) : ""
  const query = path.includes("?") ? path.slice(path.indexOf("?"), path.includes("#") ? path.indexOf("#") : undefined) : ""

  if (normalized === HOSTIV_HOME_PATHS[currentLocale]) {
    return `${HOSTIV_HOME_PATHS[targetLocale]}${query}${hash}`
  }

  const pageId = PATH_TO_PAGE_ID.get(normalized)

  if (pageId) {
    return `${HOSTIV_STATIC_PATHS[pageId][targetLocale]}${query}${hash}`
  }

  if (PRICING_PATHS.has(normalized)) {
    return `${HOSTIV_PRICING_PATHS[targetLocale]}${query}${hash}`
  }

  if (RESOURCES_INDEX_PATHS.has(normalized)) {
    return `${HOSTIV_RESOURCES_PATHS[targetLocale]}${query}${hash}`
  }

  const resourceArticleId = RESOURCE_ARTICLE_PATH_TO_ID.get(normalized)

  if (resourceArticleId) {
    return `${HOSTIV_RESOURCE_ARTICLE_PATHS[resourceArticleId][targetLocale]}${query}${hash}`
  }

  if (
    PASSWORD_RESET_PATHS.has(normalized) ||
    normalized === HOSTIV_PASSWORD_RESET_LEGACY_EN_PATH
  ) {
    return `${HOSTIV_PASSWORD_RESET_PATHS[targetLocale]}${query}${hash}`
  }

  if (targetLocale === "en") {
    return normalized === "/" ? "/en" : `/en${normalized}${query}${hash}`
  }

  if (normalized.startsWith("/en/")) {
    return `${normalized.slice(3) || "/"}${query}${hash}`
  }

  if (normalized === "/en") {
    return `/${query}${hash}`
  }

  return `${normalized}${query}${hash}`
}
