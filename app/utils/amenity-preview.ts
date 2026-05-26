import type { AmenityItem, AmenityPreviewSection } from "../types/amenity"

/** Nombre d’équipements affichés sur la carte avant « Voir la suite ». */
export const AMENITY_CARD_VISIBLE_LIMIT = 5

export function amenitySectionHasMore(section: Pick<AmenityPreviewSection, "items">): boolean {
  return section.items.length > AMENITY_CARD_VISIBLE_LIMIT
}

export function visibleAmenityItems(items: AmenityItem[]): AmenityItem[] {
  if (items.length <= AMENITY_CARD_VISIBLE_LIMIT) {
    return items
  }

  return items.slice(0, AMENITY_CARD_VISIBLE_LIMIT)
}

export function withAmenityPreviewHasMore(sections: AmenityPreviewSection[]): AmenityPreviewSection[] {
  return sections.map((section) => ({
    ...section,
    hasMore: amenitySectionHasMore(section)
  }))
}
