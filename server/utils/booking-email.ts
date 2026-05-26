import {
  buildBookingPriceRecap,
  buildBookingPriceRecapHtml,
  buildBookingPriceRecapTextLines,
  type BookingPriceRecap
} from "./booking-price-recap"
import type { PropertySiteRecord } from "../../app/types/property-site"
import { getPropertySiteBySlug } from "./property-site-repository"
import {
  buildApartmentTextBlock,
  buildEmailApartmentSection,
  buildEmailContactGrid,
  buildEmailFooter,
  buildEmailInfoCard,
  buildEmailMessageBlock,
  buildEmailShell,
  buildEmailSiteLinksSection,
  buildSiteLinksTextBlock,
  getBookingSiteLinks,
  getPropertyLogoUrl,
  getPropertyPublicSiteUrl,
  sanitizeBookingEmailMeta
} from "./booking-email-layout"

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function telHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, "")

  return compact.length >= 8 ? `tel:${compact}` : "#"
}

type BookingEmailContentParts = {
  site: PropertySiteRecord
  safeLastName?: string
  safeFirstName: string
  safePhone?: string
  guestEmail?: string
  datesSummary: string
  safeMeta: string
  safeGuestSummary: string
  safeGuestMeta: string
  priceRecap: BookingPriceRecap | null
  safeMessage: string
  siteUrl: string
  logoUrl: string
  siteLinks: ReturnType<typeof getBookingSiteLinks>
}

function buildSharedEmailSections(
  parts: BookingEmailContentParts,
  options: { isGuest: boolean; includeApartment: boolean }
) {
  const z = escapeHtml
  const priceRecapSection = parts.priceRecap ? buildBookingPriceRecapHtml(parts.priceRecap, z) : ""
  const apartmentSection = options.includeApartment
    ? buildEmailApartmentSection(parts.site, z)
    : ""
  const linksIntro = options.isGuest
    ? "Retrouvez le quartier, le règlement d’arrivée et la liste des équipements sur le site."
    : "Rappel des informations publiées sur le site pour le voyageur."
  const siteLinksSection = buildEmailSiteLinksSection(parts.siteLinks, z, { intro: linksIntro })

  const staySecondary = parts.safeMeta.trim() || undefined
  const guestSecondary = parts.safeGuestMeta.trim() || undefined

  return {
    priceRecapSection,
    apartmentSection,
    siteLinksSection,
    stayCard: buildEmailInfoCard({
      label: options.isGuest ? "Votre séjour" : "Séjour",
      primary: z(parts.datesSummary),
      secondary: staySecondary ? z(staySecondary) : undefined,
      paddingTop: options.isGuest ? "8px" : "24px"
    }),
    guestCard: buildEmailInfoCard({
      label: "Composition",
      primary: z(parts.safeGuestSummary),
      secondary: guestSecondary ? z(guestSecondary) : undefined
    }),
    messageBlock: buildEmailMessageBlock(
      options.isGuest ? "Votre message" : "Message",
      z(parts.safeMessage).replace(/\n/g, "<br/>")
    )
  }
}

function buildBookingRequestHtml(parts: BookingEmailContentParts & {
  safeLastName: string
  safePhone: string
  guestEmail: string
}) {
  const z = escapeHtml
  const mailHref = encodeURIComponent(parts.guestEmail)
  const phoneHref = escapeHtml(telHref(parts.safePhone))
  const shared = buildSharedEmailSections(parts, { isGuest: false, includeApartment: false })

  const bodyHtml = `
          ${buildEmailContactGrid(
            [
              { label: "Nom", valueHtml: z(parts.safeLastName) },
              { label: "Prénom", valueHtml: z(parts.safeFirstName) },
              {
                label: "Téléphone",
                valueHtml: `<a href="${phoneHref}" style="color:#6b4f33;text-decoration:none;">${z(parts.safePhone)}</a>`
              },
              {
                label: "E-mail",
                valueHtml: `<a href="mailto:${mailHref}" style="color:#6b4f33;text-decoration:underline;">${z(parts.guestEmail)}</a>`
              }
            ],
            "24px"
          )}
          ${shared.stayCard}
          ${shared.guestCard}
          ${shared.priceRecapSection}
          ${shared.siteLinksSection}
          ${buildEmailMessageBlock("Message", z(parts.safeMessage).replace(/\n/g, "<br/>"), "32px")}`

  return buildEmailShell({
    title: "Nouvelle réservation",
    headerSubtitle: parts.datesSummary,
    brandName: parts.site.brand_name,
    logoUrl: parts.logoUrl || undefined,
    preheader: `Nouvelle réservation — ${parts.datesSummary}`,
    bodyHtml,
    footerHtml: buildEmailFooter(
      parts.siteUrl,
      z,
      `Notification envoyée depuis le site ${parts.site.brand_name}.`
    )
  })
}

function buildGuestConfirmationHtml(parts: BookingEmailContentParts) {
  const z = escapeHtml
  const shared = buildSharedEmailSections(parts, { isGuest: true, includeApartment: true })

  const introBlock = `
          <tr>
            <td style="padding:26px 32px 0;">
              <p style="margin:0;font-size:15px;color:#171311;line-height:1.55;">Bonjour ${z(parts.safeFirstName)},</p>
              <p style="margin:14px 0 0;font-size:15px;color:#3d3834;line-height:1.55;">Merci pour votre réservation et votre paiement. Votre séjour est confirmé&nbsp;; nous vous recontacterons à cette adresse pour préciser l’heure d’arrivée et les derniers détails pratiques.</p>
            </td>
          </tr>`

  const bodyHtml = `
          ${introBlock}
          ${shared.stayCard}
          ${shared.guestCard}
          ${shared.messageBlock}
          ${shared.priceRecapSection}
          ${shared.apartmentSection}
          ${shared.siteLinksSection}`

  return buildEmailShell({
    title: "Réservation confirmée",
    headerSubtitle: parts.datesSummary,
    brandName: parts.site.brand_name,
    logoUrl: parts.logoUrl || undefined,
    preheader: `Votre réservation est confirmée — ${parts.datesSummary}`,
    bodyHtml,
    footerHtml: buildEmailFooter(
      parts.siteUrl,
      z,
      "Répondez à cet e-mail pour nous joindre — nous vous répondons depuis la même conversation."
    )
  })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeMultiline(text: string, maxLen: number) {
  const trimmed = text.trim().replace(/\r\n/g, "\n")

  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen)
  }

  return trimmed
}

export async function sendResendEmail(params: {
  resendApiKey: string
  from: string
  to: string
  replyTo?: string
  subject: string
  text: string
  html: string
}) {
  const payload: Record<string, unknown> = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    text: params.text,
    html: params.html
  }

  if (params.replyTo?.trim()) {
    payload.reply_to = params.replyTo.trim()
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  const raw = await response.text()
  let parsed: { message?: string } | null = null

  try {
    parsed = JSON.parse(raw) as { message?: string }
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const detail = parsed?.message || raw || response.statusText

    throw new Error(`Resend ${response.status}: ${detail}`)
  }
}

export async function sendBookingRequestEmail(params: {
  resendApiKey: string
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
  html: string
}) {
  await sendResendEmail({
    resendApiKey: params.resendApiKey,
    from: params.from,
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
    html: params.html
  })
}

export async function parseBookingRequestBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, message: "Corps de requête invalide." }
  }

  const o = body as Record<string, unknown>

  const propertySlug =
    typeof o.propertySlug === "string" ? o.propertySlug.trim().toLowerCase() : ""

  if (!propertySlug) {
    return { ok: false as const, message: "Site de réservation non précisé." }
  }

  const site = await getPropertySiteBySlug(propertySlug)

  if (!site) {
    return { ok: false as const, message: "Site de réservation introuvable." }
  }

  const guestEmail = typeof o.guestEmail === "string" ? o.guestEmail.trim() : ""
  const lastName =
    typeof o.lastName === "string" ? o.lastName.trim().replace(/\s+/g, " ") : ""
  const firstName =
    typeof o.firstName === "string" ? o.firstName.trim().replace(/\s+/g, " ") : ""
  const phone = typeof o.phone === "string" ? o.phone.replace(/\D/g, "") : ""
  const datesSummary = typeof o.datesSummary === "string" ? o.datesSummary.trim() : ""
  const datesMeta = typeof o.datesMeta === "string" ? o.datesMeta.trim() : ""
  const guestSummary = typeof o.guestSummary === "string" ? o.guestSummary.trim() : ""
  const guestMeta = typeof o.guestMeta === "string" ? o.guestMeta.trim() : ""
  const message = typeof o.message === "string" ? o.message : ""
  const stayNightsRaw = o.stayNights
  const mainGuestsRaw = o.mainGuests
  const paidByCard = o.paidByCard === true
  const estimateLabel =
    typeof o.estimateLabel === "string" ? o.estimateLabel.trim() : ""

  const stayNights =
    typeof stayNightsRaw === "number"
      ? stayNightsRaw
      : typeof stayNightsRaw === "string"
        ? Number(stayNightsRaw)
        : NaN
  const mainGuests =
    typeof mainGuestsRaw === "number"
      ? mainGuestsRaw
      : typeof mainGuestsRaw === "string"
        ? Number(mainGuestsRaw)
        : NaN

  if (!guestEmail || !EMAIL_RE.test(guestEmail)) {
    return { ok: false as const, message: "Adresse e-mail invalide." }
  }

  if (!lastName || lastName.length < 2 || lastName.length > 80) {
    return { ok: false as const, message: "Nom invalide." }
  }

  if (!firstName || firstName.length < 2 || firstName.length > 80) {
    return { ok: false as const, message: "Prénom invalide." }
  }

  if (!phone || phone.length < 8 || phone.length > 15) {
    return { ok: false as const, message: "Numéro de téléphone invalide." }
  }

  if (!datesSummary || datesSummary.length > 120) {
    return { ok: false as const, message: "Résumé des dates invalide." }
  }

  if (!message.trim()) {
    return { ok: false as const, message: "Message obligatoire." }
  }

  const safeMessage = normalizeMultiline(message, 8000)
  const safeMeta = sanitizeBookingEmailMeta(normalizeMultiline(datesMeta, 300))
  const safeGuestSummary = normalizeMultiline(guestSummary, 200)
  const safeGuestMeta = sanitizeBookingEmailMeta(normalizeMultiline(guestMeta, 200))
  const safeLastName = normalizeMultiline(lastName, 80)
  const safeFirstName = normalizeMultiline(firstName, 80)
  const safePhone = normalizeMultiline(phone, 15)

  const siteUrl = getPropertyPublicSiteUrl(propertySlug)
  const logoUrl = getPropertyLogoUrl(site, {
    slug: propertySlug,
    siteUrl,
    supabaseUrl: process.env.SUPABASE_URL?.trim() || "",
    bucket: process.env.NUXT_PUBLIC_PROPERTY_ASSETS_BUCKET?.trim() || undefined
  })
  const siteLinks = getBookingSiteLinks(siteUrl)

  let priceRecap: BookingPriceRecap | null = null

  if (Number.isFinite(stayNights) && stayNights >= 1 && Number.isFinite(mainGuests) && mainGuests >= 1) {
    priceRecap = buildBookingPriceRecap(stayNights, mainGuests, site.booking_config, {
      paidByCard
    })
  } else if (estimateLabel) {
    priceRecap = {
      lines: [],
      total: normalizeMultiline(estimateLabel, 80),
      footnote: paidByCard ? "Montant réglé par carte sécurisée." : ""
    }
  }

  const priceRecapTextLines = priceRecap ? buildBookingPriceRecapTextLines(priceRecap) : []
  const apartmentText = buildApartmentTextBlock(site)
  const siteLinksText = buildSiteLinksTextBlock(siteLinks)

  const contentBase: BookingEmailContentParts = {
    site,
    safeFirstName,
    datesSummary,
    safeMeta,
    safeGuestSummary,
    safeGuestMeta,
    priceRecap,
    safeMessage,
    siteUrl,
    logoUrl,
    siteLinks
  }

  const text = [
    `Nouvelle réservation`,
    ``,
    `Coordonnées du voyageur`,
    `Nom : ${safeLastName}`,
    `Prénom : ${safeFirstName}`,
    `Téléphone : ${safePhone}`,
    `E-mail : ${guestEmail}`,
    ``,
    `Dates : ${datesSummary}`,
    ...(safeMeta ? [safeMeta] : []),
    ``,
    `Voyageurs : ${safeGuestSummary}`,
    ...(safeGuestMeta ? [safeGuestMeta] : []),
    ...(priceRecapTextLines.length > 0 ? [``, ...priceRecapTextLines] : []),
    ...siteLinksText,
    ``,
    `Message :`,
    safeMessage
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")

  const subject = `Nouvelle réservation — ${datesSummary}`.slice(0, 998)

  const html = buildBookingRequestHtml({
    ...contentBase,
    safeLastName,
    safePhone,
    guestEmail
  })

  const guestSubject = `Réservation confirmée — ${datesSummary}`.slice(0, 998)

  const guestText = [
    `Bonjour ${safeFirstName},`,
    ``,
    `Merci pour votre réservation et votre paiement.`,
    `Votre séjour est confirmé ; nous vous recontacterons à cette adresse pour les détails pratiques.`,
    ``,
    `Récapitulatif de votre séjour`,
    `Dates : ${datesSummary}`,
    ...(safeMeta ? [safeMeta] : []),
    ``,
    `Composition : ${safeGuestSummary}`,
    ...(safeGuestMeta ? [safeGuestMeta] : []),
    ``,
    `Votre message :`,
    safeMessage,
    ...(priceRecapTextLines.length > 0 ? [``, ...priceRecapTextLines] : []),
    ...apartmentText,
    ...siteLinksText
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")

  const guestHtml = buildGuestConfirmationHtml(contentBase)

  return {
    ok: true as const,
    propertySlug,
    guestEmail,
    subject,
    text,
    html,
    guestSubject,
    guestText,
    guestHtml
  }
}
