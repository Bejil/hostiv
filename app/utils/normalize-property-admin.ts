import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertyAdminAccess } from "../types/property-cohost"
import {
  buildHostivPlatformAdminSubscriptionAccess,
  buildHostivSubscriptionAccess,
  isHostivPlatformAdminSubscriptionAccess,
  type HostivSubscriptionAccess
} from "./hostiv-subscription-access"
import { normalizeHostivSubscriptionPlan } from "./hostiv-subscription-plan"
import { applyDerivedPropertySeo } from "./derive-property-seo"
import { joinSeoKeywords, parseSeoKeywords } from "./seo-keywords"
import { createEmptyWelcomeGuide, normalizeWelcomeGuide } from "./welcome-guide-content"
import type {
  PropertyBenefitCard,
  PropertyBookingConfig,
  PropertyLocation,
  PropertyNeighborhoodHighlight,
  PropertyPlatformLink,
  PropertyReview,
  PropertySiteContent,
  PropertySiteCopy,
  PropertyVisualCard
} from "../types/property-site"
import { normalizeBenefitIconId } from "../data/benefit-icons"
import { normalizeLocationHighlightIconId } from "../data/location-highlight-icons"
import { normalizeSiteTemplate } from "../data/site-layouts"
import { normalizeReviewRatingValue, ratingToStars } from "./platform-rating-stars"
import { isPresetPlatformId } from "../data/admin-platform-tabs"
import {
  DEFAULT_PLATFORM_CUSTOM_ICON,
  DEFAULT_PLATFORM_ICON_BG,
  normalizePlatformCustomIconId,
  normalizePlatformIconBg
} from "../data/platform-custom-icons"
import { resolvePlatformLinkHref } from "./platform-links"
import { resolvePlatformLogoPath } from "./platform-logo"
import { withAmenityPreviewHasMore } from "./amenity-preview"
import { fromTimeInputValue } from "./house-rules-time"
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
    reviews: base.reviews ?? { eyebrow: "", title: "", intro: "" },
    rules: (() => {
      const rules = base.rules ?? {
        eyebrow: "",
        title: "",
        intro: "",
        check_in_label: "",
        check_in_time: "",
        check_out_label: "",
        check_out_time: ""
      }

      return {
        ...rules,
        check_in_time: fromTimeInputValue(rules.check_in_time ?? ""),
        check_out_time: fromTimeInputValue(rules.check_out_time ?? "")
      }
    })(),
    booking: base.booking ?? {
      price_recap_note: "",
      price_recap_note_payment: ""
    }
  }
}

function normalizeNeighborhoodHighlights(
  items: PropertyNeighborhoodHighlight[] | undefined
): PropertyNeighborhoodHighlight[] {
  return (items ?? [])
    .filter((item): item is PropertyNeighborhoodHighlight => Boolean(item))
    .map((item) => ({
      icon: normalizeLocationHighlightIconId(item.icon),
      title: String(item.title ?? ""),
      text: String(item.text ?? "")
    }))
}

function normalizeBenefitCards(cards: PropertyBenefitCard[] | undefined): PropertyBenefitCard[] {
  return (cards ?? [])
    .filter((card): card is PropertyBenefitCard => Boolean(card))
    .map((card) => ({
      ...card,
      title: String(card.title ?? ""),
      text: String(card.text ?? ""),
      icon: normalizeBenefitIconId(String(card.icon ?? ""))
    }))
}

function normalizeVisualCards(cards: PropertyVisualCard[] | undefined): PropertyVisualCard[] {
  return (cards ?? [])
    .filter((card): card is PropertyVisualCard => Boolean(card))
    .map((card) => ({
      title: String(card.title ?? ""),
      text: String(card.text ?? ""),
      image: String(card.image ?? "")
    }))
}

function normalizeReviews(reviews: PropertyReview[] | undefined): PropertyReview[] {
  return (reviews ?? [])
    .filter((review): review is PropertyReview => Boolean(review))
    .map((review) => ({
      ...review,
      rating: normalizeReviewRatingValue(review.rating)
    }))
}

function normalizePlatformLinks(links: PropertyPlatformLink[] | undefined): PropertyPlatformLink[] {
  return (links ?? [])
    .filter((link): link is PropertyPlatformLink => Boolean(link))
    .map((link) => {
      const isPreset = isPresetPlatformId(link.id)

      return {
        ...link,
        logo: isPreset ? resolvePlatformLogoPath(String(link.logo ?? ""), link.id) : "",
        url: resolvePlatformLinkHref(String(link.url ?? ""), link.id),
        icon: isPreset ? undefined : normalizePlatformCustomIconId(link.icon ?? DEFAULT_PLATFORM_CUSTOM_ICON),
        icon_bg: isPreset ? undefined : normalizePlatformIconBg(link.icon_bg ?? DEFAULT_PLATFORM_ICON_BG),
        hidden: Boolean(link.hidden),
        stars: ratingToStars(link.rating),
        label: ""
      }
    })
}

function normalizeContent(
  content: PropertySiteContent | undefined,
  brandName: string,
  brandMeta: string
): PropertySiteContent {
  const base = content ?? ({} as PropertySiteContent)

  const copyEn = base.copy_en
    ? normalizeCopy(
        base.copy_en,
        base.copy_en.header?.brand_name ?? "",
        base.copy_en.header?.brand_meta ?? ""
      )
    : undefined

  return {
    template: normalizeSiteTemplate(base.template),
    copy: normalizeCopy(base.copy, brandName, brandMeta),
    copy_en: copyEn,
    email: base.email ?? { access_lines: [] },
    featured_spaces: base.featured_spaces ?? [],
    featured_spaces_en: base.featured_spaces_en ?? [],
    space_gallery_categories: base.space_gallery_categories ?? [],
    space_gallery_categories_en: base.space_gallery_categories_en ?? [],
    benefit_cards: normalizeBenefitCards(base.benefit_cards),
    benefit_cards_en: normalizeBenefitCards(base.benefit_cards_en),
    visual_cards: normalizeVisualCards(base.visual_cards),
    visual_cards_en: normalizeVisualCards(base.visual_cards_en),
    neighborhood_highlights: normalizeNeighborhoodHighlights(base.neighborhood_highlights),
    neighborhood_highlights_en: normalizeNeighborhoodHighlights(base.neighborhood_highlights_en),
    house_rules: base.house_rules ?? [],
    house_rules_en: base.house_rules_en ?? [],
    platform_links: normalizePlatformLinks(base.platform_links),
    reviews: normalizeReviews(base.reviews),
    reviews_en: normalizeReviews(base.reviews_en),
    amenity_catalog: base.amenity_catalog ?? [],
    amenity_catalog_en: base.amenity_catalog_en ?? [],
    amenity_preview_sections: withAmenityPreviewHasMore(base.amenity_preview_sections ?? []),
    amenity_preview_sections_en: withAmenityPreviewHasMore(base.amenity_preview_sections_en ?? []),
    welcome_guide: createEmptyWelcomeGuide()
  }
}

function normalizeSeoTwitterCard(value: unknown): "summary" | "summary_large_image" {
  return value === "summary" ? "summary" : "summary_large_image"
}

function normalizeSubscriptionAccess(
  raw: HostivSubscriptionAccess | undefined
): HostivSubscriptionAccess | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined
  }

  if (isHostivPlatformAdminSubscriptionAccess(raw)) {
    return buildHostivPlatformAdminSubscriptionAccess(raw.subscription_started_at)
  }

  return buildHostivSubscriptionAccess({
    subscription_plan: raw.plan,
    paid_until: raw.paid_until,
    subscription_started_at: raw.subscription_started_at,
    premium_tools_until: raw.premium_tools_until,
    premium_tools_started_at: raw.premium_tools_started_at
  })
}

export function normalizePropertyAdminRecord(raw: PropertyAdminRecord): PropertyAdminRecord {
  const brandName = String(raw.brand_name ?? "")
  const brandMeta = String(raw.brand_meta ?? "")
  const content = normalizeContent(raw.content, brandName, brandMeta)
  const heroTitle = content.copy.hero?.title ?? ""

  const record = applyDerivedPropertySeo({
    id: String(raw.id),
    slug: String(raw.slug),
    published: Boolean(raw.published),
    brand_name: brandName,
    brand_meta: brandMeta,
    logo_path: String(raw.logo_path ?? ""),
    seo_title: "",
    seo_description: "",
    seo_keywords: joinSeoKeywords(parseSeoKeywords(String(raw.seo_keywords ?? ""))),
    seo_keywords_en: joinSeoKeywords(parseSeoKeywords(String(raw.seo_keywords_en ?? ""))),
    seo_keywords_fr_enabled: parseSeoKeywords(String(raw.seo_keywords ?? "")).length > 0,
    seo_keywords_en_enabled: parseSeoKeywords(String(raw.seo_keywords_en ?? "")).length > 0,
    seo_og_title: "",
    seo_og_description: "",
    seo_og_image_path: "",
    seo_twitter_card: normalizeSeoTwitterCard(raw.seo_twitter_card),
    seo_noindex: Boolean(raw.seo_noindex),
    hero_image_path: String(raw.hero_image_path ?? ""),
    hero_image_alt: heroTitle,
    testimonials_bg_path: String(raw.testimonials_bg_path ?? ""),
    host_photo_path: String(raw.host_photo_path ?? ""),
    subscription_plan: normalizeHostivSubscriptionPlan(raw.subscription_plan),
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
      },
      welcome_guide: normalizeWelcomeGuide(raw.content?.welcome_guide, brandName, {
        id: String(raw.id),
        slug: String(raw.slug),
        published: Boolean(raw.published),
        brand_name: brandName,
        brand_meta: brandMeta,
        logo_path: String(raw.logo_path ?? ""),
        hero_image_path: String(raw.hero_image_path ?? ""),
        host_photo_path: String(raw.host_photo_path ?? ""),
        location: {
          ...DEFAULT_LOCATION,
          ...(raw.location ?? {}),
          address: String(raw.location?.address ?? DEFAULT_LOCATION.address)
        },
        content
      } as PropertyAdminRecord),
      welcome_guide_en: raw.content?.welcome_guide_en
        ? normalizeWelcomeGuide(raw.content.welcome_guide_en, brandName, {
            id: String(raw.id),
            slug: String(raw.slug),
            published: Boolean(raw.published),
            brand_name: brandName,
            brand_meta: brandMeta,
            logo_path: String(raw.logo_path ?? ""),
            hero_image_path: String(raw.hero_image_path ?? ""),
            host_photo_path: String(raw.host_photo_path ?? ""),
            location: {
              ...DEFAULT_LOCATION,
              ...(raw.location ?? {}),
              address: String(raw.location?.address ?? DEFAULT_LOCATION.address)
            },
            content
          } as PropertyAdminRecord)
        : undefined
    }
  })

  const subscriptionAccess = normalizeSubscriptionAccess(raw.subscription_access)

  if (subscriptionAccess) {
    record.subscription_access = subscriptionAccess
  }

  if (raw.admin_access && typeof raw.admin_access === "object") {
    const role = raw.admin_access.role

    if (role === "owner" || role === "cohost" || role === "platform_admin") {
      record.admin_access = {
        role,
        is_primary_owner: raw.admin_access.is_primary_owner !== false,
        can_manage_cohosts: Boolean(raw.admin_access.can_manage_cohosts)
      }
    }
  }

  return record
}

export function clonePropertyAdminRecord(record: PropertyAdminRecord): PropertyAdminRecord {
  const access = record.subscription_access
  const adminAccess = record.admin_access
  const cloned = normalizePropertyAdminRecord(
    JSON.parse(JSON.stringify(record)) as PropertyAdminRecord
  )

  if (access) {
    cloned.subscription_access = access
  }

  if (adminAccess) {
    cloned.admin_access = adminAccess
  }

  return cloned
}
