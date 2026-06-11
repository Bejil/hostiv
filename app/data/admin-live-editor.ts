import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"
import type { AdminNavSectionId, AdminSectionId } from "./admin-nav-sections"

/** Ancre DOM dans PropertySitePageView (`data-live-section`). */
export const ADMIN_LIVE_PREVIEW_ANCHORS: Partial<Record<AdminNavSectionId, string>> = {
  template: "site-top",
  header: "site-header",
  seo: "site-hero",
  platforms: "site-platforms",
  host: "site-host",
  featured: "site-featured",
  benefits: "site-benefits",
  location: "site-location",
  media: "site-media",
  booking: "site-pricing",
  amenities: "site-amenities",
  reviews: "site-reviews",
  rules: "site-rules"
}

export function adminLivePreviewAnchorFor(
  menuSection: AdminSectionId,
  previewBlock: AdminNavSectionId | null
): string | null {
  if (menuSection === "customization" && previewBlock) {
    return ADMIN_LIVE_PREVIEW_ANCHORS[previewBlock] ?? null
  }

  return null
}

export type AdminLivePreviewViewport = "desktop" | "tablet" | "mobile"

export function getAdminLivePreviewViewports(locale: HostivLocale = "fr") {
  const labels = getAdminUi(locale).preview.viewports
  const widths: Record<AdminLivePreviewViewport, number> = {
    desktop: 1280,
    tablet: 768,
    mobile: 390
  }

  return labels.map((item) => ({
    id: item.id as AdminLivePreviewViewport,
    label: item.label,
    widthPx: widths[item.id as AdminLivePreviewViewport]
  }))
}

/** @deprecated Utiliser getAdminLivePreviewViewports(locale) */
export const ADMIN_LIVE_PREVIEW_VIEWPORTS = getAdminLivePreviewViewports("fr")
