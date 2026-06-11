export const DEFAULT_PROPERTY_ASSETS_BUCKET = "property-assets"

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

/**
 * URL publique Supabase Storage pour un asset de site.
 * Chemins en base : `/gallery/hero.jpeg` → `{slug}/gallery/hero.jpeg` dans le bucket.
 */
export function resolvePropertyAssetUrl(
  src: string,
  options: {
    slug: string
    supabaseUrl: string
    bucket?: string
    /** Invalide le cache navigateur (aperçu live après remplacement d’image). */
    cacheRevision?: number | string
  }
): string {
  const raw = src.trim()

  if (!raw) {
    return ""
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  const supabaseUrl = options.supabaseUrl.replace(/\/$/, "")
  const slug = options.slug.replace(/^\/+|\/+$/g, "")
  const bucket = options.bucket || DEFAULT_PROPERTY_ASSETS_BUCKET
  const relativePath = raw.replace(/^\/+/, "")

  if (!supabaseUrl || !slug || !relativePath) {
    return ""
  }

  const objectKey = encodeObjectKey(`${slug}/${relativePath}`)

  const base = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectKey}`

  return appendAssetCacheRevision(base, options.cacheRevision)
}

/** Ajoute un paramètre de version pour contourner le cache navigateur après remplacement d’image. */
export function appendAssetCacheRevision(url: string, revision?: number | string) {
  if (!url || revision === undefined || revision === null) {
    return url
  }

  const token = String(revision).trim()

  if (!token || token === "0") {
    return url
  }

  const separator = url.includes("?") ? "&" : "?"

  return `${url}${separator}r=${encodeURIComponent(token)}`
}
