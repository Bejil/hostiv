import type { AdminIconName } from "../components/admin/admin-icon-types"

export const DEFAULT_PLATFORM_CUSTOM_ICON: AdminIconName = "star"
export const DEFAULT_PLATFORM_ICON_BG = "#0d9b6e"

/** Icônes proposées pour les plateformes personnalisées (location, avis, direct…). */
export const PLATFORM_CUSTOM_ICON_OPTIONS: ReadonlyArray<{
  id: AdminIconName
  label: string
}> = [
  { id: "star", label: "Note / avis" },
  { id: "heart", label: "Coup de cœur" },
  { id: "quote", label: "Témoignage" },
  { id: "thumbs-up", label: "Recommandé" },
  { id: "user", label: "Hôte" },
  { id: "hand", label: "Accueil" },
  { id: "calendar", label: "Disponibilités" },
  { id: "clock", label: "Horaires" },
  { id: "map-pin", label: "Adresse" },
  { id: "map", label: "Quartier" },
  { id: "home", label: "Logement" },
  { id: "key", label: "Arrivée / clés" },
  { id: "external", label: "Lien externe" },
  { id: "arrow-right", label: "Réservation directe" },
  { id: "check", label: "Vérifié" },
  { id: "eye", label: "Visible" }
] as const

const iconIdSet = new Set(PLATFORM_CUSTOM_ICON_OPTIONS.map((item) => item.id))

/** Anciennes icônes retirées de la liste → remplacement à la normalisation. */
const LEGACY_PLATFORM_ICON_IDS: Record<string, AdminIconName> = {
  layout: "home",
  hestia: "home",
  image: "star",
  search: "map-pin",
  card: "external",
  mail: "message",
  list: "quote"
}

export function isPlatformCustomIconId(value: string): value is AdminIconName {
  return iconIdSet.has(value as AdminIconName)
}

export function normalizePlatformCustomIconId(value: unknown): AdminIconName {
  const id = typeof value === "string" ? value.trim() : ""

  if (isPlatformCustomIconId(id)) {
    return id
  }

  const legacy = LEGACY_PLATFORM_ICON_IDS[id]

  if (legacy) {
    return legacy
  }

  return DEFAULT_PLATFORM_CUSTOM_ICON
}

export function normalizePlatformIconBg(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : ""

  if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
    return raw.length === 4
      ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
      : raw.slice(0, 7)
  }

  return DEFAULT_PLATFORM_ICON_BG
}

export function platformCustomIconLabel(iconId: AdminIconName) {
  return PLATFORM_CUSTOM_ICON_OPTIONS.find((item) => item.id === iconId)?.label ?? iconId
}
