function getMarketingSiteBaseUrl() {
  const raw =
    process.env.NUXT_PUBLIC_SITE_URL?.trim() || process.env.BOOKING_SITE_URL?.trim() || ""

  return raw ? raw.replace(/\/$/, "") : ""
}

/** Palette et typo alignées sur `assets/css/pages/hostiv/hostiv.css`. */
export const HOSTIV_EMAIL = {
  font:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  bg: "#f6f8f7",
  surface: "#ffffff",
  surfaceMuted: "#eef3f1",
  ink: "#0c1513",
  inkSoft: "#3a4a45",
  muted: "#6a7c76",
  label: "#6a7c76",
  accent: "#0d9b6e",
  accentMid: "#12b886",
  accentDeep: "#067a57",
  accentText: "#f0fdf8",
  accentSoft: "#d8f5eb",
  border: "#e2eae6",
  borderStrong: "#d5ddd9",
  radius: "18px",
  radiusLg: "22px",
  shadow: "0 18px 48px rgba(12, 21, 19, 0.08)",
  priceBg: "#0d9b6e",
  priceBgGradient: "linear-gradient(155deg, #067a57 0%, #0d9b6e 48%, #12b886 100%)"
} as const

export function getHostivMarketingUrl() {
  return getMarketingSiteBaseUrl() || "https://hostiv.fr"
}

export function getHostivLogoEmailUrl() {
  const base = getHostivMarketingUrl().replace(/\/$/, "")

  return `${base}/hostiv/logo.svg`
}

export function escapeHtmlAttr(raw: string) {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function escapeHtmlText(raw: string) {
  return escapeHtmlAttr(raw).replace(/'/g, "&#39;")
}

export function buildHostivEmailFontHead() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />`
}

export function buildHostivEmailAccentBar() {
  return `
          <tr>
            <td height="4" style="height:4px;line-height:4px;font-size:0;background:${HOSTIV_EMAIL.priceBgGradient};background-color:${HOSTIV_EMAIL.accentDeep};border-radius:${HOSTIV_EMAIL.radiusLg} ${HOSTIV_EMAIL.radiusLg} 0 0;">&nbsp;</td>
          </tr>`
}

export function buildHostivPlatformFooter(options?: { note?: string }) {
  const marketingUrl = getHostivMarketingUrl()
  const logoUrl = getHostivLogoEmailUrl()
  const note = options?.note?.trim()
    ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.55;color:${HOSTIV_EMAIL.muted};">${escapeHtmlText(options.note)}</p>`
    : ""

  return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin-top:20px;">
          <tr>
            <td align="center" style="padding:0 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:16px 20px;background-color:${HOSTIV_EMAIL.surface};border:1px solid ${HOSTIV_EMAIL.border};border-radius:999px;">
                    <a href="${escapeHtmlAttr(marketingUrl)}" style="text-decoration:none;display:inline-block;">
                      <img src="${escapeHtmlAttr(logoUrl)}" alt="Hostiv" width="120" height="29" style="display:block;width:120px;max-width:100%;height:auto;border:0;outline:none;" />
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${HOSTIV_EMAIL.accent};">Propulsé par Hostiv</p>
              <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:${HOSTIV_EMAIL.muted};">
                <a href="${escapeHtmlAttr(marketingUrl)}" style="color:${HOSTIV_EMAIL.accentDeep};text-decoration:underline;">${escapeHtmlText(marketingUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
              ${note}
            </td>
          </tr>
        </table>`
}

export function buildHostivEmailButton(label: string, href: string, variant: "primary" | "secondary" = "primary") {
  const safeLabel = escapeHtmlText(label)
  const safeHref = escapeHtmlAttr(href)

  if (variant === "primary") {
    return `<a href="${safeHref}" style="display:block;padding:14px 18px;border-radius:999px;background:${HOSTIV_EMAIL.priceBgGradient};background-color:${HOSTIV_EMAIL.accentDeep};color:${HOSTIV_EMAIL.accentText};font-size:14px;font-weight:700;line-height:1.3;text-decoration:none;text-align:center;box-shadow:0 10px 24px rgba(6,122,87,0.22);">${safeLabel}</a>`
  }

  return `<a href="${safeHref}" style="display:block;padding:13px 18px;border-radius:999px;background-color:${HOSTIV_EMAIL.surface};border:1px solid ${HOSTIV_EMAIL.borderStrong};color:${HOSTIV_EMAIL.ink};font-size:14px;font-weight:700;line-height:1.3;text-decoration:none;text-align:center;">${safeLabel}</a>`
}

export function buildHostivContactEmailHtml(options: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const z = escapeHtmlText
  const bodyHtml = `
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${HOSTIV_EMAIL.accent};">Nouveau message</p>
              <h1 style="margin:10px 0 0;font-family:${HOSTIV_EMAIL.font};font-size:24px;font-weight:800;line-height:1.2;letter-spacing:-0.03em;color:${HOSTIV_EMAIL.ink};">Formulaire de contact</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:${HOSTIV_EMAIL.inkSoft};">Un visiteur vous a écrit depuis la page contact Hostiv.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};">Coordonnées</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${HOSTIV_EMAIL.surface};border:1px solid ${HOSTIV_EMAIL.border};border-left:3px solid ${HOSTIV_EMAIL.accent};border-radius:${HOSTIV_EMAIL.radius};">
                <tr>
                  <td style="padding:16px 18px 10px;font-size:15px;line-height:1.5;color:${HOSTIV_EMAIL.ink};border-bottom:1px solid ${HOSTIV_EMAIL.border};">
                    <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};margin-bottom:4px;">Nom</strong>
                    ${z(options.name)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 18px;font-size:15px;line-height:1.5;color:${HOSTIV_EMAIL.ink};border-bottom:1px solid ${HOSTIV_EMAIL.border};">
                    <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};margin-bottom:4px;">E-mail</strong>
                    <a href="mailto:${escapeHtmlAttr(options.email)}" style="color:${HOSTIV_EMAIL.accentDeep};text-decoration:underline;">${z(options.email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 18px 16px;font-size:15px;line-height:1.5;color:${HOSTIV_EMAIL.ink};">
                    <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};margin-bottom:4px;">Sujet</strong>
                    ${z(options.subject)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};">Message</p>
              <div style="padding:16px 18px;background-color:${HOSTIV_EMAIL.surfaceMuted};border:1px solid ${HOSTIV_EMAIL.border};border-radius:${HOSTIV_EMAIL.radius};">
                <p style="margin:0;font-size:15px;line-height:1.65;color:${HOSTIV_EMAIL.ink};white-space:pre-wrap;">${z(options.message)}</p>
              </div>
            </td>
          </tr>`

  return buildHostivEmailDocument({
    title: `[Hostiv] ${options.subject}`,
    preheader: `Message de ${options.name}`,
    bodyHtml
  })
}

export function buildHostivContactConfirmationText(options: {
  name: string
  subject: string
  message: string
}) {
  const marketingUrl = getHostivMarketingUrl()

  return [
    `Bonjour ${options.name},`,
    ``,
    `Nous avons bien reçu votre message via le formulaire de contact Hostiv.`,
    `Notre équipe vous répondra à cette adresse sous 2 jours ouvrés en général.`,
    ``,
    `Récapitulatif de votre demande`,
    `Sujet : ${options.subject}`,
    ``,
    `Message :`,
    options.message,
    ``,
    `En attendant, vous pouvez consulter notre site : ${marketingUrl}`,
    ``,
    `— L’équipe Hostiv`
  ].join("\n")
}

/** Accusé de réception envoyé au visiteur après soumission du formulaire contact. */
export function buildHostivContactConfirmationEmailHtml(options: {
  name: string
  subject: string
  message: string
}) {
  const z = escapeHtmlText
  const marketingUrl = getHostivMarketingUrl()
  const firstName = options.name.trim().split(/\s+/)[0] || options.name

  const bodyHtml = `
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${HOSTIV_EMAIL.accent};">Demande reçue</p>
              <h1 style="margin:10px 0 0;font-family:${HOSTIV_EMAIL.font};font-size:24px;font-weight:800;line-height:1.2;letter-spacing:-0.03em;color:${HOSTIV_EMAIL.ink};">Merci pour votre message</h1>
              <p style="margin:14px 0 0;font-size:16px;font-weight:600;line-height:1.55;color:${HOSTIV_EMAIL.ink};">Bonjour ${z(firstName)},</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:${HOSTIV_EMAIL.inkSoft};">Nous avons bien enregistré votre demande. Notre équipe vous répondra à cette adresse <strong style="color:${HOSTIV_EMAIL.ink};">sous 2 jours ouvrés</strong> en général.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};">Récapitulatif</p>
              <div style="padding:16px 18px;background-color:${HOSTIV_EMAIL.surface};border:1px solid ${HOSTIV_EMAIL.border};border-left:3px solid ${HOSTIV_EMAIL.accent};border-radius:${HOSTIV_EMAIL.radius};">
                <p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:${HOSTIV_EMAIL.ink};">
                  <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};margin-bottom:4px;">Sujet</strong>
                  ${z(options.subject)}
                </p>
                <p style="margin:0;font-size:14px;line-height:1.55;color:${HOSTIV_EMAIL.inkSoft};">
                  <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${HOSTIV_EMAIL.label};margin-bottom:6px;">Message</strong>
                  <span style="white-space:pre-wrap;">${z(options.message)}</span>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;">
              ${buildHostivEmailButton("Visiter Hostiv", marketingUrl)}
              <p style="margin:16px 0 0;font-size:13px;line-height:1.55;color:${HOSTIV_EMAIL.muted};text-align:center;">Si votre demande est urgente, répondez directement à cet e-mail.</p>
            </td>
          </tr>`

  return buildHostivEmailDocument({
    title: "Votre message a bien été reçu — Hostiv",
    preheader: "Nous avons bien reçu votre demande et vous répondrons sous 2 jours ouvrés.",
    bodyHtml
  })
}

export function buildHostivEmailDocument(options: {
  title: string
  bodyHtml: string
  footerHtml?: string
  preheader?: string
}) {
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtmlText(options.preheader)}</div>`
    : ""

  const footer = options.footerHtml ?? buildHostivPlatformFooter()

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
<body style="margin:0;padding:0;background-color:${HOSTIV_EMAIL.bg};color:${HOSTIV_EMAIL.ink};color-scheme:light;font-family:${HOSTIV_EMAIL.font};-webkit-font-smoothing:antialiased;">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${HOSTIV_EMAIL.bg};padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:${HOSTIV_EMAIL.surface};border-radius:${HOSTIV_EMAIL.radiusLg};border:1px solid ${HOSTIV_EMAIL.border};overflow:hidden;box-shadow:${HOSTIV_EMAIL.shadow};">
          ${buildHostivEmailAccentBar()}
          ${options.bodyHtml}
        </table>
        ${footer}
      </td>
    </tr>
  </table>
</body>
</html>`
}
