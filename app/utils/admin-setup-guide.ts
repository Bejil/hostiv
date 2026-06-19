import {
  getAdminCustomizationBlocks,
  type AdminNavSectionId
} from "../data/admin-nav-sections"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import type { StripeConnectStatus } from "../types/stripe-connect"
import { getAdminUi } from "../data/admin-ui"
import { isCustomizationBlockComplete } from "./admin-customization-block-completion"
import { parseSiteLayoutId } from "../data/site-layouts"
import { parseSiteTemplateId } from "../data/site-templates"
import { hasConfiguredSeoKeywords } from "./seo-keywords"
import { stripeConnectNeedsAttention } from "./admin-stripe-connect-attention"

export type AdminSetupGuideItemId =
  | "theme"
  | "customization"
  | "gallery"
  | "stripe"
  | "calendars"
  | "seo-keywords"

export type AdminSetupGuideBlockId = AdminNavSectionId

export type AdminSetupGuideItem = {
  id: AdminSetupGuideItemId
  label: string
  optional?: boolean
  section: AdminNavSectionId | "general" | "images" | "reservations" | "payouts" | "customization"
  blockId?: AdminNavSectionId
}

export function getAdminSetupGuideCustomizationBlockIds(locale: HostivLocale = "fr") {
  return getAdminCustomizationBlocks(locale)
    .map((block) => block.id)
    .filter((id) => id !== "template")
}

/** @deprecated Utiliser getAdminSetupGuideCustomizationBlockIds(locale) */
export const adminSetupGuideCustomizationBlockIds = getAdminSetupGuideCustomizationBlockIds("fr")

export function getAdminSetupGuideItems(locale: HostivLocale = "fr"): AdminSetupGuideItem[] {
  return getAdminUi(locale).setupGuide.items as AdminSetupGuideItem[]
}

/** @deprecated Utiliser getAdminSetupGuideItems(locale) */
export const adminSetupGuideItems = getAdminSetupGuideItems("fr")

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
}

export function isSetupGuideThemeComplete(record: PropertyAdminRecord) {
  return (
    Boolean(parseSiteLayoutId(record.content.template?.layout)) &&
    Boolean(parseSiteTemplateId(record.content.template?.theme ?? record.content.template?.id))
  )
}

export function isSetupGuideGalleryComplete(record: PropertyAdminRecord) {
  return (record.content.space_gallery_categories ?? []).some(
    (category) =>
      hasText(category.title) &&
      hasText(category.description) &&
      (category.images ?? []).some((image) => hasText(image))
  )
}

export function isSetupGuideCalendarsComplete(record: PropertyAdminRecord) {
  return (record.calendar_config?.ics_feeds ?? []).some(
    (feed) => feed.enabled !== false && hasText(feed.url)
  )
}

export function isSetupGuideSeoKeywordsComplete(record: PropertyAdminRecord) {
  return hasConfiguredSeoKeywords(record)
}

export function isSetupGuideStripeComplete(
  status: StripeConnectStatus | null,
  options?: { hasLoadError?: boolean }
) {
  if (options?.hasLoadError) {
    return false
  }

  if (!status) {
    return false
  }

  if (stripeConnectNeedsAttention(status, options)) {
    return false
  }

  return status.paymentsReady
}

export function isSetupGuideCustomizationComplete(
  record: PropertyAdminRecord,
  locale: HostivLocale = "fr"
) {
  return getAdminSetupGuideCustomizationBlockIds(locale).every((blockId) =>
    isCustomizationBlockComplete(record, blockId, locale)
  )
}

export function isSetupGuideItemComplete(
  itemId: AdminSetupGuideItemId,
  record: PropertyAdminRecord,
  stripe: {
    status: StripeConnectStatus | null
    hasLoadError?: boolean
  },
  skipped: ReadonlySet<string>,
  locale: HostivLocale = "fr"
) {
  if (skipped.has(itemId)) {
    return true
  }

  switch (itemId) {
    case "theme":
      return isSetupGuideThemeComplete(record)
    case "customization":
      return isSetupGuideCustomizationComplete(record, locale)
    case "gallery":
      return isSetupGuideGalleryComplete(record)
    case "stripe":
      return isSetupGuideStripeComplete(stripe.status, {
        hasLoadError: stripe.hasLoadError
      })
    case "calendars":
      return isSetupGuideCalendarsComplete(record)
    case "seo-keywords":
      return isSetupGuideSeoKeywordsComplete(record)
    default:
      return false
  }
}

export function getSetupGuideBlockLabel(
  blockId: AdminNavSectionId,
  locale: HostivLocale = "fr"
) {
  return getAdminCustomizationBlocks(locale).find((block) => block.id === blockId)?.label ?? blockId
}

export type AdminSetupGuideProgress = {
  completed: number
  total: number
  requiredCompleted: number
  requiredTotal: number
  percent: number
  /** Toutes les étapes obligatoires sont faites (ou passées). */
  allRequiredDone: boolean
  /** Toutes les étapes, y compris passables, sont faites ou passées. */
  allComplete: boolean
}

export function buildSetupGuideProgress(
  record: PropertyAdminRecord,
  stripe: {
    status: StripeConnectStatus | null
    hasLoadError?: boolean
  },
  skipped: ReadonlySet<string>,
  locale: HostivLocale = "fr",
  items = getAdminSetupGuideItems(locale)
): AdminSetupGuideProgress {
  const requiredItems = items.filter((item) => !item.optional)
  const requiredCompleted = requiredItems.filter((item) =>
    isSetupGuideItemComplete(item.id, record, stripe, skipped, locale)
  ).length
  const completed = items.filter((item) =>
    isSetupGuideItemComplete(item.id, record, stripe, skipped, locale)
  ).length

  const total = items.length
  const requiredTotal = requiredItems.length

  return {
    completed,
    total,
    requiredCompleted,
    requiredTotal,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    allRequiredDone: requiredCompleted >= requiredTotal,
    allComplete: completed >= total
  }
}
