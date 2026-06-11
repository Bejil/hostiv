import { adminUiFormat } from "./admin-ui"
import type { HostivLocale } from "../types/hostiv-locale"

export type SiteVisualGalleryCta = {
  eyebrow: string
  title: string
  text: string
  action: string
}

export type SiteRulesScheduleLabels = {
  checkIn: string
  checkOut: string
}

export type SiteUiLabels = {
  host: {
    cta: string
  }
  featured: {
    seeAllSpaces: string
  }
  platform: {
    averageRating: string
  }
  visualGalleryCta: SiteVisualGalleryCta
  rulesSchedule: SiteRulesScheduleLabels
  booking: {
    dates: string
    travelers: string
    book: string
    selectDates: string
    bookAheadNotice: string
    arrival: string
    departure: string
    chooseTravelers: string
    travelersLimitNote: string
    /** Libellé stepper voyageurs (ex. « Adultes »). */
    adultsLabel: string
    adultsAge: string
    children: string
    childrenAge: string
    baby: string
    babies: string
    babyAge: string
    calendarWeekdays: string[]
    datesPopoverNote: string
    night: string
    nights: string
    adult: string
    adults: string
    child: string
    childrenPlural: string
    babySingular: string
    babiesPlural: string
    traveler: string
    travelersPlural: string
    dateMetaMaxStay: string
    guestMetaMax: string
  }
  pricing: {
    nightTitle: string
    nightText: string
    weekTitle: string
    weekText: string
    monthTitle: string
    monthText: string
  }
}

const SITE_UI_FR: SiteUiLabels = {
  host: {
    cta: "Réserver votre séjour"
  },
  featured: {
    seeAllSpaces: "Voir tous les espaces de vie ▸"
  },
  platform: {
    averageRating: "Note moyenne de {rating}"
  },
  visualGalleryCta: {
    eyebrow: "Galerie complète",
    title: "Voir tous les espaces",
    text: "Parcourez chaque pièce en images, de jour comme de nuit.",
    action: "Explorer la galerie ▸"
  },
  rulesSchedule: {
    checkIn: "Heure d'arrivée",
    checkOut: "Heure de départ"
  },
  booking: {
    dates: "Dates",
    travelers: "Voyageurs",
    book: "Réserver",
    selectDates: "Sélectionnez vos dates",
    bookAheadNotice: "Réservez au moins {days} jours à l'avance.",
    arrival: "Arrivée",
    departure: "Départ",
    chooseTravelers: "Choisissez vos voyageurs",
    travelersLimitNote: "Adultes + enfants limités à {max}. 1 bébé maximum.",
    adultsLabel: "Adultes",
    adultsAge: "13 ans et plus",
    children: "Enfants",
    childrenAge: "De 2 à 12 ans",
    baby: "bébé",
    babies: "Bébé",
    babyAge: "Moins de 2 ans",
    calendarWeekdays: ["L", "M", "M", "J", "V", "S", "D"],
    datesPopoverNote:
      "{count} {nights} sélectionnée(s). Séjour autorisé : de {min} à {max} nuits.",
    night: "nuit",
    nights: "nuits",
    adult: "adulte",
    adults: "adultes",
    child: "enfant",
    childrenPlural: "enfants",
    babySingular: "bébé",
    babiesPlural: "bébés",
    traveler: "voyageur",
    travelersPlural: "voyageurs",
    dateMetaMaxStay: "{nights} · séjour max {max} nuits",
    guestMetaMax: "{travelers} max · 1 bébé max"
  },
  pricing: {
    nightTitle: "Nuitée",
    nightText: "À partir d'une nuit",
    weekTitle: "Séjour d'une semaine",
    weekText: "Dès {min} nuits",
    monthTitle: "Séjour d'un mois",
    monthText: "Dès {min} nuits"
  }
}

const SITE_UI_EN: SiteUiLabels = {
  host: {
    cta: "Book your stay"
  },
  featured: {
    seeAllSpaces: "See all living spaces ▸"
  },
  platform: {
    averageRating: "Average rating of {rating}"
  },
  visualGalleryCta: {
    eyebrow: "Full gallery",
    title: "See all spaces",
    text: "Browse every room in photos, day and night.",
    action: "Explore the gallery ▸"
  },
  rulesSchedule: {
    checkIn: "Check-in time",
    checkOut: "Check-out time"
  },
  booking: {
    dates: "Dates",
    travelers: "Guests",
    book: "Book",
    selectDates: "Select your dates",
    bookAheadNotice: "Book at least {days} days in advance.",
    arrival: "Check-in",
    departure: "Check-out",
    chooseTravelers: "Choose your guests",
    travelersLimitNote: "Adults + children limited to {max}. 1 baby maximum.",
    adultsLabel: "Adults",
    adultsAge: "Ages 13 and up",
    children: "Children",
    childrenAge: "Ages 2–12",
    baby: "baby",
    babies: "Baby",
    babyAge: "Under 2",
    calendarWeekdays: ["M", "T", "W", "T", "F", "S", "S"],
    datesPopoverNote: "{count} {nights} selected. Stay allowed: {min} to {max} nights.",
    night: "night",
    nights: "nights",
    adult: "adult",
    adults: "adults",
    child: "child",
    childrenPlural: "children",
    babySingular: "baby",
    babiesPlural: "babies",
    traveler: "guest",
    travelersPlural: "guests",
    dateMetaMaxStay: "{nights} · max stay {max} nights",
    guestMetaMax: "Up to {travelers} · 1 baby max"
  },
  pricing: {
    nightTitle: "Nightly rate",
    nightText: "From one night",
    weekTitle: "One-week stay",
    weekText: "From {min} nights",
    monthTitle: "One-month stay",
    monthText: "From {min} nights"
  }
}

export function getSiteUiLabels(locale: HostivLocale): SiteUiLabels {
  return locale === "en" ? SITE_UI_EN : SITE_UI_FR
}

export function siteUiFormat(
  template: string,
  values: Record<string, string | number>
) {
  return adminUiFormat(template, values)
}
