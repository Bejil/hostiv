import type { InvoiceRgb, SiteTemplateInvoiceTheme } from "../data/site-template-invoice-theme"
import type { SiteTemplateId } from "../data/site-templates"

export function rgbToHex(color: InvoiceRgb) {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value * 255)))
      .toString(16)
      .padStart(2, "0")

  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

export function rgbToCss(color: InvoiceRgb) {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)

  return `rgb(${r}, ${g}, ${b})`
}

function mixRgb(a: InvoiceRgb, b: InvoiceRgb, weightA: number): InvoiceRgb {
  const t = Math.max(0, Math.min(1, weightA))
  const u = 1 - t

  return {
    r: a.r * t + b.r * u,
    g: a.g * t + b.g * u,
    b: a.b * t + b.b * u
  }
}

export function welcomeGuideThemeCssVars(theme: SiteTemplateInvoiceTheme) {
  const rose = mixRgb(theme.accentSecondary, theme.cardBackground, 0.34)
  const photoPlaceholder = mixRgb(theme.border, theme.cardBackground, 0.55)

  return {
    "--wg-page": rgbToHex(theme.pageBackground),
    "--wg-card": rgbToHex(theme.cardBackground),
    "--wg-accent": rgbToHex(theme.accent),
    "--wg-accent-2": rgbToHex(theme.accentSecondary),
    "--wg-accent-text": rgbToHex(theme.accentText),
    "--wg-ink": rgbToHex(theme.ink),
    "--wg-muted": rgbToHex(theme.muted),
    "--wg-border": rgbToHex(theme.border),
    "--wg-danger": rgbToHex(theme.danger),
    "--wg-paper": rgbToHex(theme.cardBackground),
    "--wg-burgundy": rgbToHex(theme.accent),
    "--wg-rose": rgbToHex(rose),
    "--wg-photo-placeholder": rgbToHex(photoPlaceholder)
  } as const
}

export function welcomeGuideThemeCssVarsBlock(theme: SiteTemplateInvoiceTheme) {
  const vars = welcomeGuideThemeCssVars(theme)

  return Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n      ")
}

const BOOKING_MODAL_BUTTON_RADIUS: Record<SiteTemplateId, string> = {
  signature: "999px",
  riviera: "999px",
  panorama: "999px",
  toky: "0",
  cabin: "999px",
  resort: "4px",
  marina: "999px"
}

const BOOKING_MODAL_PANEL_RADIUS: Record<SiteTemplateId, string> = {
  signature: "24px",
  riviera: "32px",
  panorama: "24px",
  toky: "0",
  cabin: "24px",
  resort: "8px",
  marina: "24px"
}

const BOOKING_MODAL_FIELD_RADIUS: Record<SiteTemplateId, string> = {
  signature: "16px",
  riviera: "999px",
  panorama: "16px",
  toky: "0",
  cabin: "16px",
  resort: "0",
  marina: "16px"
}

/** Variables pour la modale de réservation (téléportée hors `.site-template`). */
export function siteBookingModalThemeCssVars(theme: SiteTemplateInvoiceTheme) {
  const recapMid = mixRgb(theme.accent, theme.accentSecondary, 0.38)
  const panelBg = mixRgb(theme.pageBackground, theme.cardBackground, 0.42)

  return {
    "--bm-panel": rgbToHex(panelBg),
    "--bm-card": rgbToHex(theme.cardBackground),
    "--bm-ink": rgbToHex(theme.ink),
    "--bm-muted": rgbToHex(theme.muted),
    "--bm-border": rgbToHex(theme.border),
    "--bm-accent": rgbToHex(theme.accent),
    "--bm-accent-2": rgbToHex(theme.accentSecondary),
    "--bm-accent-text": rgbToHex(theme.accentText),
    "--bm-danger": rgbToHex(theme.danger),
    "--bm-recap-from": rgbToHex(theme.accent),
    "--bm-recap-mid": rgbToHex(recapMid),
    "--bm-recap-to": rgbToHex(theme.accentSecondary),
    "--bm-radius-button": BOOKING_MODAL_BUTTON_RADIUS[theme.id],
    "--bm-radius-panel": BOOKING_MODAL_PANEL_RADIUS[theme.id],
    "--bm-radius-field": BOOKING_MODAL_FIELD_RADIUS[theme.id]
  } as const
}

export function siteBookingModalThemeStyle(theme: SiteTemplateInvoiceTheme) {
  return Object.fromEntries(
    Object.entries(siteBookingModalThemeCssVars(theme)).map(([name, value]) => [name, value])
  ) as Record<string, string>
}
