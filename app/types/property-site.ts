import type { BenefitIconId } from "../data/benefit-icons"
import type { LocationHighlightIconId } from "../data/location-highlight-icons"
import type { SiteTemplateId } from "../data/site-templates"
import type { AmenityPreviewSection, AmenitySection } from "./amenity"
import type { PropertyWelcomeGuide } from "./welcome-guide"
import type { HostivSubscriptionPlan } from "../utils/hostiv-subscription-plan"

export type PropertyBookingConfig = {
  min_booking_notice_days: number
  min_stay_nights: number
  max_stay_nights: number
  max_travelers: number
  max_babies: number
  base_night_price_eur: number
  week_discount_enabled: boolean
  week_min_nights: number
  week_discount_rate: number
  month_discount_enabled: boolean
  month_min_nights: number
  month_discount_rate: number
  included_main_guests: number
  extra_main_guest_per_night_eur: number
  /** % remboursé si annulation assez tôt (0 = politique masquée). */
  cancellation_refund_percent: number
  /** Délai minimum avant la date d'arrivée (en jours) pour bénéficier du remboursement. */
  cancellation_days_before_checkin: number
}

export type PropertyCalendarFeed = {
  id: string
  name: string
  url: string
  enabled: boolean
}

export type PropertyCalendarConfig = {
  ics_feeds: PropertyCalendarFeed[]
}

export type PropertyLocation = {
  address: string
  latitude: number
  longitude: number
  radius_meters: number
}

export type PropertyFeaturedSpace = {
  title: string
  text: string
  image: string
  tag: string
  gallery_category_id: string
}

export type PropertyGalleryCategory = {
  id: string
  title: string
  description: string
  images: string[]
}

export type PropertyBenefitCard = {
  icon: BenefitIconId
  title: string
  text: string
}

export type PropertyVisualCard = {
  title: string
  text: string
  image: string
  gallery_category_id?: string
}

export type PropertyNeighborhoodHighlight = {
  icon: LocationHighlightIconId
  title: string
  text: string
}

export type PropertyHouseRule = {
  title: string
  text: string
}

export type PropertyPlatformLink = {
  id: string
  name: string
  rating: string
  stars: string
  label: string
  logo: string
  url: string
  /** Icône (plateformes personnalisées uniquement). */
  icon?: string
  /** Couleur de fond de l’icône (plateformes personnalisées). */
  icon_bg?: string
  /** Plateforme preset masquée sur le site public (Airbnb, Booking, Abritel). */
  hidden?: boolean
}

export type PropertyReview = {
  id: string
  author: string
  date: string
  quote: string
  /** Note libre (ex. 4,97/5, 5/10, 18/50) — convertie en étoiles sur 5 à l’affichage. */
  rating: string
  /** Lien vers l’avis voyageur source (import admin). */
  guest_review_id?: string
}

export type PropertySiteCopy = {
  header: {
    brand_name: string
    brand_meta: string
    logo_alt: string
  }
  hero: {
    eyebrow: string
    title: string
    text: string
    image_alt: string
  }
  platform_stats: {
    eyebrow: string
    title: string
    intro: string
  }
  host: {
    caption: string
    eyebrow: string
    title: string
    quote: string
    intro_1: string
    intro_2: string
    image_alt: string
    cta: string
  }
  spaces: {
    eyebrow: string
    title: string
    intro: string
  }
  benefits: {
    eyebrow: string
    title: string
  }
  location: {
    eyebrow: string
    title: string
    intro: string
    lead: string
  }
  visual: {
    eyebrow: string
    title: string
    intro: string
    gallery_cta_eyebrow: string
    gallery_cta_title: string
    gallery_cta_text: string
    gallery_cta_action: string
  }
  pricing: {
    eyebrow: string
    title: string
    intro: string
  }
  amenities: {
    eyebrow: string
    title: string
    intro: string
  }
  reviews: {
    eyebrow: string
    title: string
  }
  rules: {
    eyebrow: string
    title: string
    intro: string
    check_in_label: string
    check_in_time: string
    check_out_label: string
    check_out_time: string
  }
  booking: {
    price_recap_note: string
    price_recap_note_payment: string
  }
}

export type PropertySiteEmailContent = {
  access_lines: string[]
}

/** Contenu FR d’origine conservé pour la résolution locale (évite le repli FR sur l’UI système). */
export type PropertySiteLocaleBase = {
  copy: PropertySiteCopy
  featured_spaces: PropertyFeaturedSpace[]
  space_gallery_categories: PropertyGalleryCategory[]
  benefit_cards: PropertyBenefitCard[]
  visual_cards: PropertyVisualCard[]
  neighborhood_highlights: PropertyNeighborhoodHighlight[]
  house_rules: PropertyHouseRule[]
  reviews: PropertyReview[]
}

export type PropertySiteContent = {
  template: {
    id: SiteTemplateId | null
  }
  copy: PropertySiteCopy
  /** Textes de section en anglais (parallèle à `copy`). */
  copy_en?: PropertySiteCopy
  /** Snapshot FR avant fusion locale (rempli par `applySiteContentLocale`). */
  locale_base?: PropertySiteLocaleBase
  email: PropertySiteEmailContent
  featured_spaces: PropertyFeaturedSpace[]
  featured_spaces_en?: PropertyFeaturedSpace[]
  space_gallery_categories: PropertyGalleryCategory[]
  space_gallery_categories_en?: PropertyGalleryCategory[]
  benefit_cards: PropertyBenefitCard[]
  benefit_cards_en?: PropertyBenefitCard[]
  visual_cards: PropertyVisualCard[]
  visual_cards_en?: PropertyVisualCard[]
  neighborhood_highlights: PropertyNeighborhoodHighlight[]
  neighborhood_highlights_en?: PropertyNeighborhoodHighlight[]
  house_rules: PropertyHouseRule[]
  house_rules_en?: PropertyHouseRule[]
  platform_links: PropertyPlatformLink[]
  reviews: PropertyReview[]
  reviews_en?: PropertyReview[]
  amenity_catalog: AmenitySection[]
  amenity_preview_sections: AmenityPreviewSection[]
  welcome_guide: PropertyWelcomeGuide
  /** Guide d’accueil PDF en anglais (parallèle à `welcome_guide`). */
  welcome_guide_en?: PropertyWelcomeGuide
}

export type PropertySiteRecord = {
  id: string
  slug: string
  published: boolean
  brand_name: string
  brand_meta: string
  logo_path: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  seo_keywords_en: string
  seo_keywords_fr_enabled: boolean
  seo_keywords_en_enabled: boolean
  seo_og_title: string
  seo_og_description: string
  seo_og_image_path: string
  seo_twitter_card: "summary" | "summary_large_image"
  seo_noindex: boolean
  hero_image_path: string
  hero_image_alt: string
  testimonials_bg_path: string
  host_photo_path: string
  /** true si Stripe Connect de l’hôte accepte les paiements carte */
  stripe_payments_ready?: boolean
  owner_user_id?: string | null
  subscription_plan?: HostivSubscriptionPlan
  booking_config: PropertyBookingConfig
  calendar_config?: PropertyCalendarConfig
  location: PropertyLocation
  content: PropertySiteContent
}

export type PropertySiteRow = {
  id: string
  slug: string
  published: boolean
  brand_name: string
  brand_meta: string | null
  logo_path: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  seo_keywords_en: string
  seo_keywords_fr_enabled: boolean
  seo_keywords_en_enabled: boolean
  seo_og_title: string
  seo_og_description: string
  seo_og_image_path: string
  seo_twitter_card: "summary" | "summary_large_image"
  seo_noindex: boolean
  hero_image_path: string
  hero_image_alt: string | null
  testimonials_bg_path: string
  host_photo_path: string
  owner_user_id?: string | null
  subscription_plan?: string | null
  booking_config: PropertyBookingConfig
  calendar_config?: PropertyCalendarConfig | null
  location: PropertyLocation
  content: PropertySiteContent
  created_at?: string
  updated_at?: string
}

export type PropertySiteInsert = Omit<PropertySiteRecord, "id"> & { id?: string }
