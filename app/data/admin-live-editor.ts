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

/** Largeur « design » du viewport (px) — utilisée dans l’iframe pour des media queries réalistes. */
export const ADMIN_LIVE_PREVIEW_VIEWPORTS: {
  id: AdminLivePreviewViewport
  label: string
  widthPx: number
}[] = [
  { id: "desktop", label: "Bureau", widthPx: 1280 },
  { id: "tablet", label: "Tablette", widthPx: 768 },
  { id: "mobile", label: "Mobile", widthPx: 390 }
]
