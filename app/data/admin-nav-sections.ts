export type AdminTopSectionId = "general" | "images" | "reservations" | "payouts" | "account"

export type AdminNavSectionId =
  | "template"
  | "header"
  | "seo"
  | "platforms"
  | "host"
  | "featured"
  | "benefits"
  | "location"
  | "media"
  | "booking"
  | "amenities"
  | "reviews"
  | "rules"

export type AdminSectionId = AdminTopSectionId | AdminNavSectionId

type AdminNavIcon =
  | "search"
  | "layout"
  | "user"
  | "heart"
  | "star"
  | "map"
  | "image"
  | "calendar"
  | "card"
  | "list"
  | "quote"
  | "text"
  | "settings"

export type AdminNavItem = {
  id: AdminSectionId
  label: string
  icon: AdminNavIcon
  title: string
  description: string
}

export const adminTopNavItems: AdminNavItem[] = [
  {
    id: "general",
    label: "Général",
    icon: "settings",
    title: "Général",
    description: "Publication, favicon, SEO et contact réservations."
  },
  {
    id: "reservations",
    label: "Réservations",
    icon: "calendar",
    title: "Réservations",
    description: "Flux ICS et calendrier des dates réservées."
  },
  {
    id: "payouts",
    label: "Versements",
    icon: "card",
    title: "Versements",
    description: "Compte Stripe Connect et réception des paiements."
  },
  {
    id: "account",
    label: "Compte",
    icon: "user",
    title: "Mon compte",
    description: "Prénom, nom, e-mail et suppression du compte Hostiv."
  },
  {
    id: "images",
    label: "Images",
    icon: "image",
    title: "Galerie",
    description: "Photos de la galerie organisées par sections avec titre et sous-titre."
  }
]

export const adminNavItems: AdminNavItem[] = [
  {
    id: "template",
    label: "Template",
    icon: "layout",
    title: "Template",
    description: "Ambiance visuelle, UI et UX appliquées au site public."
  },
  {
    id: "header",
    label: "En-tête",
    icon: "layout",
    title: "En-tête",
    description: "Logo, nom de marque et sous-titre affichés dans la barre de navigation."
  },
  {
    id: "seo",
    label: "Moteur de recherche",
    icon: "search",
    title: "Moteur de recherche",
    description: "Image de fond, textes et bandeau de réservation en haut de page."
  },
  {
    id: "platforms",
    label: "Plateformes",
    icon: "layout",
    title: "Plateformes",
    description: "Textes d’introduction et liens vers Airbnb, Booking, etc."
  },
  {
    id: "host",
    label: "Hôte",
    icon: "user",
    title: "Hôte",
    description: "Présentation de l’hôte et photo associée."
  },
  {
    id: "featured",
    label: "Coups de cœur",
    icon: "heart",
    title: "Coups de cœur",
    description: "Espaces mis en avant sur la page d’accueil."
  },
  {
    id: "benefits",
    label: "Atouts",
    icon: "star",
    title: "Atouts",
    description: "Cartes des points forts du logement."
  },
  {
    id: "location",
    label: "Localisation",
    icon: "map",
    title: "Localisation",
    description: "Carte, adresse et points d’intérêt du quartier."
  },
  {
    id: "media",
    label: "Exploration",
    icon: "image",
    title: "Exploration",
    description: "Galerie, cartes visuelles et textes de la section visuelle."
  },
  {
    id: "booking",
    label: "Tarifs",
    icon: "calendar",
    title: "Tarifs & réservation",
    description: "Grille tarifaire, textes et e-mails de confirmation."
  },
  {
    id: "amenities",
    label: "Équipements",
    icon: "list",
    title: "Équipements",
    description: "Cartes équipements et textes de la section."
  },
  {
    id: "reviews",
    label: "Verbatim",
    icon: "quote",
    title: "Verbatim",
    description: "Avis clients et fond de la section témoignages."
  },
  {
    id: "rules",
    label: "Règlement",
    icon: "text",
    title: "Règlement",
    description: "Horaires, règles de la maison et textes de la section."
  }
]

export const adminAllNavItems: AdminNavItem[] = [...adminTopNavItems, ...adminNavItems]

const adminSectionIdSet = new Set(adminAllNavItems.map((item) => item.id))

export function isAdminSectionId(value: string): value is AdminSectionId {
  return adminSectionIdSet.has(value as AdminSectionId)
}
