import type { AmenityPreviewSection, AmenitySection } from "../types/amenity"

/** Recopie les cartes aperçu vers le catalogue modal en préservant les descriptions existantes. */
export function syncAmenityCatalogFromPreview(
  preview: AmenityPreviewSection[],
  existingCatalog: AmenitySection[]
): AmenitySection[] {
  const descriptionByItemId = new Map<string, string>()

  for (const section of existingCatalog) {
    for (const item of section.items) {
      if (item.description?.trim()) {
        descriptionByItemId.set(item.id, item.description)
      }
    }
  }

  return preview.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => {
      const description = item.description?.trim() || descriptionByItemId.get(item.id)

      return description ? { ...item, description } : { ...item }
    })
  }))
}
