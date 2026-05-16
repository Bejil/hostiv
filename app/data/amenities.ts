export type AmenityItem = {
  id: string
  icon: string
  name: string
  description?: string
}

export type AmenitySection = {
  id: string
  title: string
  items: AmenityItem[]
}

export type AmenityPreviewSection = AmenitySection & {
  hasMore: boolean
}

export const AMENITY_PREVIEW_LIMIT = 5

/** Liste officielle des équipements (ordre et libellés Airbnb). */
const allAmenities: AmenityItem[] = [
  { id: "caches-prises", icon: "plug", name: "Caches-prises" },
  { id: "cafe", icon: "coffee", name: "Café" },
  {
    id: "chaise-haute",
    icon: "highchair",
    name: "Chaise haute",
    description: "Standalone • Toujours dans le logement."
  },
  {
    id: "chauffage",
    icon: "heat",
    name: "Chauffage",
    description: "Équipement utilisé pour chauffer un logement."
  },
  { id: "cheminee", icon: "fireplace", name: "Cheminée" },
  { id: "cintres", icon: "hanger", name: "Cintres" },
  { id: "congelateur", icon: "freezer", name: "Congélateur" },
  {
    id: "cuisine",
    icon: "kitchen",
    name: "Cuisine",
    description:
      "Un espace pour cuisiner des repas comprenant au moins un réfrigérateur, un four et une surface de cuisson."
  },
  {
    id: "cuisiniere",
    icon: "stove",
    name: "Cuisinière",
    description: "Other • Induction • 4 feux."
  },
  {
    id: "detecteur-fumee",
    icon: "smoke",
    name: "Détecteur de fumée",
    description:
      "Un appareil qui alerte les occupants d'un logement lorsqu'il détecte de la fumée (vérifiez la législation locale : celle-ci peut exiger la présence d'un détecteur de fumée en état de marche dans votre logement)."
  },
  {
    id: "detecteur-co",
    icon: "co",
    name: "Détecteur de monoxyde de carbone",
    description:
      "Un appareil qui alerte les occupants d'un logement en cas de détection d'un taux dangereux de monoxyde de carbone (vérifiez la législation locale : celle-ci peut exiger la présence d'un détecteur de monoxyde de carbone en état de marche dans votre logement)."
  },
  {
    id: "eau-chaude",
    icon: "water",
    name: "Eau chaude",
    description:
      "L'eau du lavabo et de la douche ou de la baignoire est assez chaude pour se laver."
  },
  {
    id: "entree-privee",
    icon: "door",
    name: "Entrée privée",
    description: "Une entrée réservée aux voyageurs."
  },
  {
    id: "rangement-vetements",
    icon: "closet",
    name: "Espace de rangement pour les vêtements",
    description: "Armoire."
  },
  {
    id: "bureau",
    icon: "desk",
    name: "Espace de travail dédié",
    description: "Privé."
  },
  { id: "fer", icon: "iron", name: "Fer à repasser" },
  { id: "four", icon: "oven", name: "Four", description: "Simple." },
  { id: "micro-ondes", icon: "microwave", name: "Four à micro-ondes" },
  { id: "grille-pain", icon: "toaster", name: "Grille-pain" },
  { id: "grilles-fenetre", icon: "window", name: "Grilles de fenêtre" },
  { id: "jardin", icon: "garden", name: "Jardin", description: "Public ou partagé." },
  {
    id: "lave-linge",
    icon: "washer",
    name: "Lave-linge",
    description: "Une machine pour laver les vêtements sales."
  },
  { id: "lave-vaisselle", icon: "dishwasher", name: "Lave-vaisselle" },
  { id: "laverie", icon: "laundry", name: "Laverie automatique à proximité" },
  { id: "linge", icon: "bedding", name: "Linge de lit", description: "Coton." },
  {
    id: "lit-parapluie",
    icon: "crib",
    name: "Lit parapluie",
    description:
      "Lit parapluie • Toujours dans le logement • Stores occultants dans la pièce • Compris dans votre séjour."
  },
  { id: "livres", icon: "books", name: "Livres et de quoi lire" },
  {
    id: "jouets",
    icon: "toys",
    name: "Livres et jouets pour enfants",
    description: "0 à 2 ans, 2 à 5 ans."
  },
  {
    id: "machine-cafe",
    icon: "coffee-machine",
    name: "Machine à café",
    description: "Cafetière filtre."
  },
  { id: "nettoyage", icon: "cleaning", name: "Produits de nettoyage" },
  { id: "frigo", icon: "fridge", name: "Réfrigérateur" },
  {
    id: "borne-ve",
    icon: "ev",
    name: "Station de recharge pour véhicules électriques",
    description:
      "Une station où les voyageurs peuvent recharger leur véhicule électrique sur place."
  },
  {
    id: "parking-gratuit",
    icon: "parking",
    name: "Stationnement gratuit dans la rue",
    description: "Stationnement gratuit disponible dans une rue voisine."
  },
  {
    id: "parking-payant",
    icon: "parking",
    name: "Stationnement payant sur place",
    description: "Stationnement payant disponible au logement."
  },
  {
    id: "parking-rue",
    icon: "parking",
    name: "Stationnement payant à l'extérieur de la propriété",
    description: "Stationnement dans la rue."
  },
  { id: "stores", icon: "blinds", name: "Stores occultants" },
  { id: "audio", icon: "audio", name: "Système audio", description: "Bluetooth." },
  { id: "seche-cheveux", icon: "hairdryer", name: "Sèche-cheveux" },
  {
    id: "seche-linge",
    icon: "dryer",
    name: "Sèche-linge",
    description: "Une machine pour sécher les vêtements mouillés."
  },
  {
    id: "table-a-langer",
    icon: "changing-table",
    name: "Table à langer",
    description: "Toujours dans le logement."
  },
  { id: "table", icon: "dining", name: "Table à manger", description: "10 places." },
  { id: "secours", icon: "firstaid", name: "Trousse de premiers secours" },
  {
    id: "vaisselle",
    icon: "dishes",
    name: "Vaisselle et couverts",
    description: "Assiettes, bols, tasses, couverts et autres ustensiles."
  },
  { id: "verres", icon: "wine", name: "Verres à vin" },
  {
    id: "wifi",
    icon: "wifi",
    name: "Wifi",
    description:
      "Technologie sans fil permettant aux appareils de se connecter à internet."
  },
  {
    id: "base-cuisine",
    icon: "basics",
    name: "Équipements de cuisine de base",
    description: "Casseroles et poêles, huile, sel et poivre"
  }
]

const previewChunks: { id: string; title: string; start: number; end: number }[] = [
  { id: "preview-1", title: "Équipements", start: 0, end: 12 },
  { id: "preview-2", title: "Équipements (suite)", start: 12, end: 23 },
  { id: "preview-3", title: "Équipements (suite)", start: 23, end: 35 },
  { id: "preview-4", title: "Équipements (suite)", start: 35, end: 46 }
]

/** Modale : liste complète, dans l'ordre. */
export const amenityCatalog: AmenitySection[] = [
  {
    id: "equipements",
    title: "Équipements",
    items: allAmenities
  }
]

/** Aperçu page : 4 cartes, 5 équipements max chacune. */
export const amenityPreviewSections: AmenityPreviewSection[] = previewChunks.map((chunk) => {
  const sliceEnd = Math.min(chunk.start + AMENITY_PREVIEW_LIMIT, chunk.end)
  return {
    id: chunk.id,
    title: chunk.title,
    items: allAmenities.slice(chunk.start, sliceEnd),
    hasMore: chunk.end - chunk.start > AMENITY_PREVIEW_LIMIT
  }
})
