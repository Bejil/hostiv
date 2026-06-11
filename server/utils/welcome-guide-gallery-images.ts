import type { PropertyAdminRecord } from "../../app/types/property-admin"
import { resolvePropertyAssetUrl } from "../../app/utils/property-asset-url"

export function collectGalleryImageUrls(property: PropertyAdminRecord): string[] {
  const fromCategories = (property.content.space_gallery_categories ?? []).flatMap((category) =>
    (category.images ?? []).map((path) => path.trim()).filter(Boolean)
  )
  const fromFeatured = (property.content.featured_spaces ?? [])
    .map((space) => space.image?.trim())
    .filter((path): path is string => Boolean(path))
  const fromVisual = (property.content.visual_cards ?? [])
    .map((card) => card.image?.trim())
    .filter((path): path is string => Boolean(path))

  const unique = Array.from(new Set([...fromCategories, ...fromFeatured, ...fromVisual]))

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || ""

  return unique
    .map((path) => {
      const url = resolvePropertyAssetUrl(path, { slug: property.slug, supabaseUrl })
      return url || ""
    })
    .filter(Boolean)
}

export function galleryImageAt(property: PropertyAdminRecord, pageIndex: number): string {
  const urls = collectGalleryImageUrls(property)
  if (!urls.length) {
    return ""
  }
  return urls[(pageIndex - 1) % urls.length] ?? ""
}