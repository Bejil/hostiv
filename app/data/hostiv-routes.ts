import type { HostivLocale } from "../types/hostiv-locale"
import type { HostivStaticPageId } from "./hostiv-static-page.types"

export const HOSTIV_HOME_PATHS: Record<HostivLocale, string> = {
  fr: "/",
  en: "/en"
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

const HOSTIV_MARKETING_PATHS_FR = new Set([
  "/",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/conditions-generales",
  "/inscription/confirmation"
])

export function detectHostivLocaleFromPath(path: string): HostivLocale {
  return path === "/en" || path.startsWith("/en/") ? "en" : "fr"
}

export function isHostivMarketingRoute(path: string) {
  const normalized = (path.split("?")[0]?.split("#")[0] || "/").trim() || "/"

  if (normalized === "/en" || normalized.startsWith("/en/")) {
    return true
  }

  return HOSTIV_MARKETING_PATHS_FR.has(normalized)
}

export function getHostivHomePath(locale: HostivLocale) {
  return HOSTIV_HOME_PATHS[locale]
}

export function getHostivStaticPath(pageId: HostivStaticPageId, locale: HostivLocale) {
  return HOSTIV_STATIC_PATHS[pageId][locale]
}

export function switchHostivLocalePath(path: string, targetLocale: HostivLocale) {
  const normalized = path.split("?")[0]?.split("#")[0] || "/"
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
