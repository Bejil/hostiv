import type { AdminNavSectionId, AdminTopSectionId } from "../admin-nav-sections"

export const ADMIN_TOP_NAV_ICONS: Record<
  AdminTopSectionId,
  "settings" | "users" | "layout" | "text" | "image" | "calendar" | "card" | "quote"
> = {
  general: "settings",
  customization: "layout",
  "welcome-guide": "text",
  images: "image",
  reservations: "calendar",
  "guest-reviews": "quote",
  payouts: "card"
}

export const ADMIN_CUSTOMIZATION_ICONS: Record<
  AdminNavSectionId,
  | "search"
  | "layout"
  | "user"
  | "heart"
  | "star"
  | "map"
  | "image"
  | "calendar"
  | "list"
  | "quote"
  | "text"
> = {
  template: "layout",
  header: "layout",
  seo: "search",
  platforms: "layout",
  host: "user",
  featured: "heart",
  benefits: "star",
  location: "map",
  media: "image",
  booking: "calendar",
  amenities: "list",
  reviews: "quote",
  rules: "text"
}
