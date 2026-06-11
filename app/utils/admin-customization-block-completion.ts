import {
  getAdminCustomizationBlocks,
  type AdminNavSectionId
} from "../data/admin-nav-sections"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import { getAdminUi } from "../data/admin-ui"
import { parseSiteTemplateId } from "../data/site-templates"
import { hasValidHouseRuleTime } from "./house-rules-time"
import { isPlatformLinkHidden } from "./platform-links"

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
}

function hasPublishedFeaturedSpace(space: { title?: string; image?: string } | null | undefined) {
  return Boolean(space?.title?.trim() && space?.image?.trim())
}

function hasPublishedVisualCard(card: { title?: string; image?: string } | null | undefined) {
  return Boolean(card?.title?.trim() && card?.image?.trim())
}

function hasPublishedAmenitySection(
  section: { title?: string; items?: { name?: string }[] } | null | undefined
) {
  if (!section?.title?.trim()) {
    return false
  }

  return (section.items ?? []).some((item) => hasText(item?.name))
}

function hasPublishedReview(review: { author?: string; quote?: string } | null | undefined) {
  return Boolean(review?.author?.trim() && review?.quote?.trim())
}

function hasPublishedHouseRule(rule: { title?: string; text?: string } | null | undefined) {
  return Boolean(rule?.title?.trim() && rule?.text?.trim())
}

function hasPublishedBenefitCard(card: { title?: string } | null | undefined) {
  return Boolean(card?.title?.trim())
}

function hasPublishedPlatformLink(
  link: { name?: string; hidden?: boolean } | null | undefined
) {
  if (!link || isPlatformLinkHidden(link)) {
    return false
  }

  return hasText(link.name)
}

function rulesSectionWouldShow(record: PropertyAdminRecord) {
  const rules = record.content?.copy?.rules
  const hasSchedule =
    hasValidHouseRuleTime(rules?.check_in_time ?? "") &&
    hasValidHouseRuleTime(rules?.check_out_time ?? "")
  const hasRules = (record.content.house_rules ?? []).some((rule) => hasPublishedHouseRule(rule))

  return hasSchedule || hasRules
}

export function getCustomizationBlockMissingLabels(
  record: PropertyAdminRecord,
  blockId: AdminNavSectionId,
  locale: HostivLocale = "fr"
): string[] {
  const v = getAdminUi(locale).validation

  switch (blockId) {
    case "template":
      return parseSiteTemplateId(record.content.template?.id) ? [] : [v.selectedTheme]
    case "header": {
      const missing: string[] = []

      if (!hasText(record.logo_path)) {
        missing.push(v.logo)
      }

      if (!hasText(record.brand_name)) {
        missing.push(v.brandName)
      }

      if (!hasText(record.brand_meta)) {
        missing.push(v.brandMeta)
      }

      return missing
    }
    case "seo": {
      const missing: string[] = []
      const hero = record.content?.copy?.hero

      if (!hasText(record.hero_image_path)) {
        missing.push(v.heroImage)
      }

      if (!hasText(hero?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(hero?.title)) {
        missing.push(v.title)
      }

      if (!hasText(hero?.text)) {
        missing.push(v.text)
      }

      return missing
    }
    case "platforms": {
      const missing: string[] = []
      const stats = record.content?.copy?.platform_stats

      if (!hasText(stats?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(stats?.title)) {
        missing.push(v.title)
      }

      if (!hasText(stats?.intro)) {
        missing.push(v.intro)
      }

      if (!(record.content.platform_links ?? []).some((link) => hasPublishedPlatformLink(link))) {
        missing.push(v.visiblePlatform)
      }

      return missing
    }
    case "host": {
      const missing: string[] = []
      const host = record.content?.copy?.host

      if (!hasText(record.host_photo_path)) {
        missing.push(v.hostPhoto)
      }

      if (!hasText(host?.caption)) {
        missing.push(v.caption)
      }

      if (!hasText(host?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(host?.title)) {
        missing.push(v.title)
      }

      if (!hasText(host?.quote)) {
        missing.push(v.quote)
      }

      if (!hasText(host?.intro_1)) {
        missing.push(v.introduction)
      }

      return missing
    }
    case "featured": {
      const missing: string[] = []
      const spaces = record.content?.copy?.spaces

      if (!hasText(spaces?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(spaces?.title)) {
        missing.push(v.title)
      }

      if (!hasText(spaces?.intro)) {
        missing.push(v.intro)
      }

      if (!(record.content.featured_spaces ?? []).some((space) => hasPublishedFeaturedSpace(space))) {
        missing.push(v.featuredSpace)
      }

      return missing
    }
    case "benefits": {
      const missing: string[] = []
      const benefits = record.content?.copy?.benefits

      if (!hasText(benefits?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(benefits?.title)) {
        missing.push(v.title)
      }

      if (!(record.content.benefit_cards ?? []).some((card) => hasPublishedBenefitCard(card))) {
        missing.push(v.benefitCard)
      }

      return missing
    }
    case "location": {
      const missing: string[] = []
      const location = record.content?.copy?.location

      if (!hasText(location?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(location?.title)) {
        missing.push(v.title)
      }

      if (!hasText(location?.intro)) {
        missing.push(v.intro)
      }

      if (!hasText(record.location?.address)) {
        missing.push(v.address)
      }

      if (!hasText(location?.lead)) {
        missing.push(v.neighborhoodLead)
      }

      return missing
    }
    case "media": {
      const missing: string[] = []
      const visual = record.content?.copy?.visual

      if (!hasText(visual?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(visual?.title)) {
        missing.push(v.title)
      }

      if (!hasText(visual?.intro)) {
        missing.push(v.intro)
      }

      if (!(record.content.visual_cards ?? []).some((card) => hasPublishedVisualCard(card))) {
        missing.push(v.visualCard)
      }

      return missing
    }
    case "booking": {
      const missing: string[] = []
      const pricing = record.content?.copy?.pricing

      if (!hasText(pricing?.eyebrow)) {
        missing.push(v.pricingEyebrow)
      }

      if (!hasText(pricing?.title)) {
        missing.push(v.pricingTitle)
      }

      if (!hasText(pricing?.intro)) {
        missing.push(v.pricingIntro)
      }

      return missing
    }
    case "amenities": {
      const missing: string[] = []
      const amenities = record.content?.copy?.amenities

      if (!hasText(amenities?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(amenities?.title)) {
        missing.push(v.title)
      }

      if (!hasText(amenities?.intro)) {
        missing.push(v.intro)
      }

      if (
        !(record.content.amenity_preview_sections ?? []).some((section) =>
          hasPublishedAmenitySection(section)
        )
      ) {
        missing.push(v.amenityCard)
      }

      return missing
    }
    case "reviews": {
      const missing: string[] = []
      const reviewsCopy = record.content?.copy?.reviews

      if (!hasText(record.testimonials_bg_path)) {
        missing.push(v.reviewsBg)
      }

      if (!hasText(reviewsCopy?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(reviewsCopy?.title)) {
        missing.push(v.title)
      }

      if (!(record.content.reviews ?? []).some((review) => hasPublishedReview(review))) {
        missing.push(v.review)
      }

      return missing
    }
    case "rules": {
      const missing: string[] = []
      const rules = record.content?.copy?.rules

      if (!hasText(rules?.eyebrow)) {
        missing.push(v.rulesEyebrow)
      }

      if (!hasText(rules?.title)) {
        missing.push(v.rulesTitle)
      }

      if (!hasText(rules?.intro)) {
        missing.push(v.rulesIntro)
      }

      if (!rulesSectionWouldShow(record)) {
        missing.push(v.scheduleOrRule)
      }

      return missing
    }
    default:
      return []
  }
}

export function isCustomizationBlockComplete(
  record: PropertyAdminRecord,
  blockId: AdminNavSectionId,
  locale: HostivLocale = "fr"
): boolean {
  return getCustomizationBlockMissingLabels(record, blockId, locale).length === 0
}

export function getIncompleteCustomizationBlockCount(
  record: PropertyAdminRecord,
  locale: HostivLocale = "fr"
): number {
  return getAdminCustomizationBlocks(locale).reduce((count, block) => {
    return count + (isCustomizationBlockComplete(record, block.id, locale) ? 0 : 1)
  }, 0)
}
