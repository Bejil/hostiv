import type { HostivLocale } from "../types/hostiv-locale"

/** Exemples pour champs hors content.copy (en-tête, médias, cartes modales). */
export const adminCustomizationHeaderExamplesFr = {
  brandName: ["The Grand Appartement", "Maison des Lilas"],
  brandMeta: ["Le Chesnay · Versailles", "Appartement familial · 10 min du centre"],
  logo: ["Logo horizontal sur fond clair", "PNG ou SVG, fond transparent de préférence"]
} as const

export const adminCustomizationImageExamplesFr = {
  hero: [
    "Salon lumineux vu depuis l’entrée",
    "Façade ou pièce la plus représentative du logement"
  ],
  hostPhoto: [
    "Portrait en situation, regard caméra",
    "Photo naturelle dans le logement ou devant l’entrée"
  ],
  reviewsBg: [
    "Façade ou cour du logement",
    "Photo d’ambiance pour la section avis"
  ]
} as const

export const adminCustomizationLocationExamplesFr = {
  address: [
    "5 rue du Colonel de Bange, 78150 Le Chesnay",
    "12 avenue de Paris, 75016 Paris"
  ]
} as const

export const adminCustomizationCardExamplesFr = {
  featuredTitle: ["Salon lumineux", "Chambre parentale"],
  featuredText: [
    "Espace convivial avec canapé et cheminée.",
    "Ambiance calme, lit double et stores occultants."
  ],
  featuredImage: ["Photo d’ambiance de la pièce", "Vue large de l’espace"],
  featuredTag: ["Vie quotidienne", "Repos", "Autonomie"],
  visualTitle: ["Séjour convertible", "Espace de travail"],
  visualText: [
    "Le salon devient une chambre supplémentaire.",
    "Coin bureau confortable avec fibre wifi."
  ],
  visualImage: ["Photo de la pièce mise en avant", "Vue représentative de l’espace"],
  benefitTitle: ["Longs séjours avantageux", "Pensé pour les familles"],
  benefitText: [
    "10 % de remise dès 7 nuits et 20 % dès 28 nuits.",
    "Lit parapluie, chaise haute et jouets disponibles."
  ],
  highlightTitle: ["Château de Versailles", "Commerces & marchés"],
  highlightText: [
    "À proximité pour une visite à pied ou en transports.",
    "Boulangeries, supermarchés et pharmacies à deux pas."
  ],
  houseRuleTitle: ["Non-fumeur", "Calme requis"],
  houseRuleText: [
    "Le logement est strictement non-fumeur.",
    "Respect du calme entre 22 h et 8 h."
  ],
  reviewAuthor: ["Marie", "Thomas D."],
  reviewDate: ["Avril 2026", "Mars 2025"],
  reviewQuote: [
    "Logement impeccable, hôte réactif et quartier calme.",
    "Nous avons passé un excellent week-end en famille."
  ],
  reviewRating: ["5", "4,97 / 5"],
  platformName: ["Airbnb", "Booking"],
  platformRating: ["4,97 / 5", "8,5 / 10"],
  platformUrl: ["https://airbnb.fr/h/mon-logement", "https://booking.com/hotel/fr/mon-logement"]
} as const

export const adminCustomizationAmenityExamplesFr = {
  sectionTitle: ["Équipements", "Confort & praticité"],
  itemName: ["Wifi", "Lave-linge", "Lit parapluie"]
} as const

/** @deprecated Utiliser getAdminCustomizationHeaderExamples(locale) */
export const adminCustomizationHeaderExamples = adminCustomizationHeaderExamplesFr
/** @deprecated Utiliser getAdminCustomizationImageExamples(locale) */
export const adminCustomizationImageExamples = adminCustomizationImageExamplesFr
/** @deprecated Utiliser getAdminCustomizationLocationExamples(locale) */
export const adminCustomizationLocationExamples = adminCustomizationLocationExamplesFr
/** @deprecated Utiliser getAdminCustomizationCardExamples(locale) */
export const adminCustomizationCardExamples = adminCustomizationCardExamplesFr
/** @deprecated Utiliser getAdminCustomizationAmenityExamples(locale) */
export const adminCustomizationAmenityExamples = adminCustomizationAmenityExamplesFr

const adminCustomizationHeaderExamplesEn = {
  brandName: ["The Grand Apartment", "Lilac House"],
  brandMeta: ["Le Chesnay · Versailles", "Family apartment · 10 min from centre"],
  logo: ["Horizontal logo on light background", "PNG or SVG, transparent background preferred"]
} as const

const adminCustomizationImageExamplesEn = {
  hero: [
    "Bright living room seen from the entrance",
    "Facade or most representative room of the property"
  ],
  hostPhoto: [
    "Natural portrait, looking at camera",
    "Casual photo in the property or at the entrance"
  ],
  reviewsBg: [
    "Facade or courtyard of the property",
    "Atmospheric photo for the reviews section"
  ]
} as const

const adminCustomizationLocationExamplesEn = {
  address: [
    "5 rue du Colonel de Bange, 78150 Le Chesnay",
    "12 avenue de Paris, 75016 Paris"
  ]
} as const

const adminCustomizationCardExamplesEn = {
  featuredTitle: ["Bright living room", "Master bedroom"],
  featuredText: [
    "Welcoming space with sofa and fireplace.",
    "Quiet atmosphere, double bed and blackout blinds."
  ],
  featuredImage: ["Atmospheric room photo", "Wide view of the space"],
  featuredTag: ["Daily life", "Rest", "Independence"],
  visualTitle: ["Convertible living room", "Work space"],
  visualText: [
    "The living room becomes an extra bedroom.",
    "Comfortable desk corner with fibre wifi."
  ],
  visualImage: ["Photo of the featured room", "Representative view of the space"],
  benefitTitle: ["Long stays discounted", "Designed for families"],
  benefitText: [
    "10% off from 7 nights and 20% from 28 nights.",
    "Travel cot, high chair and toys available."
  ],
  highlightTitle: ["Palace of Versailles", "Shops & markets"],
  highlightText: [
    "Nearby for a visit on foot or by public transport.",
    "Bakeries, supermarkets and pharmacies within walking distance."
  ],
  houseRuleTitle: ["No smoking", "Quiet hours"],
  houseRuleText: [
    "The property is strictly non-smoking.",
    "Please keep noise down between 10 pm and 8 am."
  ],
  reviewAuthor: ["Marie", "Thomas D."],
  reviewDate: ["April 2026", "March 2025"],
  reviewQuote: [
    "Impeccable property, responsive host and quiet neighbourhood.",
    "We had an excellent family weekend."
  ],
  reviewRating: ["5", "4.97 / 5"],
  platformName: ["Airbnb", "Booking"],
  platformRating: ["4.97 / 5", "8.5 / 10"],
  platformUrl: ["https://airbnb.com/h/my-listing", "https://booking.com/hotel/fr/my-listing"]
} as const

const adminCustomizationAmenityExamplesEn = {
  sectionTitle: ["Amenities", "Comfort & convenience"],
  itemName: ["Wifi", "Washing machine", "Travel cot"]
} as const

export function getAdminCustomizationHeaderExamples(locale: HostivLocale = "fr") {
  return locale === "en" ? adminCustomizationHeaderExamplesEn : adminCustomizationHeaderExamplesFr
}

export function getAdminCustomizationImageExamples(locale: HostivLocale = "fr") {
  return locale === "en" ? adminCustomizationImageExamplesEn : adminCustomizationImageExamplesFr
}

export function getAdminCustomizationLocationExamples(locale: HostivLocale = "fr") {
  return locale === "en" ? adminCustomizationLocationExamplesEn : adminCustomizationLocationExamplesFr
}

export function getAdminCustomizationCardExamples(locale: HostivLocale = "fr") {
  return locale === "en" ? adminCustomizationCardExamplesEn : adminCustomizationCardExamplesFr
}

export function getAdminCustomizationAmenityExamples(locale: HostivLocale = "fr") {
  return locale === "en" ? adminCustomizationAmenityExamplesEn : adminCustomizationAmenityExamplesFr
}
