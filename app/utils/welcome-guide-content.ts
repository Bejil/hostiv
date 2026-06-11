import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertyHouseRule } from "../types/property-site"
import {
  DEFAULT_WELCOME_GUIDE_RULE_ICON,
  normalizeWelcomeGuideRuleIcon
} from "../data/welcome-guide-rule-icons"
import type {
  PropertyWelcomeGuide,
  WelcomeGuideCheckoutItem,
  WelcomeGuideDiningSpot,
  WelcomeGuideEmergencyContact,
  WelcomeGuidePlace,
  WelcomeGuideRule
} from "../types/welcome-guide"
import { welcomeGuideDedicatedImagePath } from "./welcome-guide-images"

/** Nombre maximum de règles sur la page 3 du PDF. */
export const WELCOME_GUIDE_MAX_RULE_COUNT = 7

/** Nombre maximum de contacts sur la page 4 du PDF. */
export const WELCOME_GUIDE_MAX_EMERGENCY_COUNT = 6

/** Nombre maximum d’adresses sur la page 6 du PDF (restauration). */
export const WELCOME_GUIDE_MAX_DINING_COUNT = 8

/** Nombre maximum de lieux sur la page 5 du PDF. */
export const WELCOME_GUIDE_MAX_PLACE_COUNT = 4

/** Nombre maximum d’éléments sur la page 7 du PDF (check-out). */
export const WELCOME_GUIDE_MAX_CHECKOUT_COUNT = 8

/** Nombre de règles par défaut à la création. */
export const WELCOME_GUIDE_DEFAULT_RULE_COUNT = WELCOME_GUIDE_MAX_RULE_COUNT

export const DEFAULT_WELCOME_GUIDE_RULES: WelcomeGuideRule[] = [
  {
    icon: "no-smoking",
    title: "Non-fumeur",
    text: "Merci de ne pas fumer à l’intérieur du logement."
  },
  {
    icon: "no-parties",
    title: "Pas de fêtes ou événements",
    text: "Merci de respecter notre logement et nos voisins."
  },
  {
    icon: "quiet",
    title: "Heures de calme",
    text: "Merci de limiter le bruit entre 22 h et 8 h."
  },
  {
    icon: "clean",
    title: "Garder les lieux propres",
    text: "Merci de ranger après vous et de traiter le logement avec soin."
  },
  {
    icon: "no-pets",
    title: "Pas d’animaux",
    text: "Nous aimons les animaux, mais ils ne sont pas autorisés pendant votre séjour."
  },
  {
    icon: "shoes-off",
    title: "Chaussures enlevées",
    text: "Merci d’enlever vos chaussures à l’intérieur du logement."
  },
  {
    icon: "report",
    title: "Signaler tout problème",
    text: "Prévenez-nous rapidement si quelque chose est endommagé ou ne fonctionne pas."
  }
]

const DEFAULT_PAGE3 = {
  rules_image_path: "",
  rules_title: "Règles de la maison",
  rules_banner: "• Merci de respecter notre logement •",
  rules_footer: "Merci de nous aider à garder notre logement agréable pour tous !",
  rules: DEFAULT_WELCOME_GUIDE_RULES
} as const

export const DEFAULT_WELCOME_GUIDE_EMERGENCY_CONTACTS: WelcomeGuideEmergencyContact[] = [
  {
    title: "L'hôte",
    description: "Questions sur le logement, accès, équipements ou petit souci non urgent.",
    text: "+33 6 12 34 56 78",
    note: "Joignable de 9 h à 21 h · réponse sous 2 h en journée"
  },
  {
    title: "Urgences médicales",
    description: "Malaise grave, blessure, difficulté à respirer ou suspicion d’AVC.",
    text: "15",
    note: "24 h/24"
  },
  {
    title: "Pompiers",
    description: "Incendie, fuite de gaz, inondation ou personne en danger.",
    text: "18",
    note: "24 h/24"
  },
  {
    title: "Police",
    description: "Agression, cambriolage ou situation mettant des personnes en danger.",
    text: "17",
    note: "24 h/24"
  },
  {
    title: "Pharmacie de garde",
    description: "Médicaments indispensables le soir, le dimanche ou un jour férié.",
    text: "3624",
    note: "0,35 € / appel + prix appel"
  },
  {
    title: "Urgence Europe",
    description: "Numéro unique joignable partout en Europe, 24 h/24.",
    text: "112",
    note: ""
  }
]

const DEFAULT_PAGE4 = {
  emergency_image_path: "",
  emergency_eyebrow: "Numéros",
  emergency_banner: "d'urgence",
  emergency_intro:
    "En cas d’urgence ou de besoin d’aide, contactez les services ci-dessous. Conservez ce guide à portée de main pendant votre séjour.",
  emergency_contacts: DEFAULT_WELCOME_GUIDE_EMERGENCY_CONTACTS
} as const

export const DEFAULT_WELCOME_GUIDE_DINING_SPOTS: WelcomeGuideDiningSpot[] = [
  {
    title: "Café du matin",
    description: "Pâtisseries maison, espresso serré et viennoiseries encore chaudes.",
    text: "8 rue des Petits Plaisirs · 5 min à pied",
    note: "Ouvert dès 7 h · terrasse ombragée"
  },
  {
    title: "Brasserie du coin",
    description: "Carte courte, produits locaux et plat du jour changeant selon le marché.",
    text: "Place du Marché · 8 min à pied",
    note: "Service midi & soir · réservation conseillée le week-end"
  },
  {
    title: "Table gastronomique",
    description: "Menu dégustation en 4 temps, accords mets & vins de la région.",
    text: "22 avenue des Vignes · 12 min en voiture",
    note: "Mercredi au samedi · menu à partir de 65 €"
  },
  {
    title: "Bar à vin",
    description: "Cave naturelle, planches à partager et conseils de l’équipe sur place.",
    text: "14 rue Saint-Louis · 10 min à pied",
    note: "Ouvert de 18 h à 1 h · dernière commande 0 h 30"
  },
  {
    title: "Marché couvert",
    description: "Fromages, poissons et primeurs pour composer un panier ou un pique-nique.",
    text: "Marché Notre-Dame · 6 min à pied",
    note: "Mar.–sam. 8 h–13 h · dimanche matin"
  },
  {
    title: "Livraison locale",
    description: "Pizzas au feu de bois et plats à emporter livrés au logement.",
    text: "Commande en ligne · livraison 30–45 min",
    note: "Tous les soirs · minimum 20 €"
  },
  {
    title: "Salon de thé",
    description: "Thés d’exception, pâtisseries fines et pause gourmande l’après-midi.",
    text: "5 rue des Jardins · 7 min à pied",
    note: "Mercredi au dimanche · 14 h – 19 h"
  },
  {
    title: "Glacier artisanal",
    description: "Sorbets et glaces maison, parfums de saison et coupes généreuses.",
    text: "Angle place du Marché · 6 min à pied",
    note: "Avril à septembre · jusqu’à 22 h"
  }
]

export const DEFAULT_WELCOME_GUIDE_PLACES: WelcomeGuidePlace[] = [
  {
    image_path: "",
    title: "Le château",
    address: "Place d’Armes, 78000 Versailles",
    description:
      "Symbole de la ville : jardins, Galerie des Glaces et promenades au coucher du soleil. Prévoyez une demi-journée."
  },
  {
    image_path: "",
    title: "Le marché",
    address: "Marché Notre-Dame, Versailles",
    description:
      "Produits frais, fromages et spécialités locales — idéal pour un petit-déjeuner ou un panier pique-nique."
  },
  {
    image_path: "",
    title: "Le parc",
    address: "Parc du domaine de Versailles",
    description:
      "Grandes allées, bassins et perspective vers le château. Parfait pour une balade à pied ou à vélo."
  },
  {
    image_path: "",
    title: "Notre adresse coup de cœur",
    address: "Quartier Saint-Louis · 10 min à pied",
    description:
      "Bistrot de quartier, carte courte et produits de saison. Réservation conseillée le week-end."
  }
]

const DEFAULT_PAGE5 = {
  places_city: "",
  places_title: "Lieux à visiter",
  places: DEFAULT_WELCOME_GUIDE_PLACES
} as const

const DEFAULT_PAGE6 = {
  dining_image_path: "",
  dining_eyebrow: "Se restaurer",
  dining_banner: "ou boire un verre",
  dining_intro:
    "Nos adresses préférées pour un café, un déjeuner ou un verre en soirée — à pied ou en quelques minutes du logement.",
  dining_spots: DEFAULT_WELCOME_GUIDE_DINING_SPOTS
} as const

export const DEFAULT_WELCOME_GUIDE_CHECKOUT_ITEMS: WelcomeGuideCheckoutItem[] = [
  {
    icon: "checkout",
    title: "Heure de départ",
    description: "Quittez le logement au plus tard à l’heure convenue."
  },
  {
    icon: "keys",
    title: "Clés",
    description: "Laissez les clés dans la boîte prévue ou remettez-les à votre hôte."
  },
  {
    icon: "trash",
    title: "Poubelles",
    description: "Sortez les poubelles et refermez le couvercle du local."
  },
  {
    icon: "clean",
    title: "Vaisselle & linge",
    description:
      "Lancez le lave-vaisselle, videz le réfrigérateur et déposez le linge utilisé au bon endroit."
  },
  {
    icon: "thermostat",
    title: "Chauffage & fenêtres",
    description: "Baissez le chauffage, fermez les fenêtres et éteignez la climatisation."
  },
  {
    icon: "report",
    title: "Signaler un souci",
    description: "Prévenez-nous si quelque chose a été cassé, sale ou manquant."
  },
  {
    icon: "door",
    title: "Porte & accès",
    description: "Fermez le logement et vérifiez que la porte est bien verrouillée."
  },
  {
    icon: "recycle",
    title: "Tri sélectif",
    description: "Respectez le tri indiqué et laissez les consignes visibles pour les prochains."
  }
]

const DEFAULT_PAGE7 = {
  checkout_title: "Check-out",
  checkout_banner: "• Avant de partir •",
  checkout_important:
    "Merci de suivre attentivement chaque étape ci-dessous : elle compte pour les voyageurs qui vous succéderont, pour notre équipe d’entretien et pour que le logement reste accueillant.",
  checkout_footer: "Merci pour votre séjour — au plaisir de vous accueillir à nouveau !",
  checkout_items: DEFAULT_WELCOME_GUIDE_CHECKOUT_ITEMS
} as const

const DEFAULT_PAGE2: Omit<
  PropertyWelcomeGuide,
  | "cover_image_path"
  | "cover_title"
  | "cover_subtitle"
  | keyof typeof DEFAULT_PAGE3
  | keyof typeof DEFAULT_PAGE4
  | keyof typeof DEFAULT_PAGE5
  | keyof typeof DEFAULT_PAGE6
  | keyof typeof DEFAULT_PAGE7
> = {
  host_image_path: "",
  host_name: "",
  host_section_title: "Rencontrez votre hôte",
  host_facts_intro: "",
  host_facts: "",
  host_bio: "",
  host_phone: "",
  host_email: "",
  wifi_network: "WiFi-Logement",
  wifi_password: "",
  welcome_eyebrow: "Un accueil",
  welcome_banner: "chaleureux",
  welcome_salutation: "Cher invité",
  welcome_body: "",
  welcome_signature: "",
  welcome_footer: ""
}

/** Lettre d’accueil type (plusieurs paragraphes, séparés par une ligne vide). */
export const DEFAULT_WELCOME_GUIDE_BODY = `C’est un vrai plaisir de vous accueillir ici. Nous avons préparé ce logement avec soin pour que vous vous sentiez chez vous dès les premières minutes — lumière, calme, et ces petits détails qui font la différence.

Nous vous souhaitons un séjour doux et vivant : des matinées sans précipitation, des après-midis pour flâner, et des soirées où l’on prend le temps de savourer ce qui compte.

Que vous veniez pour vous reposer, explorer le quartier ou retrouver vos proches, nous espérons que vous repartirez avec de beaux souvenirs et l’envie de revenir.

Le logement est à vous ; nous restons disponibles si une question, une recommandation ou un imprévu se présente. Bon voyage — et profitez pleinement de ces jours qui vous appartiennent.`

/** Valeurs initiales affichées dans l’aperçu quand le champ est vide (pas des placeholders). */
const WELCOME_GUIDE_STATIC_DEFAULTS = {
  cover_title: "Bienvenue",
  cover_subtitle: "",
  host_name: "Sophie · votre hôte",
  host_bio:
    "Je m’occupe personnellement de l’accueil et reste disponible pendant votre séjour.\n\nNous habitons à proximité et pouvons vous conseiller sur le quartier.",
  host_phone: "+33 6 12 34 56 78",
  host_email: "hote@exemple.fr",
  welcome_body: DEFAULT_WELCOME_GUIDE_BODY,
  welcome_signature: "Sophie"
} as const

function withDefault(value: string, fallback: string) {
  return value.trim() || fallback.trim()
}

function legacyString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function publishedHouseRules(record: PropertyAdminRecord): PropertyHouseRule[] {
  return (record.content?.house_rules ?? []).filter(
    (rule) => rule.title?.trim() && rule.text?.trim()
  )
}

/** Règles type à partir des règles publiées sur le site (7 emplacements). */
export function welcomeGuideRulesFromProperty(record: PropertyAdminRecord): WelcomeGuideRule[] {
  const fromSite = publishedHouseRules(record)

  return DEFAULT_WELCOME_GUIDE_RULES.map((slot, index) => {
    const site = fromSite[index]

    if (!site) {
      return { ...slot }
    }

    return {
      icon: slot.icon,
      title: site.title.trim(),
      text: site.text.trim()
    }
  })
}

function normalizeRuleItem(item: unknown, fallback: WelcomeGuideRule): WelcomeGuideRule {
  const v = item && typeof item === "object" ? (item as Record<string, unknown>) : {}

  return {
    icon: normalizeWelcomeGuideRuleIcon(v.icon, fallback.icon),
    title: withDefault(legacyString(v.title), fallback.title),
    text: withDefault(legacyString(v.text), fallback.text)
  }
}

function normalizeEmergencyContactItem(
  item: unknown,
  fallback: WelcomeGuideEmergencyContact
): WelcomeGuideEmergencyContact {
  const v = item && typeof item === "object" ? (item as Record<string, unknown>) : {}

  return {
    title: withDefault(legacyString(v.title), fallback.title),
    description: withDefault(legacyString(v.description), fallback.description),
    text: withDefault(legacyString(v.text), fallback.text),
    note: legacyString(v.note)
  }
}

function normalizeDiningSpotItem(item: unknown, fallback: WelcomeGuideDiningSpot): WelcomeGuideDiningSpot {
  const v = item && typeof item === "object" ? (item as Record<string, unknown>) : {}

  return {
    title: withDefault(legacyString(v.title), fallback.title),
    description: withDefault(legacyString(v.description), fallback.description),
    text: withDefault(legacyString(v.text), fallback.text),
    note: legacyString(v.note)
  }
}

function normalizePlaceItem(item: unknown, fallback: WelcomeGuidePlace): WelcomeGuidePlace {
  const v = item && typeof item === "object" ? (item as Record<string, unknown>) : {}

  return {
    image_path: legacyString(v.image_path),
    title: withDefault(legacyString(v.title), fallback.title),
    description: withDefault(legacyString(v.description), fallback.description),
    address: withDefault(legacyString(v.address), fallback.address)
  }
}

function normalizePlaces(value: unknown): WelcomeGuidePlace[] {
  const defaults = DEFAULT_WELCOME_GUIDE_PLACES.map((slot) => ({ ...slot }))

  if (!Array.isArray(value) || value.length === 0) {
    return defaults
  }

  return value
    .slice(0, WELCOME_GUIDE_MAX_PLACE_COUNT)
    .map((item, index) =>
      normalizePlaceItem(item, defaults[index] ?? defaults[defaults.length - 1]!)
    )
}

function normalizeDiningSpots(value: unknown): WelcomeGuideDiningSpot[] {
  const defaults = DEFAULT_WELCOME_GUIDE_DINING_SPOTS.map((slot) => ({ ...slot }))

  if (!Array.isArray(value) || value.length === 0) {
    return defaults
  }

  return value
    .slice(0, WELCOME_GUIDE_MAX_DINING_COUNT)
    .map((item, index) =>
      normalizeDiningSpotItem(item, defaults[index] ?? defaults[defaults.length - 1]!)
    )
}

function normalizeEmergencyContacts(
  value: unknown,
  hostPhone = ""
): WelcomeGuideEmergencyContact[] {
  const defaults = DEFAULT_WELCOME_GUIDE_EMERGENCY_CONTACTS.map((slot, index) => ({
    ...slot,
    text: index === 0 && hostPhone.trim() ? hostPhone.trim() : slot.text
  }))

  if (!Array.isArray(value) || value.length === 0) {
    return defaults
  }

  return value
    .slice(0, WELCOME_GUIDE_MAX_EMERGENCY_COUNT)
    .map((item, index) =>
      normalizeEmergencyContactItem(item, defaults[index] ?? defaults[defaults.length - 1]!)
    )
}

function normalizeCheckoutItem(
  item: unknown,
  fallback: WelcomeGuideCheckoutItem
): WelcomeGuideCheckoutItem {
  const v = item && typeof item === "object" ? (item as Record<string, unknown>) : {}

  return {
    icon: normalizeWelcomeGuideRuleIcon(v.icon, fallback.icon),
    title: withDefault(legacyString(v.title), fallback.title),
    description: withDefault(legacyString(v.description), fallback.description)
  }
}

function normalizeCheckoutItems(value: unknown): WelcomeGuideCheckoutItem[] {
  const defaults = DEFAULT_WELCOME_GUIDE_CHECKOUT_ITEMS.map((slot) => ({ ...slot }))

  if (!Array.isArray(value) || value.length === 0) {
    return defaults
  }

  return value
    .slice(0, WELCOME_GUIDE_MAX_CHECKOUT_COUNT)
    .map((item, index) =>
      normalizeCheckoutItem(item, defaults[index] ?? defaults[defaults.length - 1]!)
    )
}

function normalizeRules(value: unknown, record?: PropertyAdminRecord): WelcomeGuideRule[] {
  const defaults = (record ? welcomeGuideRulesFromProperty(record) : DEFAULT_WELCOME_GUIDE_RULES).map(
    (rule) => ({ ...rule })
  )
  const raw = Array.isArray(value) ? value : []

  if (raw.length === 0) {
    return defaults
  }

  return raw
    .slice(0, WELCOME_GUIDE_MAX_RULE_COUNT)
    .map((item, index) => {
      const fallback =
        defaults[index] ?? defaults[defaults.length - 1] ?? DEFAULT_WELCOME_GUIDE_RULES[0]

      return normalizeRuleItem(item, fallback)
    })
}

export function createEmptyWelcomeGuide(): PropertyWelcomeGuide {
  return {
    cover_image_path: "",
    cover_title: WELCOME_GUIDE_STATIC_DEFAULTS.cover_title,
    cover_subtitle: WELCOME_GUIDE_STATIC_DEFAULTS.cover_subtitle,
    host_image_path: "",
    host_name: WELCOME_GUIDE_STATIC_DEFAULTS.host_name,
    host_section_title: DEFAULT_PAGE2.host_section_title,
    host_facts_intro: DEFAULT_PAGE2.host_facts_intro,
    host_facts: DEFAULT_PAGE2.host_facts,
    host_bio: WELCOME_GUIDE_STATIC_DEFAULTS.host_bio,
    host_phone: WELCOME_GUIDE_STATIC_DEFAULTS.host_phone,
    host_email: WELCOME_GUIDE_STATIC_DEFAULTS.host_email,
    wifi_network: DEFAULT_PAGE2.wifi_network,
    wifi_password: DEFAULT_PAGE2.wifi_password,
    welcome_eyebrow: DEFAULT_PAGE2.welcome_eyebrow,
    welcome_banner: DEFAULT_PAGE2.welcome_banner,
    welcome_salutation: DEFAULT_PAGE2.welcome_salutation,
    welcome_body: WELCOME_GUIDE_STATIC_DEFAULTS.welcome_body,
    welcome_signature: WELCOME_GUIDE_STATIC_DEFAULTS.welcome_signature,
    welcome_footer: DEFAULT_PAGE2.welcome_footer,
    ...DEFAULT_PAGE3,
    rules: DEFAULT_WELCOME_GUIDE_RULES.map((rule) => ({ ...rule })),
    ...DEFAULT_PAGE4,
    emergency_contacts: DEFAULT_WELCOME_GUIDE_EMERGENCY_CONTACTS.map((contact) => ({ ...contact })),
    ...DEFAULT_PAGE5,
    places: DEFAULT_WELCOME_GUIDE_PLACES.map((place) => ({ ...place })),
    ...DEFAULT_PAGE6,
    dining_spots: DEFAULT_WELCOME_GUIDE_DINING_SPOTS.map((spot) => ({ ...spot })),
    ...DEFAULT_PAGE7,
    checkout_items: DEFAULT_WELCOME_GUIDE_CHECKOUT_ITEMS.map((item) => ({ ...item }))
  }
}

/** Bio guide = Intro 1 & 2 de la section Hôte (personnalisation). */
export function welcomeGuideHostBioFromCopy(record: PropertyAdminRecord) {
  const host = record.content?.copy?.host

  return [host?.intro_1, host?.intro_2]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("\n\n")
}

/** Prénom / nom script = légende photo (section Hôte). */
export function welcomeGuideHostNameFromCopy(record: PropertyAdminRecord) {
  return record.content?.copy?.host?.caption?.trim() || ""
}

/** Complète les champs vides à partir du site et des valeurs par défaut. */
export function applyWelcomeGuideDefaultsFromRecord(
  guide: PropertyWelcomeGuide,
  record: PropertyAdminRecord
): PropertyWelcomeGuide {
  const copy = record.content?.copy
  const host = copy?.host
  const brandMeta = record.brand_meta?.trim() || ""
  const hostNameFromSite = welcomeGuideHostNameFromCopy(record)
  const hostBioFromSite = welcomeGuideHostBioFromCopy(record)

  const hostName = withDefault(guide.host_name, hostNameFromSite || WELCOME_GUIDE_STATIC_DEFAULTS.host_name)
  const hostBio = withDefault(guide.host_bio, hostBioFromSite || WELCOME_GUIDE_STATIC_DEFAULTS.host_bio)
  const rules = normalizeRules(guide.rules, record)
  const hostPhone = withDefault(guide.host_phone, WELCOME_GUIDE_STATIC_DEFAULTS.host_phone)
  const emergencyContacts = normalizeEmergencyContacts(guide.emergency_contacts, hostPhone).map(
    (contact, index) =>
      index === 0
        ? {
            ...contact,
            title: contact.title.trim() || DEFAULT_WELCOME_GUIDE_EMERGENCY_CONTACTS[0]!.title,
            text: withDefault(contact.text, hostPhone)
          }
        : contact
  )

  return {
    cover_image_path:
      welcomeGuideDedicatedImagePath(guide.cover_image_path, record.hero_image_path) ||
      record.hero_image_path?.trim() ||
      "",
    cover_title: withDefault(
      guide.cover_title,
      copy?.hero?.eyebrow?.trim() || WELCOME_GUIDE_STATIC_DEFAULTS.cover_title
    ),
    cover_subtitle: withDefault(
      guide.cover_subtitle,
      copy?.location?.intro?.trim() || brandMeta
    ),
    host_image_path: guide.host_image_path.trim() || record.host_photo_path?.trim() || "",
    host_name: hostName,
    host_section_title: withDefault(guide.host_section_title, DEFAULT_PAGE2.host_section_title),
    host_facts_intro: legacyString(guide.host_facts_intro),
    host_facts: legacyString(guide.host_facts),
    host_bio: hostBio,
    host_phone: withDefault(guide.host_phone, WELCOME_GUIDE_STATIC_DEFAULTS.host_phone),
    host_email: withDefault(guide.host_email, WELCOME_GUIDE_STATIC_DEFAULTS.host_email),
    wifi_network: withDefault(guide.wifi_network, DEFAULT_PAGE2.wifi_network),
    wifi_password: legacyString(guide.wifi_password),
    welcome_eyebrow: withDefault(guide.welcome_eyebrow, DEFAULT_PAGE2.welcome_eyebrow),
    welcome_banner: withDefault(guide.welcome_banner, DEFAULT_PAGE2.welcome_banner),
    welcome_salutation: withDefault(guide.welcome_salutation, DEFAULT_PAGE2.welcome_salutation),
    welcome_body: withDefault(guide.welcome_body, DEFAULT_WELCOME_GUIDE_BODY),
    welcome_signature: withDefault(
      guide.welcome_signature,
      host?.caption?.trim() || hostName || WELCOME_GUIDE_STATIC_DEFAULTS.welcome_signature
    ),
    welcome_footer: legacyString(guide.welcome_footer),
    rules_image_path: legacyString(guide.rules_image_path),
    rules_title: withDefault(guide.rules_title, DEFAULT_PAGE3.rules_title),
    rules_banner: withDefault(guide.rules_banner, DEFAULT_PAGE3.rules_banner),
    rules_footer: withDefault(guide.rules_footer, DEFAULT_PAGE3.rules_footer),
    rules,
    emergency_image_path:
      welcomeGuideDedicatedImagePath(guide.emergency_image_path, record.hero_image_path) ||
      record.hero_image_path?.trim() ||
      "",
    emergency_eyebrow: withDefault(guide.emergency_eyebrow, DEFAULT_PAGE4.emergency_eyebrow),
    emergency_banner: withDefault(guide.emergency_banner, DEFAULT_PAGE4.emergency_banner),
    emergency_intro: withDefault(guide.emergency_intro, DEFAULT_PAGE4.emergency_intro),
    emergency_contacts: emergencyContacts,
    places_city: withDefault(
      guide.places_city,
      guide.cover_subtitle.trim() || brandMeta || "Votre ville"
    ),
    places_title: withDefault(guide.places_title, DEFAULT_PAGE5.places_title),
    places: normalizePlaces(guide.places),
    dining_image_path:
      welcomeGuideDedicatedImagePath(guide.dining_image_path, record.hero_image_path) ||
      record.hero_image_path?.trim() ||
      "",
    dining_eyebrow: withDefault(guide.dining_eyebrow, DEFAULT_PAGE6.dining_eyebrow),
    dining_banner: withDefault(guide.dining_banner, DEFAULT_PAGE6.dining_banner),
    dining_intro: withDefault(guide.dining_intro, DEFAULT_PAGE6.dining_intro),
    dining_spots: normalizeDiningSpots(guide.dining_spots),
    checkout_title: withDefault(guide.checkout_title, DEFAULT_PAGE7.checkout_title),
    checkout_banner: withDefault(guide.checkout_banner, DEFAULT_PAGE7.checkout_banner),
    checkout_important: withDefault(guide.checkout_important, DEFAULT_PAGE7.checkout_important),
    checkout_footer: withDefault(guide.checkout_footer, DEFAULT_PAGE7.checkout_footer),
    checkout_items: normalizeCheckoutItems(guide.checkout_items)
  }
}

function normalizePage2And3(
  value: Record<string, unknown> | PropertyWelcomeGuide | undefined | null,
  record?: PropertyAdminRecord
): Omit<PropertyWelcomeGuide, "cover_image_path" | "cover_title" | "cover_subtitle"> {
  const v = value && typeof value === "object" ? value : {}

  return {
    host_image_path: legacyString(v.host_image_path),
    host_name: legacyString(v.host_name),
    host_section_title: legacyString(v.host_section_title) || DEFAULT_PAGE2.host_section_title,
    host_facts_intro: legacyString(v.host_facts_intro),
    host_facts: legacyString(v.host_facts),
    host_bio: legacyString(v.host_bio),
    host_phone: legacyString(v.host_phone),
    host_email: legacyString(v.host_email),
    wifi_network:
      legacyString(v.wifi_network) ||
      legacyString(v.wifi_name) ||
      legacyString(v.wifi_ssid) ||
      DEFAULT_PAGE2.wifi_network,
    wifi_password: legacyString(v.wifi_password) || legacyString(v.wifi_pass),
    welcome_eyebrow: legacyString(v.welcome_eyebrow) || DEFAULT_PAGE2.welcome_eyebrow,
    welcome_banner: legacyString(v.welcome_banner) || DEFAULT_PAGE2.welcome_banner,
    welcome_salutation: legacyString(v.welcome_salutation) || DEFAULT_PAGE2.welcome_salutation,
    welcome_body: legacyString(v.welcome_body),
    welcome_signature: legacyString(v.welcome_signature),
    welcome_footer: legacyString(v.welcome_footer),
    rules_image_path: legacyString(v.rules_image_path),
    rules_title: legacyString(v.rules_title),
    rules_banner: legacyString(v.rules_banner),
    rules_footer: legacyString(v.rules_footer),
    rules: normalizeRules(v.rules, record),
    emergency_image_path: legacyString(v.emergency_image_path),
    emergency_eyebrow: legacyString(v.emergency_eyebrow) || DEFAULT_PAGE4.emergency_eyebrow,
    emergency_banner: legacyString(v.emergency_banner) || DEFAULT_PAGE4.emergency_banner,
    emergency_intro: legacyString(v.emergency_intro),
    emergency_contacts: normalizeEmergencyContacts(v.emergency_contacts, legacyString(v.host_phone)),
    places_city: legacyString(v.places_city),
    places_title: legacyString(v.places_title) || DEFAULT_PAGE5.places_title,
    places: normalizePlaces(v.places),
    dining_image_path: legacyString(v.dining_image_path),
    dining_eyebrow: legacyString(v.dining_eyebrow) || DEFAULT_PAGE6.dining_eyebrow,
    dining_banner: legacyString(v.dining_banner) || DEFAULT_PAGE6.dining_banner,
    dining_intro: legacyString(v.dining_intro),
    dining_spots: normalizeDiningSpots(v.dining_spots),
    checkout_title: legacyString(v.checkout_title) || DEFAULT_PAGE7.checkout_title,
    checkout_banner: legacyString(v.checkout_banner) || DEFAULT_PAGE7.checkout_banner,
    checkout_important: legacyString(v.checkout_important),
    checkout_footer: legacyString(v.checkout_footer),
    checkout_items: normalizeCheckoutItems(v.checkout_items)
  }
}

/** Migration depuis l’ancien schéma (sections, footer, Wi‑Fi…). */
function migrateLegacyGuide(
  value: Record<string, unknown> | undefined | null,
  record?: PropertyAdminRecord
): PropertyWelcomeGuide {
  const copy = record?.content?.copy
  const host = copy?.host

  const base: PropertyWelcomeGuide = {
    cover_image_path: legacyString(value?.cover_image_path),
    cover_title:
      legacyString(value?.cover_title) ||
      legacyString(copy?.hero?.eyebrow) ||
      WELCOME_GUIDE_STATIC_DEFAULTS.cover_title,
    cover_subtitle:
      legacyString(value?.cover_subtitle) ||
      legacyString(copy?.location?.intro) ||
      legacyString(record?.brand_meta) ||
      "",
    host_image_path: legacyString(record?.host_photo_path),
    host_name: legacyString(host?.caption),
    host_section_title: DEFAULT_PAGE2.host_section_title,
    host_facts_intro: "",
    host_facts: "",
    host_bio: [legacyString(host?.intro_1), legacyString(host?.intro_2)].filter(Boolean).join("\n\n"),
    host_phone: "",
    host_email: "",
    wifi_network:
      legacyString(value?.wifi_network) ||
      legacyString(value?.wifi_name) ||
      legacyString(value?.wifi_ssid),
    wifi_password: legacyString(value?.wifi_password) || legacyString(value?.wifi_pass),
    welcome_eyebrow: DEFAULT_PAGE2.welcome_eyebrow,
    welcome_banner: DEFAULT_PAGE2.welcome_banner,
    welcome_salutation: DEFAULT_PAGE2.welcome_salutation,
    welcome_body: "",
    welcome_signature: legacyString(host?.caption),
    welcome_footer: "",
    rules_image_path: "",
    rules_title: "",
    rules_banner: "",
    rules_footer: "",
    rules: [],
    ...DEFAULT_PAGE4,
    emergency_contacts: [],
    ...DEFAULT_PAGE5,
    places: [],
    ...DEFAULT_PAGE6,
    dining_spots: [],
    ...DEFAULT_PAGE7,
    checkout_items: []
  }

  return record ? applyWelcomeGuideDefaultsFromRecord(base, record) : base
}

export function normalizeWelcomeGuide(
  value: PropertyWelcomeGuide | Record<string, unknown> | undefined | null,
  _fallbackBrandName = "",
  record?: PropertyAdminRecord
): PropertyWelcomeGuide {
  const empty = createEmptyWelcomeGuide()

  if (!value || typeof value !== "object") {
    return record ? applyWelcomeGuideDefaultsFromRecord(empty, record) : empty
  }

  let guide: PropertyWelcomeGuide

  if ("cover_title" in value) {
    guide = {
      cover_image_path: legacyString(value.cover_image_path),
      cover_title: legacyString(value.cover_title) || empty.cover_title,
      cover_subtitle: legacyString(value.cover_subtitle),
      ...normalizePage2And3(value, record)
    }
  } else {
    guide = migrateLegacyGuide(value as Record<string, unknown>, record)
    return guide
  }

  return record ? applyWelcomeGuideDefaultsFromRecord(guide, record) : guide
}

export function welcomeGuideDisplayName(guide: PropertyWelcomeGuide, brandName: string) {
  return guide.cover_title.trim() || brandName.trim() || "Votre logement"
}

export function buildWelcomeGuideDraftFromProperty(
  record: PropertyAdminRecord,
  _options?: { hostEmail?: string }
): PropertyWelcomeGuide {
  const copy = record.content?.copy

  return normalizeWelcomeGuide(
    {
      cover_image_path: record.hero_image_path || "",
      cover_title: copy?.hero?.eyebrow?.trim() || "",
      cover_subtitle: copy?.location?.intro?.trim() || record.brand_meta?.trim() || "",
      host_image_path: record.host_photo_path || "",
      host_name: "",
      host_bio: "",
      welcome_body: "",
      welcome_signature: ""
    },
    record.brand_name,
    record
  )
}

/** Découpe un texte multiligne en paragraphes ou puces non vides. */
export function welcomeGuideTextLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}
