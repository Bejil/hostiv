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

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectKey}`
}
