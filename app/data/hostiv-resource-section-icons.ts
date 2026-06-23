import type { HostivResourceArticleId } from "./hostiv-resources.types"

export type HostivResourceSectionIconKey =
  | "alert-triangle"
  | "bar-chart-3"
  | "book-open"
  | "calendar-check"
  | "calendar-days"
  | "calendar-sync"
  | "check-circle-2"
  | "clipboard-check"
  | "clock"
  | "credit-card"
  | "file-text"
  | "heart"
  | "image"
  | "layout-template"
  | "link-2"
  | "list-checks"
  | "mail"
  | "map-pin"
  | "message-square"
  | "mouse-pointer-click"
  | "paintbrush"
  | "palette"
  | "receipt"
  | "refresh-cw"
  | "scale"
  | "search"
  | "send"
  | "settings"
  | "share-2"
  | "shield-check"
  | "shuffle"
  | "smartphone"
  | "sparkles"
  | "star"
  | "tag"
  | "thumbs-up"
  | "trending-up"
  | "users"
  | "wallet"
  | "workflow"

const SECTION_ICONS: Record<HostivResourceArticleId, HostivResourceSectionIconKey[]> = {
  "passer-au-direct": [
    "trending-up",
    "users",
    "list-checks",
    "shuffle",
    "calendar-days",
    "alert-triangle"
  ],
  "sync-calendrier-ical": [
    "calendar-sync",
    "link-2",
    "settings",
    "workflow",
    "clock",
    "check-circle-2"
  ],
  "promouvoir-site-direct": [
    "heart",
    "map-pin",
    "message-square",
    "tag",
    "share-2",
    "bar-chart-3"
  ],
  "configurer-stripe-connect": ["credit-card", "shield-check", "wallet", "bar-chart-3"],
  "choisir-template-site": ["palette", "layout-template", "paintbrush", "smartphone"],
  "optimiser-fiche-logement": ["image", "file-text", "list-checks", "search"],
  "convertir-visiteurs": ["mouse-pointer-click", "star", "receipt", "mail"],
  "comparer-starter-pro": ["scale", "sparkles", "star", "list-checks"],
  "premiere-reservation-directe": ["clipboard-check", "share-2", "calendar-check", "thumbs-up"],
  "factures-pdf": ["file-text", "receipt", "send", "sparkles"],
  "guide-accueil-voyageurs": ["book-open", "list-checks", "mail", "refresh-cw"],
  "referencement-site-direct": ["search", "link-2", "map-pin", "star"]
}

const ARTICLE_ICONS: Record<HostivResourceArticleId, HostivResourceSectionIconKey> = {
  "passer-au-direct": "trending-up",
  "sync-calendrier-ical": "calendar-sync",
  "promouvoir-site-direct": "share-2",
  "configurer-stripe-connect": "credit-card",
  "choisir-template-site": "layout-template",
  "optimiser-fiche-logement": "image",
  "convertir-visiteurs": "mouse-pointer-click",
  "comparer-starter-pro": "scale",
  "premiere-reservation-directe": "calendar-check",
  "factures-pdf": "receipt",
  "guide-accueil-voyageurs": "book-open",
  "referencement-site-direct": "search"
}

export function getHostivResourceArticleIcon(
  articleId: HostivResourceArticleId
): HostivResourceSectionIconKey {
  return ARTICLE_ICONS[articleId] ?? "list-checks"
}

export function getHostivResourceSectionIcon(
  articleId: HostivResourceArticleId,
  sectionIndex: number
): HostivResourceSectionIconKey {
  const icons = SECTION_ICONS[articleId]
  return icons[sectionIndex] ?? "list-checks"
}
