import type { PropertyAdminRecord } from "../types/property-admin"
import { normalizeHostivSubscriptionPlan } from "./hostiv-subscription-plan"
import type {
  PropertyBenefitCard,
  PropertyBookingConfig,
  PropertyLocation,
  PropertyPlatformLink,
  PropertyReview,
  PropertySiteContent,
  PropertySiteCopy,
  PropertyVisualCard
} from "../types/property-site"
import { normalizeBenefitIconId } from "../data/benefit-icons"
import { normalizeLocationHighlightIconId } from "../data/location-highlight-icons"
import { parseSiteTemplateId } from "../data/site-templates"
import { normalizeReviewRatingValue, ratingToStars } from "./platform-rating-stars"
import { withAmenityPreviewHasMore } from "./amenity-preview"
import { normalizeBookingConfig } from "./booking-config"
import { normalizeCalendarConfig } from "./calendar-config"

const DEFAULT_LOCATION: PropertyLocation = {
  address: "",
  latitude: 48.85,
  longitude: 2.35,
  radius_meters: 400
}

function normalizeCopy(copy: PropertySiteCopy | undefined, brandName: string, brandMeta: string): PropertySiteCopy {
  const base = copy ?? ({} as PropertySiteCopy)

  return {
    ...base,
    header: {
      brand_name: brandName,
      brand_meta: brandMeta,
      logo_alt: brandName
    },
    hero: (() => {
      const hero = base.hero ?? { eyebrow: "", title: "", text: "", image_alt: "" }
      const title = hero.title ?? ""

      return {
        ...hero,
        image_alt: title
      }
    })(),
    platform_stats: base.platform_stats ?? { eyebrow: "", title: "", intro: "" },
    host: (() => {
      const host = base.host ?? {
        caption: "",
        eyebrow: "",
        title: "",
        quote: "",
        intro_1: "",
        intro_2: "",
        image_alt: "",
        cta: ""
      }
      const caption = host.caption ?? ""

      return {
        ...host,
        image_alt: caption
      }
    })(),
    spaces: base.spaces ?? { eyebrow: "", title: "", intro: "" },
    benefits: base.benefits ?? { eyebrow: "", title: "" },
    location: base.location ?? { eyebrow: "", title: "", intro: "", lead: "" },
    visual: base.visual ?? {
      eyebrow: "",
      title: "",
      intro: "",
      gallery_cta_eyebrow: "",
      gallery_cta_title: "",
      gallery_cta_text: "",
      gallery_cta_action: ""
    },
    pricing: base.pricing ?? { eyebrow: "", title: "", intro: "" },
    amenities: base.amenities ?? { eyebrow: "", title: "", intro: "" },
    reviews: base.reviews ?? { eyebrow: "", title: "" },
    rules: base.rules ?? {
      eyebrow: "",
      title: "",
      intro: "",
      check_in_label: "",
      check_in_time: "",
      check_out_label: "",
      check_out_time: ""
    },
    booking: base.booking ?? {
      price_recap_note: "",
      price_recap_note_payment: ""
    }
  }
}

function normalizeNeighborhoodHighlights(
  items: PropertyNeighborhoodHighlight[] | undefined
): PropertyNeighborhoodHighlight[] {
  return (items ?? []).map((item) => ({
    icon: normalizeLocationHighlightIconId(item.icon),
    title: String(item.title ?? ""),
    text: String(item.text ?? "")
  }))
}

function normalizeBenefitCards(cards: PropertyBenefitCard[] | undefined): PropertyBenefitCard[] {
  return (cards ?? []).map((card) => ({
    ...card,
    icon: normalizeBenefitIconId(String(card.icon ?? ""))
  }))
}

function normalizeVisualCards(cards: PropertyVisualCard[] | undefined): PropertyVisualCard[] {
  return (cards ?? []).map((card) => ({
    title: String(card.title ?? ""),
    text: String(card.text ?? ""),
    image: String(card.image ?? "")
  }))
}

function normalizeReviews(reviews: PropertyReview[] | undefined): PropertyReview[] {
  return (reviews ?? []).map((review) => ({
    ...review,
    rating: normalizeReviewRatingValue(review.rating)
  }))
}

function normalizePlatformLinks(links: PropertyPlatformLink[] | undefined): PropertyPlatformLink[] {
  return (links ?? []).map((link) => ({
    ...link,
    hidden: Boolean(link.hidden),
    stars: ratingToStars(link.rating),
    label: ""
  }))
}

function normalizeContent(
  content: PropertySiteContent | undefined,
  brandName: string,
  brandMeta: string
): PropertySiteContent {
  const base = content ?? ({} as PropertySiteContent)

  return {
    template: {
      id: parseSiteTemplateId(base.template?.id)
    },
    copy: normalizeCopy(base.copy, brandName, brandMeta),
    email: base.email ?? { access_lines: [] },
    featured_spaces: base.featured_spaces ?? [],
    space_gallery_categories: base.space_gallery_categories ?? [],
    benefit_cards: normalizeBenefitCards(base.benefit_cards),
    visual_cards: normalizeVisualCards(base.visual_cards),
    neighborhood_highlights: normalizeNeighborhoodHighlights(base.neighborhood_highlights),
    house_rules: base.house_rules ?? [],
    platform_links: normalizePlatformLinks(base.platform_links),
    reviews: normalizeReviews(base.reviews),
    amenity_catalog: base.amenity_catalog ?? [],
    amenity_preview_sections: withAmenityPreviewHasMore(base.amenity_preview_sections ?? [])
  }
}

export function normalizePropertyAdminRecord(raw: PropertyAdminRecord): PropertyAdminRecord {
  const brandName = String(raw.brand_name ?? "")
  const brandMeta = String(raw.brand_meta ?? "")
  const content = normalizeContent(raw.content, brandName, brandMeta)
  const heroTitle = content.copy.hero?.title ?? ""

  return {
    id: String(raw.id),
    slug: String(raw.slug),
    published: Boolean(raw.published),
    brand_name: brandName,
    brand_meta: brandMeta,
    logo_path: String(raw.logo_path ?? ""),
    favicon_path: String(raw.favicon_path || raw.logo_path || ""),
    seo_title: String(raw.seo_title ?? ""),
    seo_description: String(raw.seo_description ?? ""),
    hero_image_path: String(raw.hero_image_path ?? ""),
    hero_image_alt: heroTitle,
    testimonials_bg_path: String(raw.testimonials_bg_path ?? ""),
    host_photo_path: String(raw.host_photo_path ?? ""),
    subscription_plan: normalizeHostivSubscriptionPlan(raw.subscription_plan),
    booking_notify_email: String(raw.booking_notify_email ?? ""),
    booking_config: normalizeBookingConfig(raw.booking_config),
    calendar_config: normalizeCalendarConfig(raw.calendar_config),
    location: {
      ...DEFAULT_LOCATION,
      ...(raw.location ?? {}),
      address: String(raw.location?.address ?? DEFAULT_LOCATION.address),
      latitude: Number(raw.location?.latitude ?? DEFAULT_LOCATION.latitude),
      longitude: Number(raw.location?.longitude ?? DEFAULT_LOCATION.longitude),
      radius_meters: Number(raw.location?.radius_meters ?? DEFAULT_LOCATION.radius_meters)
    },
    content: {
      ...content,
      copy: {
        ...content.copy,
        hero: {
          ...content.copy.hero,
          image_alt: heroTitle
        }
      }
    }
  }
}

export function clonePropertyAdminRecord(record: PropertyAdminRecord): PropertyAdminRecord {
  const access = record.subscription_access
  const cloned = normalizePropertyAdminRecord(
    JSON.parse(JSON.stringify(record)) as PropertyAdminRecord
  )

  if (access) {
    cloned.subscription_access = access
  }

  return cloned
}
