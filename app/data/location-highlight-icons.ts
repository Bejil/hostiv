export const LOCATION_HIGHLIGHT_ICON_OPTIONS = [
  { value: "castle", label: "Monument" },
  { value: "pin", label: "Repère" },
  { value: "mall", label: "Commerces" },
  { value: "train", label: "Transports" },
  { value: "market", label: "Marché" },
  { value: "mobility", label: "Mobilité" }
] as const

export type LocationHighlightIconId = (typeof LOCATION_HIGHLIGHT_ICON_OPTIONS)[number]["value"]

export const DEFAULT_LOCATION_HIGHLIGHT_ICON: LocationHighlightIconId = "pin"

const LOCATION_HIGHLIGHT_ICON_IDS = new Set<string>(
  LOCATION_HIGHLIGHT_ICON_OPTIONS.map((option) => option.value)
)

export function normalizeLocationHighlightIconId(icon: string | undefined): LocationHighlightIconId {
  if (icon && LOCATION_HIGHLIGHT_ICON_IDS.has(icon)) {
    return icon as LocationHighlightIconId
  }

  return DEFAULT_LOCATION_HIGHLIGHT_ICON
}

export function locationHighlightIconLabel(icon: LocationHighlightIconId): string {
  return (
    LOCATION_HIGHLIGHT_ICON_OPTIONS.find((option) => option.value === icon)?.label ?? "Icône"
  )
}
