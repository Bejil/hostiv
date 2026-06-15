import type { AdminIconName } from "../../components/admin/admin-icon-types"
import type { PlatformAdminSectionId } from "../../types/platform-admin"

export type PlatformAdminNavItem = {
  id: PlatformAdminSectionId
  label: string
  icon: AdminIconName
}

export const platformAdminNavItemsFr: PlatformAdminNavItem[] = [
  { id: "dashboard", label: "Vue d’ensemble", icon: "layout" },
  { id: "sites", label: "Sites", icon: "home" },
  { id: "members", label: "Membres", icon: "user" },
  { id: "revenue", label: "Revenus", icon: "card" }
]

export const platformAdminNavItemsEn: PlatformAdminNavItem[] = [
  { id: "dashboard", label: "Overview", icon: "layout" },
  { id: "sites", label: "Sites", icon: "home" },
  { id: "members", label: "Members", icon: "user" },
  { id: "revenue", label: "Revenue", icon: "card" }
]

export function getPlatformAdminNavItems(locale: "fr" | "en") {
  return locale === "en" ? platformAdminNavItemsEn : platformAdminNavItemsFr
}
