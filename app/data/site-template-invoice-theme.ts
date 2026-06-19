import { normalizeSiteTemplate } from "./site-layouts"
import {
  DEFAULT_SITE_TEMPLATE_ID,
  normalizeSiteTemplateId,
  siteTemplateOptions,
  type SiteTemplateId
} from "./site-templates"

export type InvoiceRgb = {
  r: number
  g: number
  b: number
}

export type SiteTemplateInvoiceTheme = {
  id: SiteTemplateId
  name: string
  pageBackground: InvoiceRgb
  cardBackground: InvoiceRgb
  accent: InvoiceRgb
  /** Deuxième teinte (bandeau, dégradé simplifié). */
  accentSecondary: InvoiceRgb
  accentText: InvoiceRgb
  ink: InvoiceRgb
  muted: InvoiceRgb
  border: InvoiceRgb
  danger: InvoiceRgb
  /** Bandeau haut de page (px). */
  topBandHeight: number
  /** Style de mise en page facture. */
  layout: "warm" | "editorial" | "minimal"
}

function hex(hexColor: string): InvoiceRgb {
  const normalized = hexColor.replace("#", "").trim()

  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255
  }
}

const SITE_TEMPLATE_INVOICE_THEMES: Record<SiteTemplateId, SiteTemplateInvoiceTheme> = {
  signature: {
    id: "signature",
    name: "Signature",
    pageBackground: hex("f7f4f1"),
    cardBackground: hex("ffffff"),
    accent: hex("6b4f33"),
    accentSecondary: hex("94633c"),
    accentText: hex("fffaf4"),
    ink: hex("2a221c"),
    muted: hex("7a6c60"),
    border: hex("e8dfd4"),
    danger: hex("b42318"),
    topBandHeight: 6,
    layout: "warm"
  },
  riviera: {
    id: "riviera",
    name: "Riviera",
    pageBackground: hex("fff8ed"),
    cardBackground: hex("ffffff"),
    accent: hex("e56f3b"),
    accentSecondary: hex("a84c2d"),
    accentText: hex("fffaf4"),
    ink: hex("3d2a1f"),
    muted: hex("8a6a52"),
    border: hex("f0d4bc"),
    danger: hex("b42318"),
    topBandHeight: 8,
    layout: "warm"
  },
  panorama: {
    id: "panorama",
    name: "Panorama",
    pageBackground: hex("fbfbf8"),
    cardBackground: hex("ffffff"),
    accent: hex("5e4ad8"),
    accentSecondary: hex("a44ddf"),
    accentText: hex("ffffff"),
    ink: hex("1a1a1a"),
    muted: hex("5c5c5c"),
    border: hex("e6e4ef"),
    danger: hex("b42318"),
    topBandHeight: 6,
    layout: "minimal"
  },
  cabin: {
    id: "cabin",
    name: "Cabin",
    pageBackground: hex("f5f5f0"),
    cardBackground: hex("fffffc"),
    accent: hex("2d362e"),
    accentSecondary: hex("5a6b55"),
    accentText: hex("ffffff"),
    ink: hex("2d362e"),
    muted: hex("5f6d62"),
    border: hex("d8ddd4"),
    danger: hex("b42318"),
    topBandHeight: 6,
    layout: "warm"
  },
  marina: {
    id: "marina",
    name: "Marina",
    pageBackground: hex("f4f7fb"),
    cardBackground: hex("ffffff"),
    accent: hex("001f3f"),
    accentSecondary: hex("ff3b5c"),
    accentText: hex("ffffff"),
    ink: hex("001f3f"),
    muted: hex("4a5f78"),
    border: hex("d4dde8"),
    danger: hex("b42318"),
    topBandHeight: 6,
    layout: "minimal"
  }
}

export function getSiteTemplateInvoiceTheme(templateId: unknown): SiteTemplateInvoiceTheme {
  const id = normalizeSiteTemplateId(templateId)

  return SITE_TEMPLATE_INVOICE_THEMES[id]
}

export function getSiteTemplateInvoiceThemeLabel(templateId: unknown): string {
  const id = normalizeSiteTemplateId(templateId)
  const option = siteTemplateOptions.find((item) => item.id === id)

  return option?.name ?? SITE_TEMPLATE_INVOICE_THEMES[DEFAULT_SITE_TEMPLATE_ID].name
}

export function resolvePropertyInvoiceTheme(property: {
  content?: { template?: { id?: unknown; theme?: unknown; layout?: unknown } }
}) {
  return getSiteTemplateInvoiceTheme(
    normalizeSiteTemplate(property.content?.template, { forPublic: true }).theme
  )
}
