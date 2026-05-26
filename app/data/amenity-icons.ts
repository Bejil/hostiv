export const DEFAULT_AMENITY_ICON = "plug"

export const AMENITY_ICON_OPTIONS = [
  { value: "wifi", label: "Wi‑Fi" },
  { value: "heat", label: "Chauffage" },
  { value: "fireplace", label: "Cheminée" },
  { value: "water", label: "Eau chaude" },
  { value: "door", label: "Entrée / porte" },
  { value: "desk", label: "Bureau" },
  { value: "audio", label: "Audio" },
  { value: "blinds", label: "Stores" },
  { value: "window", label: "Fenêtre" },
  { value: "plug", label: "Prise / électricité" },
  { value: "coffee", label: "Café" },
  { value: "coffee-machine", label: "Machine à café" },
  { value: "closet", label: "Rangement" },
  { value: "hanger", label: "Cintres" },
  { value: "iron", label: "Fer à repasser" },
  { value: "hairdryer", label: "Sèche-cheveux" },
  { value: "bedding", label: "Literie" },
  { value: "kitchen", label: "Cuisine" },
  { value: "stove", label: "Plaques" },
  { value: "oven", label: "Four" },
  { value: "microwave", label: "Micro-ondes" },
  { value: "fridge", label: "Réfrigérateur" },
  { value: "freezer", label: "Congélateur" },
  { value: "dishwasher", label: "Lave-vaisselle" },
  { value: "toaster", label: "Grille-pain" },
  { value: "dishes", label: "Vaisselle" },
  { value: "wine", label: "Vin / bar" },
  { value: "basics", label: "Essentiels" },
  { value: "dining", label: "Repas" },
  { value: "washer", label: "Lave-linge" },
  { value: "dryer", label: "Sèche-linge" },
  { value: "laundry", label: "Buanderie" },
  { value: "cleaning", label: "Ménage" },
  { value: "crib", label: "Lit bébé" },
  { value: "highchair", label: "Chaise haute" },
  { value: "changing-table", label: "Table à langer" },
  { value: "toys", label: "Jouets" },
  { value: "books", label: "Livres" },
  { value: "garden", label: "Jardin" },
  { value: "parking", label: "Parking" },
  { value: "ev", label: "Borne VE" },
  { value: "smoke", label: "Détecteur fumée" },
  { value: "co", label: "Détecteur CO" },
  { value: "firstaid", label: "Premiers secours" }
] as const

export type AmenityIconId = (typeof AMENITY_ICON_OPTIONS)[number]["value"]

const AMENITY_ICON_SET = new Set<string>(AMENITY_ICON_OPTIONS.map((option) => option.value))

export function normalizeAmenityIconId(value: string) {
  return AMENITY_ICON_SET.has(value) ? value : DEFAULT_AMENITY_ICON
}
