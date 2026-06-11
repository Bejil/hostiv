import type { PropertySiteRecord } from "../../app/types/property-site"
import { resolvePropertyAssetUrl } from "../../app/utils/property-asset-url"
import {
  buildHostivEmailAccentBar,
  buildHostivEmailButton,
  buildHostivEmailFontHead,
  buildHostivPlatformFooter,
  escapeHtmlAttr,
  escapeHtmlText,
  HOSTIV_EMAIL
} from "./hostiv-email-theme"

export type BookingEmailLink = {
  label: string
  href: string
}

const C = HOSTIV_EMAIL

export function getBookingSiteUrl() {
  const raw =
    process.env.NUXT_PUBLIC_SITE_URL?.trim() || process.env.BOOKING_SITE_URL?.trim() || ""

  if (raw) {
    return raw.replace(/\/$/, "")
  }

  return ""
}

/** URL publique du site d’un slug (ex. https://domaine.fr/thegrandappartement). */
export function getPropertyPublicSiteUrl(slug: string) {
  const base = getBookingSiteUrl()

  if (!base) {
    return ""
  }

  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "")

  if (!normalizedSlug) {
    return base
  }

  if (base.endsWith(`/${normalizedSlug}`)) {
    return base
  }

  return `${base}/${normalizedSlug}`
}

export function getPropertyLogoUrl(
  site: PropertySiteRecord,
  options: { slug: string; siteUrl?: string; supabaseUrl?: string; bucket?: string }
) {
  if (!site.logo_path) {
    return ""
  }

  const supabaseUrl = options.supabaseUrl?.trim() || ""

  if (supabaseUrl && options.slug) {
    const storageUrl = resolvePropertyAssetUrl(site.logo_path, {
      slug: options.slug,
      supabaseUrl,
      bucket: options.bucket
    })

    if (storageUrl) {
      return storageUrl
    }
  }

  const siteUrl = options.siteUrl?.replace(/\/$/, "") || ""

  if (!siteUrl) {
    return ""
  }

  const path = site.logo_path.startsWith("/") ? site.logo_path : `/${site.logo_path}`

  return `${siteUrl}${path}`
}

export function getBookingSiteLinks(siteUrl: string): BookingEmailLink[] {
  if (!siteUrl) {
    return []
  }

  return [
    { label: "Voir le site", href: siteUrl },
    { label: "Quartier & accès", href: `${siteUrl}/#quartier` },
    { label: "Règlement & arrivée", href: `${siteUrl}/#reglement` },
    { label: "Équipements", href: `${siteUrl}/#equipements` }
  ]
}

/** Retire les mentions « max » issues du formulaire (ex. séjour max 31 nuits). */
export function sanitizeBookingEmailMeta(meta: string) {
  if (!meta.trim()) {
    return ""
  }

  let s = meta.trim()

  s = s.replace(/\s*·\s*séjour\s+max\s+\d+\s+nuits?/gi, "")
  s = s.replace(/(\d+\s+voyageurs?)\s+max\b/gi, "$1")
  s = s.replace(/\s*·\s*1\s+bébé\s+max/gi, "")
  s = s.replace(/\s*·\s*(\d+\s+bébés?)\s+max/gi, " · $1")
  s = s.replace(/\bmax\s*·\s*/gi, " · ")
  s = s.replace(/\s*·\s*·/g, " · ")
  s = s.replace(/\s*·\s*$/g, "")

  return s.trim()
}

export function buildEmailHeaderRow(options: {
  title: string
  headerSubtitle?: string
  brandName: string
  logoUrl?: string
}) {
  const title = escapeHtmlAttr(options.title)
  const subtitle = options.headerSubtitle?.trim()
    ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:${C.inkSoft};">${escapeHtmlAttr(options.headerSubtitle)}</p>`
    : ""

  const brandBlock = options.logoUrl
    ? `<img src="${escapeHtmlAttr(options.logoUrl)}" alt="${escapeHtmlAttr(options.brandName)}" width="168" style="display:block;width:168px;max-width:100%;height:auto;margin:0 0 16px;border:0;outline:none;text-decoration:none;" />`
    : `<p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent};">${escapeHtmlAttr(options.brandName)}</p>`

  return `
          <tr>
            <td bgcolor="${C.surfaceMuted}" style="background-color:${C.surfaceMuted} !important;padding:30px 32px 26px;border-bottom:1px solid ${C.border};">
              ${brandBlock}
              <h1 style="margin:0;font-family:${C.font};font-size:24px;font-weight:800;line-height:1.25;letter-spacing:-0.03em;color:${C.ink} !important;">${title}</h1>
              ${subtitle}
            </td>
          </tr>`
}

export function buildEmailShell(options: {
  title: string
  headerSubtitle?: string
  brandName: string
  logoUrl?: string
  bodyHtml: string
  footerHtml: string
  preheader?: string
}) {
  const headerRow = buildEmailHeaderRow({
    title: options.title,
    headerSubtitle: options.headerSubtitle,
    brandName: options.brandName,
    logoUrl: options.logoUrl
  })

  // buildEmailHeaderRow inclut déjà la barre d’accent — retirer le doublon du document.
  const propertyFooter = options.footerHtml
  const platformFooter = buildHostivPlatformFooter()

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtmlText(options.title)}</title>
${buildHostivEmailFontHead()}
</head>
<body style="margin:0;padding:0;background-color:${C.bg};color:${C.ink};color-scheme:light;font-family:${C.font};-webkit-font-smoothing:antialiased;">
  ${options.preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtmlText(options.preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${C.bg};padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:${C.surface};border-radius:${C.radiusLg};border:1px solid ${C.border};overflow:hidden;box-shadow:${C.shadow};">
          ${buildHostivEmailAccentBar()}
          ${headerRow}
          ${options.bodyHtml}
        </table>
        ${propertyFooter}
        ${platformFooter}
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildEmailSectionLabel(label: string) {
  return `<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.label};">${label}</p>`
}

export function buildEmailInfoCard(options: {
  label: string
  primary: string
  secondary?: string
  paddingTop?: string
}) {
  const secondary = options.secondary?.trim()
    ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${C.muted};">${options.secondary}</p>`
    : ""

  return `
          <tr>
            <td style="padding:${options.paddingTop ?? "24px"} 32px 0;">
              ${buildEmailSectionLabel(options.label)}
              <div style="margin-top:12px;padding:16px 18px;background-color:${C.surface};border:1px solid ${C.border};border-left:3px solid ${C.accent};border-radius:${C.radius};">
                <p style="margin:0;font-size:17px;font-weight:700;line-height:1.35;color:${C.ink};">${options.primary}</p>
                ${secondary}
              </div>
            </td>
          </tr>`
}

export function buildEmailMessageBlock(label: string, htmlBody: string, paddingBottom = "0") {
  return `
          <tr>
            <td style="padding:24px 32px ${paddingBottom};">
              ${buildEmailSectionLabel(label)}
              <div style="margin-top:12px;padding:16px 18px;background-color:${C.surfaceMuted};border:1px solid ${C.border};border-radius:${C.radius};">
                <p style="margin:0;font-size:15px;line-height:1.6;color:${C.ink};">${htmlBody}</p>
              </div>
            </td>
          </tr>`
}

export function buildEmailContactGrid(
  rows: Array<{ label: string; valueHtml: string }>,
  paddingTop = "24px"
) {
  const cells = rows
    .map(
      (row, index) => `
                <tr>
                  <td style="padding:${index === 0 ? 0 : 10}px 0 ${index === rows.length - 1 ? 0 : 10}px;font-size:15px;color:${C.ink};line-height:1.5;border-bottom:${index === rows.length - 1 ? "0" : `1px solid ${C.border}`};">
                    <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.label};margin-bottom:4px;">${row.label}</strong>
                    ${row.valueHtml}
                  </td>
                </tr>`
    )
    .join("")

  return `
          <tr>
            <td style="padding:${paddingTop} 32px 0;">
              ${buildEmailSectionLabel("Coordonnées du voyageur")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;padding:4px 18px;background-color:${C.surface};border:1px solid ${C.border};border-left:3px solid ${C.accent};border-radius:${C.radius};">
                ${cells}
              </table>
            </td>
          </tr>`
}

export function buildEmailApartmentSection(
  site: PropertySiteRecord,
  escape: (s: string) => string
) {
  const bullets = site.content.email.access_lines
    .map(
      (line) =>
        `<tr><td style="padding:0 0 10px 0;font-size:14px;line-height:1.55;color:${C.inkSoft};vertical-align:top;">
          <span style="display:inline-block;width:18px;color:${C.accent};font-weight:800;">✓</span> ${escape(line)}
        </td></tr>`
    )
    .join("")

  return `
          <tr>
            <td style="padding:24px 32px;">
              ${buildEmailSectionLabel("L’appartement")}
              <div style="margin-top:12px;padding:18px 20px;background-color:${C.surface};border:1px solid ${C.border};border-radius:${C.radius};">
                <p style="margin:0 0 6px;font-size:16px;font-weight:800;letter-spacing:-0.02em;color:${C.ink};">${escape(site.brand_name)}</p>
                <p style="margin:0 0 14px;font-size:13px;color:${C.muted};">${escape(site.brand_meta)}</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:${C.inkSoft};"><strong style="color:${C.ink};">Adresse</strong><br/>${escape(site.location.address)}</p>
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.label};">Accès &amp; arrivée</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${bullets}</table>
              </div>
            </td>
          </tr>`
}

export function buildEmailSiteLinksSection(
  links: BookingEmailLink[],
  escape: (s: string) => string,
  options?: { intro?: string }
) {
  if (links.length === 0) {
    return ""
  }

  const intro = options?.intro
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${C.inkSoft};">${options.intro}</p>`
    : ""

  const linkRows = links
    .map(
      (link, index) => `
        <tr>
          <td style="padding:${index > 0 ? "10px" : "0"} 0 0;">
            ${buildHostivEmailButton(link.label, link.href, index === 0 ? "primary" : "secondary")}
          </td>
        </tr>`
    )
    .join("")

  return `
          <tr>
            <td style="padding:24px 32px 32px;">
              ${buildEmailSectionLabel("Sur le site")}
              <div style="margin-top:12px;padding:18px 20px;background-color:${C.surfaceMuted};border:1px solid ${C.border};border-radius:${C.radius};">
                ${intro}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${linkRows}</table>
              </div>
            </td>
          </tr>`
}

export function buildEmailFooter(siteUrl: string, escape: (s: string) => string, note: string) {
  const siteLine = siteUrl
    ? `<a href="${escape(siteUrl)}" style="color:${C.accentDeep};font-weight:600;text-decoration:underline;">${escape(siteUrl.replace(/^https?:\/\//, ""))}</a><br/>`
    : ""

  return `<p style="margin:20px 0 0;font-size:12px;line-height:1.55;color:${C.muted};text-align:center;max-width:600px;">${siteLine}${escape(note)}</p>`
}

export function buildApartmentTextBlock(site: PropertySiteRecord): string[] {
  return [
    ``,
    `— ${site.brand_name} —`,
    site.brand_meta,
    `Adresse : ${site.location.address}`,
    `Accès :`,
    ...site.content.email.access_lines.map((line) => `  · ${line}`)
  ]
}

export function buildSiteLinksTextBlock(links: BookingEmailLink[]): string[] {
  if (links.length === 0) {
    return []
  }

  return [``, `Liens utiles :`, ...links.map((link) => `  ${link.label} : ${link.href}`)]
}
