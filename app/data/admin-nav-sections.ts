import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"
import { ADMIN_CUSTOMIZATION_ICONS, ADMIN_TOP_NAV_ICONS } from "./admin-ui/nav-icons"

export type AdminTopSectionId =
  | "general"
  | "account"
  | "customization"
  | "welcome-guide"
  | "images"
  | "reservations"
  | "guest-reviews"
  | "payouts"

/** Bloc éditable dans la page Personnalisation. */
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
  | "users"
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

export function getAdminTopNavItems(locale: HostivLocale = "fr"): AdminNavItem[] {
  return getAdminUi(locale).nav.top.map((item) => ({
    ...item,
    icon: ADMIN_TOP_NAV_ICONS[item.id as AdminTopSectionId]
  }))
}

export function getAdminCustomizationBlocks(locale: HostivLocale = "fr"): AdminNavItem[] {
  return getAdminUi(locale).nav.customization.map((item) => ({
    ...item,
    icon: ADMIN_CUSTOMIZATION_ICONS[item.id as AdminNavSectionId]
  }))
}

/** @deprecated Utiliser getAdminCustomizationBlocks(locale) */
export const adminCustomizationBlocks = getAdminCustomizationBlocks("fr")

/** @deprecated Utiliser getAdminTopNavItems(locale) */
export const adminTopNavItems = getAdminTopNavItems("fr")

/** @deprecated Utiliser getAdminCustomizationBlocks */
export const adminNavItems = adminCustomizationBlocks

export function getAdminAllNavItems(locale: HostivLocale = "fr"): AdminNavItem[] {
  return [...getAdminTopNavItems(locale), ...getAdminCustomizationBlocks(locale)]
}

/** @deprecated Utiliser getAdminAllNavItems(locale) */
export const adminAllNavItems = getAdminAllNavItems("fr")

const adminSectionIdSet = new Set(getAdminAllNavItems("fr").map((item) => item.id))

const adminCustomizationBlockIdSet = new Set(
  getAdminCustomizationBlocks("fr").map((item) => item.id)
)

export function isAdminSectionId(value: string): value is AdminSectionId {
  return adminSectionIdSet.has(value as AdminSectionId)
}

const adminTopSectionIdSet = new Set(getAdminTopNavItems("fr").map((item) => item.id))

export function isAdminTopSectionId(value: string): value is AdminTopSectionId {
  if (value === "account") {
    return true
  }

  return adminTopSectionIdSet.has(value as AdminTopSectionId)
}

export function isAdminCustomizationBlockId(value: string): value is AdminNavSectionId {
  return adminCustomizationBlockIdSet.has(value as AdminNavSectionId)
}

export function resolveAdminMenuSection(id: AdminSectionId): AdminTopSectionId {
  if (isAdminCustomizationBlockId(id)) {
    return "customization"
  }

  return id as AdminTopSectionId
}

export function findAdminNavMeta(id: AdminSectionId, locale: HostivLocale = "fr"): AdminNavItem {
  const fallback = getAdminUi(locale).nav.fallback

  return (
    getAdminAllNavItems(locale).find((item) => item.id === id) ?? {
      id: "general",
      label: fallback.label,
      icon: "settings",
      title: fallback.title,
      description: fallback.description
    }
  )
}
