import type { WelcomeGuideRuleIcon } from "../data/welcome-guide-rule-icons"

export type { WelcomeGuideRuleIcon }

export type WelcomeGuideRule = {
  icon: WelcomeGuideRuleIcon
  title: string
  text: string
}

export type WelcomeGuideCheckoutItem = {
  icon: WelcomeGuideRuleIcon
  title: string
  description: string
}

export type WelcomeGuidePlace = {
  image_path: string
  title: string
  description: string
  address: string
}

export type WelcomeGuideEmergencyContact = {
  title: string
  /** Quand appeler ce numéro (affiché sous le libellé dans le PDF). */
  description: string
  text: string
  /** Mention discrète sous le numéro (horaires, tarif, etc.). */
  note: string
}

/** Adresse ou établissement (page 5 — restauration). */
export type WelcomeGuideDiningSpot = {
  title: string
  description: string
  /** Adresse, lien ou indication d’accès. */
  text: string
  /** Horaires, réservation, fourchette de prix… */
  note: string
}

export type PropertyWelcomeGuide = {
  /** Page 1 — couverture */
  cover_image_path: string
  cover_title: string
  cover_subtitle: string

  /** Page 2 — colonne hôte (vide = photo hôte du site). */
  host_image_path: string
  host_name: string
  host_section_title: string
  /** @deprecated Conservé pour migration JSON. */
  host_facts_intro: string
  /** @deprecated Conservé pour migration JSON. */
  host_facts: string
  host_bio: string
  host_phone: string
  host_email: string
  /** Page 2 — accès Wi‑Fi (colonne lettre d’accueil). */
  wifi_network: string
  wifi_password: string
  /** Page 2 — stationnement (pied de page). */
  parking_street: string
  parking_payment: string
  parking_note: string

  /** Page 2 — lettre d’accueil */
  welcome_eyebrow: string
  welcome_banner: string
  welcome_salutation: string
  welcome_body: string
  welcome_signature: string
  /** @deprecated Conservé pour migration JSON. */
  welcome_footer: string

  /** Page 3 — règles (liste modifiable, max. 7). */
  /** @deprecated Ancienne maquette avec photo d’en-tête. */
  rules_image_path: string
  rules_title: string
  /** Sous-titre sous le titre principal (ex. • Merci de respecter notre logement •). */
  rules_banner: string
  /** Message de clôture en bas de page. */
  rules_footer: string
  rules: WelcomeGuideRule[]

  /** Page 4 — numéros d’urgence (grille modifiable, max. 6). */
  emergency_image_path: string
  emergency_eyebrow: string
  emergency_banner: string
  emergency_intro: string
  emergency_contacts: WelcomeGuideEmergencyContact[]

  /** Page 5 — lieux à visiter (liste modifiable, max. 4). */
  places_city: string
  places_title: string
  places: WelcomeGuidePlace[]

  /** Page 6 — se restaurer ou boire un verre (liste modifiable, max. 8). */
  dining_image_path: string
  dining_eyebrow: string
  dining_banner: string
  dining_intro: string
  dining_spots: WelcomeGuideDiningSpot[]

  /** Page 7 — check-out (liste modifiable, max. 8). */
  checkout_title: string
  checkout_banner: string
  /** Bloc d’alerte sous l’en-tête (prochains voyageurs, ménage, etc.). */
  checkout_important: string
  checkout_items: WelcomeGuideCheckoutItem[]
  checkout_footer: string
}
