/** Slugs réservés (routes Nuxt, assets, etc.) */
export const RESERVED_PROPERTY_SLUGS = new Set([
  "admin",
  "a-propos",
  "api",
  "app",
  "assets",
  "conditions-generales",
  "contact",
  "cookies",
  "favicon",
  "hestia",
  "login",
  "hostiv",
  "mentions-legales",
  "politique-de-confidentialite",
  "public",
  "robots",
  "signup",
  "sitemap",
  "www",
  "_nuxt"
])

export const PROPERTY_SLUG_MIN_LENGTH = 3
export const PROPERTY_SLUG_MAX_LENGTH = 48

export function slugifyPropertyName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, PROPERTY_SLUG_MAX_LENGTH)
}

export type PropertySlugValidity =
  | { valid: false; reason: "empty" }
  | { valid: false; reason: "too_short"; slug: string }
  | { valid: false; reason: "invalid_format"; slug: string }
  | { valid: false; reason: "reserved"; slug: string }
  | { valid: true; slug: string }

export function validatePropertySlugFormat(slug: string): PropertySlugValidity {
  const normalized = slug.trim().toLowerCase()

  if (!normalized) {
    return { valid: false, reason: "empty" }
  }

  if (!/^[a-z0-9]+$/.test(normalized)) {
    return { valid: false, reason: "invalid_format", slug: normalized }
  }

  if (normalized.length < PROPERTY_SLUG_MIN_LENGTH) {
    return { valid: false, reason: "too_short", slug: normalized }
  }

  if (RESERVED_PROPERTY_SLUGS.has(normalized)) {
    return { valid: false, reason: "reserved", slug: normalized }
  }

  return { valid: true, slug: normalized }
}
