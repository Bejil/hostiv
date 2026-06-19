import type { HostivLocale } from "../../app/types/hostiv-locale"
import type { PropertySiteRecord } from "../../app/types/property-site"
import { getPropertySiteBySlug } from "./property-site-repository"
import {
  buildEmailContactGrid,
  buildEmailFooter,
  buildEmailInfoCard,
  buildEmailMessageBlock,
  buildEmailShell,
  getPropertyLogoUrl,
  getPropertyPublicSiteUrl
} from "./booking-email-layout"
import { HOSTIV_EMAIL } from "./hostiv-email-theme"
import { sendResendEmail } from "./booking-email"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CONTACT_ERRORS = {
  fr: {
    unavailable: "Envoi de message indisponible pour le moment.",
    invalidBody: "Corps de requête invalide.",
    siteNotFound: "Site introuvable.",
    nameRequired: "Indiquez votre nom.",
    invalidEmail: "Adresse e-mail invalide.",
    messageTooShort: "Votre message doit contenir au moins 10 caractères.",
    hostEmailMissing:
      "Contact indisponible : l’hôte n’a pas encore configuré son compte Hostiv.",
    sendFailed: "Impossible d’envoyer votre message. Réessayez plus tard."
  },
  en: {
    unavailable: "Message delivery is unavailable right now.",
    invalidBody: "Invalid request body.",
    siteNotFound: "Property site not found.",
    nameRequired: "Please enter your name.",
    invalidEmail: "Invalid email address.",
    messageTooShort: "Your message must be at least 10 characters.",
    hostEmailMissing: "Contact unavailable: the host has not set up their Hostiv account yet.",
    sendFailed: "Unable to send your message. Please try again later."
  }
} as const

export function siteGuestContactErrors(locale: HostivLocale) {
  return locale === "en" ? CONTACT_ERRORS.en : CONTACT_ERRORS.fr
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeText(text: string, maxLen: number) {
  const trimmed = text.trim().replace(/\r\n/g, "\n")

  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen)
  }

  return trimmed
}

function optionalContextLine(label: string, value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) {
    return ""
  }

  return `${label}: ${trimmed}`
}

export async function parseSiteGuestContactBody(
  slug: string,
  body: unknown,
  options?: { publishedOnly?: boolean }
) {
  const locale: HostivLocale =
    body && typeof body === "object" && (body as { locale?: string }).locale === "en" ? "en" : "fr"
  const errors = siteGuestContactErrors(locale)

  if (!body || typeof body !== "object") {
    return { ok: false as const, message: errors.invalidBody }
  }

  const o = body as Record<string, unknown>
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return { ok: false as const, message: errors.siteNotFound }
  }

  const publishedOnly = options?.publishedOnly !== false
  const site = await getPropertySiteBySlug(normalizedSlug, { publishedOnly })

  if (!site) {
    return { ok: false as const, message: errors.siteNotFound }
  }

  const website = typeof o.website === "string" ? o.website.trim() : ""

  if (website) {
    return { ok: true as const, honeypot: true as const }
  }

  const name = typeof o.name === "string" ? o.name.trim().replace(/\s+/g, " ") : ""
  const email = typeof o.email === "string" ? o.email.trim() : ""
  const message = typeof o.message === "string" ? o.message : ""
  const datesSummary = typeof o.datesSummary === "string" ? o.datesSummary.trim() : ""
  const datesMeta = typeof o.datesMeta === "string" ? o.datesMeta.trim() : ""
  const guestSummary = typeof o.guestSummary === "string" ? o.guestSummary.trim() : ""
  const guestMeta = typeof o.guestMeta === "string" ? o.guestMeta.trim() : ""

  if (!name || name.length < 2 || name.length > 120) {
    return { ok: false as const, message: errors.nameRequired }
  }

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false as const, message: errors.invalidEmail }
  }

  if (!message.trim() || message.trim().length < 10) {
    return { ok: false as const, message: errors.messageTooShort }
  }

  const safeName = normalizeText(name, 120)
  const safeEmail = normalizeText(email, 120)
  const safeMessage = normalizeText(message, 8000)
  const safeDatesSummary = normalizeText(datesSummary, 120)
  const safeDatesMeta = normalizeText(datesMeta, 200)
  const safeGuestSummary = normalizeText(guestSummary, 200)
  const safeGuestMeta = normalizeText(guestMeta, 200)

  const siteUrl = getPropertyPublicSiteUrl(normalizedSlug)
  const logoUrl = getPropertyLogoUrl(site, {
    slug: normalizedSlug,
    siteUrl,
    supabaseUrl: process.env.SUPABASE_URL?.trim() || "",
    bucket: process.env.NUXT_PUBLIC_PROPERTY_ASSETS_BUCKET?.trim() || undefined
  })

  const hostSubject =
    locale === "en"
      ? `[${site.brand_name}] Guest question — ${safeName}`
      : `[${site.brand_name}] Question visiteur — ${safeName}`

  const guestSubject =
    locale === "en"
      ? `${site.brand_name} — We received your message`
      : `${site.brand_name} — Nous avons bien reçu votre message`

  const contextLines = [
    optionalContextLine(locale === "en" ? "Dates" : "Dates", safeDatesSummary),
    optionalContextLine(locale === "en" ? "Stay details" : "Détail séjour", safeDatesMeta),
    optionalContextLine(locale === "en" ? "Guests" : "Voyageurs", safeGuestSummary),
    optionalContextLine(locale === "en" ? "Guest details" : "Détail voyageurs", safeGuestMeta)
  ].filter(Boolean)

  const hostText = [
    locale === "en" ? `Name: ${safeName}` : `Nom : ${safeName}`,
    locale === "en" ? `Email: ${safeEmail}` : `E-mail : ${safeEmail}`,
    "",
    ...contextLines,
    contextLines.length ? "" : undefined,
    safeMessage
  ]
    .filter((line) => line !== undefined)
    .join("\n")

  const guestText =
    locale === "en"
      ? [
          `Hello ${safeName},`,
          "",
          `Thank you for your message about ${site.brand_name}. The host will reply to you at this address.`,
          "",
          ...contextLines,
          contextLines.length ? "" : undefined,
          safeMessage
        ]
          .filter((line) => line !== undefined)
          .join("\n")
      : [
          `Bonjour ${safeName},`,
          "",
          `Merci pour votre message concernant ${site.brand_name}. L’hôte vous répondra à cette adresse.`,
          "",
          ...contextLines,
          contextLines.length ? "" : undefined,
          safeMessage
        ]
          .filter((line) => line !== undefined)
          .join("\n")

  const hostHtml = buildHostInquiryEmailHtml({
    site,
    locale,
    safeName,
    safeEmail,
    safeMessage,
    safeDatesSummary,
    safeDatesMeta,
    safeGuestSummary,
    safeGuestMeta,
    siteUrl,
    logoUrl
  })

  const guestHtml = buildGuestInquiryConfirmationHtml({
    site,
    locale,
    safeName,
    safeMessage,
    safeDatesSummary,
    safeDatesMeta,
    safeGuestSummary,
    safeGuestMeta,
    siteUrl,
    logoUrl
  })

  return {
    ok: true as const,
    honeypot: false as const,
    locale,
    site,
    propertySlug: normalizedSlug,
    guestEmail: safeEmail,
    hostSubject,
    guestSubject,
    hostText,
    guestText,
    hostHtml,
    guestHtml
  }
}

function buildContextCards(
  z: (value: string) => string,
  locale: HostivLocale,
  parts: {
    safeDatesSummary: string
    safeDatesMeta: string
    safeGuestSummary: string
    safeGuestMeta: string
  }
) {
  const cards: string[] = []

  if (parts.safeDatesSummary.trim()) {
    cards.push(
      buildEmailInfoCard({
        label: locale === "en" ? "Dates" : "Dates",
        primary: z(parts.safeDatesSummary),
        secondary: parts.safeDatesMeta.trim() ? z(parts.safeDatesMeta) : undefined
      })
    )
  }

  if (parts.safeGuestSummary.trim()) {
    cards.push(
      buildEmailInfoCard({
        label: locale === "en" ? "Guests" : "Voyageurs",
        primary: z(parts.safeGuestSummary),
        secondary: parts.safeGuestMeta.trim() ? z(parts.safeGuestMeta) : undefined
      })
    )
  }

  return cards.join("")
}

function buildHostInquiryEmailHtml(options: {
  site: PropertySiteRecord
  locale: HostivLocale
  safeName: string
  safeEmail: string
  safeMessage: string
  safeDatesSummary: string
  safeDatesMeta: string
  safeGuestSummary: string
  safeGuestMeta: string
  siteUrl: string
  logoUrl: string
}) {
  const z = escapeHtml
  const mailHref = encodeURIComponent(options.safeEmail)
  const contextCards = buildContextCards(z, options.locale, options)

  const bodyHtml = `
          ${buildEmailContactGrid(
            [
              {
                label: options.locale === "en" ? "Name" : "Nom",
                valueHtml: z(options.safeName)
              },
              {
                label: "E-mail",
                valueHtml: `<a href="mailto:${mailHref}" style="color:${HOSTIV_EMAIL.accentDeep};text-decoration:underline;font-weight:600;">${z(options.safeEmail)}</a>`
              }
            ],
            "24px"
          )}
          ${contextCards}
          ${buildEmailMessageBlock(
            options.locale === "en" ? "Message" : "Message",
            z(options.safeMessage).replace(/\n/g, "<br/>"),
            contextCards ? "24px" : "32px"
          )}`

  return buildEmailShell({
    title: options.locale === "en" ? "Guest question" : "Question visiteur",
    headerSubtitle:
      options.locale === "en"
        ? "A visitor has a question about a potential stay"
        : "Un visiteur pose une question sur un futur séjour",
    brandName: options.site.brand_name,
    logoUrl: options.logoUrl || undefined,
    preheader:
      options.locale === "en"
        ? `Guest question — ${options.safeName}`
        : `Question visiteur — ${options.safeName}`,
    bodyHtml,
    footerHtml: buildEmailFooter(
      options.siteUrl,
      z,
      options.locale === "en"
        ? `Notification sent from the ${options.site.brand_name} website.`
        : `Notification envoyée depuis le site ${options.site.brand_name}.`
    )
  })
}

function buildGuestInquiryConfirmationHtml(options: {
  site: PropertySiteRecord
  locale: HostivLocale
  safeName: string
  safeMessage: string
  safeDatesSummary: string
  safeDatesMeta: string
  safeGuestSummary: string
  safeGuestMeta: string
  siteUrl: string
  logoUrl: string
}) {
  const z = escapeHtml
  const contextCards = buildContextCards(z, options.locale, options)
  const intro =
    options.locale === "en"
      ? `Thank you for reaching out about <strong>${z(options.site.brand_name)}</strong>. The host will reply to you at this email address.`
      : `Merci pour votre message concernant <strong>${z(options.site.brand_name)}</strong>. L’hôte vous répondra à cette adresse.`

  const bodyHtml = `
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0;font-size:16px;font-weight:600;color:${HOSTIV_EMAIL.ink};line-height:1.55;">${
                options.locale === "en" ? `Hello ${z(options.safeName)},` : `Bonjour ${z(options.safeName)},`
              }</p>
              <p style="margin:14px 0 0;font-size:15px;color:${HOSTIV_EMAIL.inkSoft};line-height:1.65;">${intro}</p>
            </td>
          </tr>
          ${contextCards}
          ${buildEmailMessageBlock(
            options.locale === "en" ? "Your message" : "Votre message",
            z(options.safeMessage).replace(/\n/g, "<br/>"),
            contextCards ? "24px" : "32px"
          )}`

  return buildEmailShell({
    title: options.locale === "en" ? "Message received" : "Message bien reçu",
    headerSubtitle: options.site.brand_name,
    brandName: options.site.brand_name,
    logoUrl: options.logoUrl || undefined,
    preheader:
      options.locale === "en"
        ? `We received your message — ${options.site.brand_name}`
        : `Nous avons bien reçu votre message — ${options.site.brand_name}`,
    bodyHtml,
    footerHtml: buildEmailFooter(
      options.siteUrl,
      z,
      options.locale === "en"
        ? "Reply to this email to continue the conversation with the host."
        : "Répondez à cet e-mail pour poursuivre l’échange avec l’hôte."
    )
  })
}

export async function sendSiteGuestContactEmails(params: {
  resendApiKey: string
  from: string
  hostTo: string
  parsed: Extract<Awaited<ReturnType<typeof parseSiteGuestContactBody>>, { ok: true; honeypot: false }>
}) {
  const { parsed } = params

  await sendResendEmail({
    resendApiKey: params.resendApiKey,
    from: params.from,
    to: params.hostTo,
    replyTo: parsed.guestEmail,
    subject: parsed.hostSubject,
    text: parsed.hostText,
    html: parsed.hostHtml
  })

  try {
    await sendResendEmail({
      resendApiKey: params.resendApiKey,
      from: params.from,
      to: parsed.guestEmail,
      replyTo: params.hostTo,
      subject: parsed.guestSubject,
      text: parsed.guestText,
      html: parsed.guestHtml
    })
  } catch (confirmationCause) {
    const detail =
      confirmationCause instanceof Error ? confirmationCause.message : String(confirmationCause)

    console.error("[site-guest-contact] confirmation email failed:", detail)
  }
}
