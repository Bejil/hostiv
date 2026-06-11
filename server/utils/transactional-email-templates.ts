import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import { formatEuro } from "../../app/utils/booking-price"
import { getPropertyPublicSiteUrl } from "./booking-email-layout"
import {
  buildHostivEmailButton,
  buildHostivEmailDocument,
  escapeHtmlAttr,
  escapeHtmlText,
  getHostivMarketingUrl,
  HOSTIV_EMAIL
} from "./hostiv-email-theme"

const C = HOSTIV_EMAIL

function firstNameFromFullName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim() || "Bonjour"
}

function formatStayDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)

  if (!year || !month || !day) {
    return iso
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(year, month - 1, day))
}

export function formatReservationDatesSummary(arrival: string, departure: string) {
  return `${formatStayDate(arrival)} → ${formatStayDate(departure)}`
}

function sectionLabel(label: string) {
  return `<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.label};">${escapeHtmlText(label)}</p>`
}

function infoCard(label: string, primary: string, secondary?: string) {
  const secondaryBlock = secondary?.trim()
    ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${C.muted};">${escapeHtmlText(secondary)}</p>`
    : ""

  return `
              ${sectionLabel(label)}
              <div style="margin-top:12px;padding:16px 18px;background-color:${C.surface};border:1px solid ${C.border};border-left:3px solid ${C.accent};border-radius:${C.radius};">
                <p style="margin:0;font-size:16px;font-weight:700;line-height:1.4;color:${C.ink};">${escapeHtmlText(primary)}</p>
                ${secondaryBlock}
              </div>`
}

function buildTransactionalBody(options: {
  eyebrow: string
  title: string
  greeting?: string
  paragraphs: string[]
  cards?: Array<{ label: string; primary: string; secondary?: string }>
  cta?: { label: string; href: string }
  paddingBottom?: string
}) {
  const greeting = options.greeting
    ? `<p style="margin:14px 0 0;font-size:16px;font-weight:600;line-height:1.55;color:${C.ink};">${escapeHtmlText(options.greeting)}</p>`
    : ""

  const paragraphs = options.paragraphs
    .map(
      (text) =>
        `<p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:${C.inkSoft};">${text}</p>`
    )
    .join("")

  const cards = (options.cards ?? [])
    .map(
      (card, index) => `
          <tr>
            <td style="padding:${index === 0 ? "22px" : "0"} 32px 0;">
              ${infoCard(card.label, card.primary, card.secondary)}
            </td>
          </tr>`
    )
    .join("")

  const cta = options.cta
    ? `
          <tr>
            <td style="padding:24px 32px ${options.paddingBottom ?? "32px"};">
              ${buildHostivEmailButton(options.cta.label, options.cta.href)}
            </td>
          </tr>`
    : ""

  return `
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent};">${escapeHtmlText(options.eyebrow)}</p>
              <h1 style="margin:10px 0 0;font-family:${C.font};font-size:24px;font-weight:800;line-height:1.2;letter-spacing:-0.03em;color:${C.ink};">${escapeHtmlText(options.title)}</h1>
              ${greeting}
              ${paragraphs}
            </td>
          </tr>
          ${cards}
          ${cta}`
}

function buildTransactionalDocument(options: {
  title: string
  preheader: string
  bodyHtml: string
}) {
  return buildHostivEmailDocument({
    title: options.title,
    preheader: options.preheader,
    bodyHtml: options.bodyHtml
  })
}

export function buildHostivWelcomeEmail(options: {
  fullName: string
  propertyName: string
  slug: string
  planLabel: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`
  const firstName = firstNameFromFullName(options.fullName)

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Bienvenue",
    title: "Votre compte Hostiv est prêt",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      "Merci pour votre inscription. Votre espace d’administration est ouvert&nbsp;: personnalisez votre site, configurez les réservations et publiez quand vous êtes prêt.",
      `Forfait activé&nbsp;: <strong style="color:${C.ink};">${escapeHtmlText(options.planLabel)}</strong>.`
    ],
    cards: [
      {
        label: "Votre site",
        primary: options.propertyName,
        secondary: `/${options.slug}`
      }
    ],
    cta: { label: "Ouvrir mon espace admin", href: adminUrl }
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    "Votre compte Hostiv est prêt.",
    `Site : ${options.propertyName} (/${options.slug})`,
    `Forfait : ${options.planLabel}`,
    "",
    `Espace admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: "Bienvenue sur Hostiv — votre compte est créé",
    preheader: "Votre espace admin est prêt. Personnalisez et publiez votre site.",
    html: buildTransactionalDocument({
      title: "Bienvenue sur Hostiv",
      preheader: "Votre espace admin est prêt.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivPlanPurchasedEmail(options: {
  planLabel: string
  planDescription: string
  slug: string
  premiumTools?: boolean
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Forfait activé",
    title: options.premiumTools ? "Option Premium+ activée" : "Paiement confirmé",
    paragraphs: [
      `Votre ${options.premiumTools ? "option" : "forfait"} <strong style="color:${C.ink};">${escapeHtmlText(options.planLabel)}</strong> est maintenant actif sur votre compte.`,
      `${escapeHtmlText(options.planDescription)}`
    ],
    cta: { label: "Retourner à l’admin", href: adminUrl }
  })

  const text = [
    options.premiumTools ? "Option Premium+ activée" : "Forfait Hostiv activé",
    "",
    options.planLabel,
    options.planDescription,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: options.premiumTools
      ? "Hostiv — Option Premium+ activée"
      : "Hostiv — Votre forfait est activé",
    preheader: `${options.planLabel} est actif sur votre compte.`,
    html: buildTransactionalDocument({
      title: "Forfait Hostiv activé",
      preheader: `${options.planLabel} est actif.`,
      bodyHtml
    }),
    text
  }
}

export function buildHostivAccountDeletedEmail(options: { slug: string }) {
  const bodyHtml = buildTransactionalBody({
    eyebrow: "Compte supprimé",
    title: "Votre compte Hostiv a été supprimé",
    paragraphs: [
      `La suppression de votre site <strong style="color:${C.ink};">/${escapeHtmlText(options.slug)}</strong> et de votre compte a bien été enregistrée.`,
      "Vos données de site et votre compte utilisateur ont été effacés de nos systèmes.",
      `Si vous n’êtes pas à l’origine de cette action, contactez-nous rapidement à <a href="mailto:${escapeHtmlAttr("contact@hostiv.fr")}" style="color:${C.accentDeep};font-weight:600;">contact@hostiv.fr</a>.`
    ],
    paddingBottom: "32px"
  })

  const text = [
    "Votre compte Hostiv a été supprimé.",
    "",
    `Site : /${options.slug}`,
    "",
    "Si vous n’êtes pas à l’origine de cette action, contactez contact@hostiv.fr."
  ].join("\n")

  return {
    subject: "Hostiv — Confirmation de suppression de compte",
    preheader: "Votre compte et votre site ont été supprimés.",
    html: buildTransactionalDocument({
      title: "Compte supprimé",
      preheader: "Confirmation de suppression de votre compte Hostiv.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivSitePublishedEmail(options: {
  brandName: string
  slug: string
}) {
  const siteUrl = getPropertyPublicSiteUrl(options.slug)

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Site en ligne",
    title: "Votre site est publié",
    paragraphs: [
      `Félicitations&nbsp;! <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> est désormais visible en ligne. Les visiteurs peuvent consulter votre page et effectuer des réservations si le paiement en ligne est configuré.`
    ],
    cards: siteUrl
      ? [
          {
            label: "Adresse publique",
            primary: siteUrl.replace(/^https?:\/\//, "")
          }
        ]
      : undefined,
    cta: siteUrl ? { label: "Voir mon site en ligne", href: siteUrl } : undefined
  })

  const text = [
    "Votre site est publié.",
    "",
    options.brandName,
    siteUrl ? `URL : ${siteUrl}` : ""
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: `Hostiv — ${options.brandName} est en ligne`,
    preheader: "Votre site de location est maintenant publié.",
    html: buildTransactionalDocument({
      title: "Site publié",
      preheader: `${options.brandName} est en ligne.`,
      bodyHtml
    }),
    text
  }
}

function reservationGuestName(reservation: AdminBookingReservation) {
  return `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()
}

export function buildOwnerReservationCancelledEmail(options: {
  reservation: AdminBookingReservation
  brandName: string
}) {
  const guest = reservationGuestName(options.reservation)
  const dates = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Réservation annulée",
    title: "Annulation enregistrée",
    paragraphs: [
      "Vous avez annulé une réservation. Le voyageur en sera informé par e-mail."
    ],
    cards: [
      { label: "Voyageur", primary: guest, secondary: options.reservation.guest_email },
      { label: "Séjour", primary: dates, secondary: `${options.reservation.stay_nights} nuit(s)` },
      { label: "Logement", primary: options.brandName }
    ],
    paddingBottom: "32px"
  })

  const text = [
    "Réservation annulée.",
    "",
    `Voyageur : ${guest}`,
    `Dates : ${dates}`,
    `Logement : ${options.brandName}`
  ].join("\n")

  return {
    subject: `Réservation annulée — ${dates}`,
    preheader: `Annulation de la réservation de ${guest}.`,
    html: buildTransactionalDocument({
      title: "Réservation annulée",
      preheader: `Annulation pour ${guest}.`,
      bodyHtml
    }),
    text
  }
}

export function buildOwnerReservationRefundedEmail(options: {
  reservation: AdminBookingReservation
  brandName: string
}) {
  const guest = reservationGuestName(options.reservation)
  const dates = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )
  const amount = formatEuro(options.reservation.total_eur)

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Remboursement",
    title: "Remboursement effectué",
    paragraphs: [
      `Le remboursement de <strong style="color:${C.ink};">${escapeHtmlText(amount)}</strong> a été initié via Stripe. La réservation est annulée et le voyageur en est informé.`
    ],
    cards: [
      { label: "Voyageur", primary: guest, secondary: options.reservation.guest_email },
      { label: "Séjour", primary: dates },
      { label: "Montant remboursé", primary: amount }
    ],
    paddingBottom: "32px"
  })

  const text = [
    "Remboursement effectué.",
    "",
    `Montant : ${amount}`,
    `Voyageur : ${guest}`,
    `Dates : ${dates}`
  ].join("\n")

  return {
    subject: `Remboursement effectué — ${amount}`,
    preheader: `Remboursement de ${amount} pour ${guest}.`,
    html: buildTransactionalDocument({
      title: "Remboursement effectué",
      preheader: `Remboursement de ${amount}.`,
      bodyHtml
    }),
    text
  }
}

export function buildGuestReservationCancelledEmail(options: {
  reservation: AdminBookingReservation
  brandName: string
  slug: string
  refunded: boolean
}) {
  const dates = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )
  const firstName = options.reservation.guest_first_name.trim() || "Bonjour"
  const siteUrl = getPropertyPublicSiteUrl(options.slug)
  const amount = formatEuro(options.reservation.total_eur)

  const refundParagraph = options.refunded
    ? `Un remboursement de <strong style="color:${C.ink};">${escapeHtmlText(amount)}</strong> a été initié vers votre moyen de paiement. Le délai d’apparition sur votre relevé dépend de votre banque (souvent 5 à 10 jours ouvrés).`
    : "Aucun remboursement automatique n’est associé à cette annulation. Pour toute question, répondez à cet e-mail."

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Réservation annulée",
    title: options.refunded ? "Votre réservation a été annulée et remboursée" : "Votre réservation a été annulée",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      `Votre séjour chez <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> (${escapeHtmlText(dates)}) a été annulé par l’hôte.`,
      refundParagraph
    ],
    cta: siteUrl ? { label: "Voir le site", href: siteUrl } : undefined
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    options.refunded
      ? "Votre réservation a été annulée et un remboursement a été initié."
      : "Votre réservation a été annulée.",
    "",
    `Logement : ${options.brandName}`,
    `Dates : ${dates}`,
    options.refunded ? `Montant : ${amount}` : ""
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: options.refunded
      ? `Réservation annulée — remboursement ${amount}`
      : `Réservation annulée — ${options.brandName}`,
    preheader: options.refunded
      ? `Annulation et remboursement de ${amount}.`
      : `Votre séjour chez ${options.brandName} a été annulé.`,
    html: buildTransactionalDocument({
      title: "Réservation annulée",
      preheader: `Séjour chez ${options.brandName} annulé.`,
      bodyHtml
    }),
    text
  }
}

function buildPlatformOpsDocument(options: {
  title: string
  preheader: string
  eyebrow: string
  headline: string
  details: Array<{ label: string; value: string }>
  note?: string
}) {
  const rows = options.details
    .map(
      (row, index) => `
                <tr>
                  <td style="padding:${index === 0 ? 0 : 10}px 0 ${index === options.details.length - 1 ? 0 : 10}px;font-size:14px;line-height:1.5;color:${C.ink};border-bottom:${index === options.details.length - 1 ? "0" : `1px solid ${C.border}`};">
                    <strong style="display:block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.label};margin-bottom:4px;">${escapeHtmlText(row.label)}</strong>
                    ${escapeHtmlText(row.value)}
                  </td>
                </tr>`
    )
    .join("")

  const note = options.note?.trim()
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.55;color:${C.muted};">${escapeHtmlText(options.note)}</p>`
    : ""

  const bodyHtml = `
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent};">${escapeHtmlText(options.eyebrow)}</p>
              <h1 style="margin:10px 0 0;font-family:${C.font};font-size:22px;font-weight:800;line-height:1.25;color:${C.ink};">${escapeHtmlText(options.headline)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:4px 18px;background-color:${C.surfaceMuted};border:1px solid ${C.border};border-radius:${C.radius};">
                ${rows}
              </table>
              ${note}
            </td>
          </tr>`

  const text = [
    options.headline,
    "",
    ...options.details.map((row) => `${row.label} : ${row.value}`),
    options.note ? "" : undefined,
    options.note
  ]
    .filter((line) => line !== undefined)
    .join("\n")

  return {
    subject: options.title,
    preheader: options.preheader,
    html: buildHostivEmailDocument({
      title: options.title,
      preheader: options.preheader,
      bodyHtml
    }),
    text
  }
}

export function buildHostivSubscriptionExpiredEmail(options: {
  slug: string
  brandName: string
  expiredOn: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Forfait expiré",
    title: "Votre site a été dépublié",
    paragraphs: [
      `Votre forfait Hostiv a expiré le <strong style="color:${C.ink};">${escapeHtmlText(options.expiredOn)}</strong>.`,
      `Votre site <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> n’est plus visible publiquement. Renouvelez votre forfait pour le remettre en ligne.`
    ],
    cta: { label: "Renouveler mon forfait", href: adminUrl }
  })

  const text = [
    "Votre forfait Hostiv a expiré.",
    "",
    `Site : ${options.brandName} (/${options.slug})`,
    `Expiré le : ${options.expiredOn}`,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: "Hostiv — Forfait expiré, site dépublié",
    preheader: "Renouvelez votre forfait pour republier votre site.",
    html: buildTransactionalDocument({
      title: "Forfait expiré",
      preheader: "Votre site a été dépublié.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivStripeConnectReadyEmail(options: {
  slug: string
  brandName: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Paiements en ligne",
    title: "Stripe Connect est prêt",
    paragraphs: [
      `Votre compte Stripe est validé pour <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong>.`,
      "Vous pouvez publier votre site et accepter les réservations payées par carte."
    ],
    cta: { label: "Ouvrir l’admin", href: adminUrl }
  })

  const text = [
    "Stripe Connect est prêt.",
    "",
    `Site : ${options.brandName} (/${options.slug})`,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: "Hostiv — Paiements Stripe activés",
    preheader: "Vous pouvez publier votre site et encaisser les réservations.",
    html: buildTransactionalDocument({
      title: "Stripe Connect prêt",
      preheader: "Paiements en ligne activés.",
      bodyHtml
    }),
    text
  }
}

export function buildSignupFailureApologyEmail(options: {
  fullName: string
  reason: string
}) {
  const firstName = firstNameFromFullName(options.fullName)

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Inscription",
    title: "Nous n’avons pas pu finaliser votre compte",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      "Votre paiement a bien été reçu, mais la création automatique de votre compte Hostiv a échoué.",
      escapeHtmlText(options.reason),
      `Notre équipe a été alertée. Écrivez-nous à <a href="mailto:contact@hostiv.fr" style="color:${C.accentDeep};font-weight:600;">contact@hostiv.fr</a> en indiquant l’adresse e-mail utilisée à l’inscription — nous vous répondrons sous 2 jours ouvrés.`
    ],
    paddingBottom: "32px"
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    "Votre paiement a été reçu mais la création du compte a échoué.",
    options.reason,
    "",
    "Contactez contact@hostiv.fr avec l’e-mail utilisé à l’inscription."
  ].join("\n")

  return {
    subject: "Hostiv — Action requise pour finaliser votre inscription",
    preheader: "Votre paiement est reçu — nous finalisons votre compte manuellement.",
    html: buildTransactionalDocument({
      title: "Inscription à finaliser",
      preheader: "Contactez-nous pour activer votre compte.",
      bodyHtml
    }),
    text
  }
}

export function buildGuestPaymentFailedEmail(options: {
  firstName: string
  brandName: string
  slug: string
  datesSummary: string
}) {
  const siteUrl = getPropertyPublicSiteUrl(options.slug)
  const firstName = options.firstName.trim() || "Bonjour"

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Paiement",
    title: "Votre paiement n’a pas abouti",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      `Votre tentative de réservation chez <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> (${escapeHtmlText(options.datesSummary)}) n’a pas été confirmée : le paiement n’a pas abouti.`,
      "Aucun montant n’a été débité. Vous pouvez réessayer sur le site ou choisir d’autres dates."
    ],
    cta: siteUrl ? { label: "Réessayer sur le site", href: siteUrl } : undefined
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    "Votre paiement n’a pas abouti — la réservation n’est pas confirmée.",
    "",
    `Logement : ${options.brandName}`,
    `Dates : ${options.datesSummary}`,
    siteUrl ? `Site : ${siteUrl}` : ""
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: `Paiement non confirmé — ${options.brandName}`,
    preheader: "Aucun débit effectué — vous pouvez réessayer.",
    html: buildTransactionalDocument({
      title: "Paiement échoué",
      preheader: "Réservation non confirmée.",
      bodyHtml
    }),
    text
  }
}

export function buildPlatformNewSignupAlert(options: {
  email: string
  fullName: string
  propertyName: string
  slug: string
  planLabel: string
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] Nouvelle inscription — ${options.slug}`,
    preheader: `Nouveau compte : ${options.email}`,
    eyebrow: "Alerte interne",
    headline: "Nouvelle inscription Hostiv",
    details: [
      { label: "E-mail", value: options.email },
      { label: "Nom", value: options.fullName },
      { label: "Site", value: `${options.propertyName} (/${options.slug})` },
      { label: "Forfait", value: options.planLabel }
    ]
  })
}

export function buildPlatformSignupFailureAlert(options: {
  email: string
  fullName: string
  propertyName: string
  slug: string
  reason: string
  stripeSessionId?: string
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] Échec inscription post-paiement — ${options.slug}`,
    preheader: `Échec pour ${options.email}`,
    eyebrow: "Urgent",
    headline: "Inscription payée non finalisée",
    details: [
      { label: "E-mail", value: options.email },
      { label: "Nom", value: options.fullName },
      { label: "Site demandé", value: `${options.propertyName} (/${options.slug})` },
      { label: "Motif", value: options.reason },
      ...(options.stripeSessionId
        ? [{ label: "Session Stripe", value: options.stripeSessionId }]
        : [])
    ],
    note: "Contacter le client et vérifier Stripe / Supabase."
  })
}

export function buildPlatformCheckoutFulfillmentAlert(options: {
  sessionId: string
  checkoutType?: string
  errorMessage: string
}) {
  return buildPlatformOpsDocument({
    title: "[Hostiv] Échec webhook checkout",
    preheader: `Session ${options.sessionId}`,
    eyebrow: "Urgent",
    headline: "Fulfillment checkout Stripe échoué",
    details: [
      { label: "Session", value: options.sessionId },
      { label: "Type", value: options.checkoutType || "inconnu" },
      { label: "Erreur", value: options.errorMessage }
    ],
    note: "Le client a peut-être payé sans recevoir son forfait ou son compte."
  })
}

function formatLongDate(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date)
}

export function buildHostivSubscriptionExpiringSoonEmail(options: {
  slug: string
  brandName: string
  paidUntil: string
  daysLeft: number
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`
  const expiryLabel = formatLongDate(options.paidUntil)
  const dayLabel = options.daysLeft === 1 ? "demain" : `dans ${options.daysLeft} jours`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Forfait Hostiv",
    title: `Votre forfait expire ${dayLabel}`,
    paragraphs: [
      `Votre forfait pour <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> expire le <strong style="color:${C.ink};">${escapeHtmlText(expiryLabel)}</strong>.`,
      "Sans renouvellement, votre site sera automatiquement dépublié à cette date."
    ],
    cta: { label: "Renouveler mon forfait", href: adminUrl }
  })

  const text = [
    `Votre forfait Hostiv expire ${dayLabel}.`,
    "",
    `Site : ${options.brandName} (/${options.slug})`,
    `Expiration : ${expiryLabel}`,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject:
      options.daysLeft === 1
        ? "Hostiv — Votre forfait expire demain"
        : `Hostiv — Votre forfait expire dans ${options.daysLeft} jours`,
    preheader: `Renouvelez avant le ${expiryLabel}.`,
    html: buildTransactionalDocument({
      title: "Rappel forfait",
      preheader: `Expiration le ${expiryLabel}.`,
      bodyHtml
    }),
    text
  }
}

export function buildOwnerReservationUpdatedEmail(options: {
  reservation: AdminBookingReservation
  brandName: string
  changes: string[]
}) {
  const guest = reservationGuestName(options.reservation)
  const dates = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )
  const changesHtml = options.changes
    .map(
      (line) =>
        `<li style="margin:0 0 8px;font-size:14px;line-height:1.55;color:${C.ink};">${escapeHtmlText(line)}</li>`
    )
    .join("")

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Réservation modifiée",
    title: "Modification enregistrée",
    paragraphs: [
      "Vous avez modifié une réservation confirmée. Le voyageur en est informé.",
      `<ul style="margin:12px 0 0;padding-left:20px;">${changesHtml}</ul>`
    ],
    cards: [
      { label: "Voyageur", primary: guest, secondary: options.reservation.guest_email },
      { label: "Séjour", primary: dates, secondary: `${options.reservation.stay_nights} nuit(s)` },
      { label: "Logement", primary: options.brandName }
    ],
    paddingBottom: "32px"
  })

  const text = [
    "Réservation modifiée.",
    "",
    ...options.changes.map((line) => `- ${line}`),
    "",
    `Voyageur : ${guest}`,
    `Dates : ${dates}`,
    `Logement : ${options.brandName}`
  ].join("\n")

  return {
    subject: `Réservation modifiée — ${dates}`,
    preheader: `Modification pour ${guest}.`,
    html: buildTransactionalDocument({
      title: "Réservation modifiée",
      preheader: `Modification pour ${guest}.`,
      bodyHtml
    }),
    text
  }
}

export function buildGuestReservationUpdatedEmail(options: {
  reservation: AdminBookingReservation
  brandName: string
  slug: string
  changes: string[]
}) {
  const dates = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )
  const firstName = options.reservation.guest_first_name.trim() || "Bonjour"
  const siteUrl = getPropertyPublicSiteUrl(options.slug)
  const changesHtml = options.changes
    .map(
      (line) =>
        `<li style="margin:0 0 8px;font-size:14px;line-height:1.55;color:${C.ink};">${escapeHtmlText(line)}</li>`
    )
    .join("")

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Réservation modifiée",
    title: "Votre réservation a été mise à jour",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      `L’hôte de <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> a modifié votre réservation (${escapeHtmlText(dates)}).`,
      `<ul style="margin:12px 0 0;padding-left:20px;">${changesHtml}</ul>`,
      "Si vous avez des questions, répondez directement à cet e-mail."
    ],
    cta: siteUrl ? { label: "Voir le site", href: siteUrl } : undefined
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    "Votre réservation a été modifiée.",
    "",
    ...options.changes.map((line) => `- ${line}`),
    "",
    `Logement : ${options.brandName}`,
    `Dates : ${dates}`
  ].join("\n")

  return {
    subject: `Réservation mise à jour — ${options.brandName}`,
    preheader: `Modification de votre séjour chez ${options.brandName}.`,
    html: buildTransactionalDocument({
      title: "Réservation modifiée",
      preheader: `Séjour chez ${options.brandName} mis à jour.`,
      bodyHtml
    }),
    text
  }
}

export function buildHostivEmailChangedEmail(options: {
  previousEmail: string
  nextEmail: string
  recipient: "previous" | "next"
}) {
  const isPrevious = options.recipient === "previous"

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Sécurité du compte",
    title: isPrevious ? "Votre adresse e-mail a été modifiée" : "Nouvelle adresse e-mail confirmée",
    paragraphs: isPrevious
      ? [
          `L’adresse e-mail de votre compte Hostiv a été changée vers <strong style="color:${C.ink};">${escapeHtmlText(options.nextEmail)}</strong>.`,
          `Si vous n’êtes pas à l’origine de cette modification, contactez-nous immédiatement à <a href="mailto:contact@hostiv.fr" style="color:${C.accentDeep};font-weight:600;">contact@hostiv.fr</a>.`
        ]
      : [
          `Votre compte Hostiv utilise désormais l’adresse <strong style="color:${C.ink};">${escapeHtmlText(options.nextEmail)}</strong>.`,
          "Vous recevrez vos prochaines notifications à cette adresse."
        ],
    paddingBottom: "32px"
  })

  const text = isPrevious
    ? [
        "Votre adresse e-mail Hostiv a été modifiée.",
        `Nouvelle adresse : ${options.nextEmail}`,
        "Si ce n’était pas vous, contactez contact@hostiv.fr."
      ].join("\n")
    : [
        "Votre nouvelle adresse e-mail Hostiv est active.",
        `Adresse : ${options.nextEmail}`
      ].join("\n")

  return {
    subject: isPrevious
      ? "Hostiv — Votre adresse e-mail a été modifiée"
      : "Hostiv — Nouvelle adresse e-mail confirmée",
    preheader: isPrevious ? "Modification de l’adresse de connexion." : "Adresse de connexion mise à jour.",
    html: buildTransactionalDocument({
      title: "Adresse e-mail modifiée",
      preheader: isPrevious ? "Vérifiez cette modification." : "Adresse confirmée.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivPasswordResetEmail(options: {
  resetUrl: string
  locale: "fr" | "en"
}) {
  const isEn = options.locale === "en"

  const bodyHtml = buildTransactionalBody({
    eyebrow: isEn ? "Account security" : "Sécurité du compte",
    title: isEn ? "Reset your password" : "Réinitialisez votre mot de passe",
    paragraphs: isEn
      ? [
          "You requested a password reset for your Hostiv account.",
          `This link is valid for <strong style="color:${C.ink};">24 hours</strong>. If you did not request this, you can ignore this email.`
        ]
      : [
          "Vous avez demandé la réinitialisation du mot de passe de votre compte Hostiv.",
          `Ce lien est valable <strong style="color:${C.ink};">24 heures</strong>. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`
        ],
    cta: {
      label: isEn ? "Choose a new password" : "Choisir un nouveau mot de passe",
      href: options.resetUrl
    },
    paddingBottom: "32px"
  })

  const text = isEn
    ? [
        "Reset your Hostiv password:",
        "",
        options.resetUrl,
        "",
        "This link expires in 24 hours."
      ].join("\n")
    : [
        "Réinitialisez votre mot de passe Hostiv :",
        "",
        options.resetUrl,
        "",
        "Ce lien expire dans 24 heures."
      ].join("\n")

  return {
    subject: isEn ? "Hostiv — Reset your password" : "Hostiv — Réinitialisation de mot de passe",
    preheader: isEn ? "Valid for 24 hours." : "Valable 24 heures.",
    html: buildTransactionalDocument({
      title: isEn ? "Password reset" : "Réinitialisation",
      preheader: isEn ? "Choose a new password." : "Choisissez un nouveau mot de passe.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivPasswordChangedEmail(options: { email: string }) {
  const bodyHtml = buildTransactionalBody({
    eyebrow: "Sécurité du compte",
    title: "Votre mot de passe a été modifié",
    paragraphs: [
      `Le mot de passe du compte <strong style="color:${C.ink};">${escapeHtmlText(options.email)}</strong> vient d’être mis à jour.`,
      `Si vous n’êtes pas à l’origine de cette action, contactez-nous à <a href="mailto:contact@hostiv.fr" style="color:${C.accentDeep};font-weight:600;">contact@hostiv.fr</a>.`
    ],
    paddingBottom: "32px"
  })

  const text = [
    "Votre mot de passe Hostiv a été modifié.",
    "",
    `Compte : ${options.email}`,
    "Si ce n’était pas vous, contactez contact@hostiv.fr."
  ].join("\n")

  return {
    subject: "Hostiv — Mot de passe modifié",
    preheader: "Modification de sécurité sur votre compte.",
    html: buildTransactionalDocument({
      title: "Mot de passe modifié",
      preheader: "Vérifiez cette modification.",
      bodyHtml
    }),
    text
  }
}

export function buildPlatformNewReservationAlert(options: {
  slug: string
  brandName: string
  guestName: string
  guestEmail: string
  datesSummary: string
  totalEur: number
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] Nouvelle réservation — ${options.slug}`,
    preheader: `${options.guestName} — ${options.datesSummary}`,
    eyebrow: "Réservation",
    headline: "Nouvelle réservation confirmée",
    details: [
      { label: "Site", value: `${options.brandName} (/${options.slug})` },
      { label: "Voyageur", value: `${options.guestName} (${options.guestEmail})` },
      { label: "Dates", value: options.datesSummary },
      { label: "Montant", value: formatEuro(options.totalEur) }
    ]
  })
}

export function buildPlatformReservationCancelledAlert(options: {
  slug: string
  brandName: string
  guestName: string
  guestEmail: string
  datesSummary: string
  totalEur: number
  refunded: boolean
  deleted?: boolean
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] ${options.refunded ? "Remboursement" : "Annulation"} — ${options.slug}`,
    preheader: `${options.guestName} — ${options.datesSummary}`,
    eyebrow: "Réservation",
    headline: options.deleted
      ? "Réservation supprimée"
      : options.refunded
        ? "Réservation annulée et remboursée"
        : "Réservation annulée",
    details: [
      { label: "Site", value: `${options.brandName} (/${options.slug})` },
      { label: "Voyageur", value: `${options.guestName} (${options.guestEmail})` },
      { label: "Dates", value: options.datesSummary },
      { label: "Montant", value: formatEuro(options.totalEur) }
    ]
  })
}

export function buildPlatformPlanPaymentAlert(options: {
  email: string
  slug: string
  planLabel: string
  paidUntil: string
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] Paiement forfait — ${options.slug}`,
    preheader: `${options.planLabel} — ${options.email}`,
    eyebrow: "Forfait",
    headline: "Paiement forfait enregistré",
    details: [
      { label: "E-mail", value: options.email },
      { label: "Site", value: `/${options.slug}` },
      { label: "Forfait", value: options.planLabel },
      { label: "Valide jusqu’au", value: formatLongDate(options.paidUntil) }
    ]
  })
}

export function buildGuestBookingInvoiceEmail(options: {
  firstName: string
  brandName: string
  datesSummary: string
  filename: string
}) {
  const firstName = options.firstName.trim() || "Bonjour"

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Facture",
    title: "Votre facture de réservation",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      `Veuillez trouver en pièce jointe la facture pour votre séjour chez <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> (${escapeHtmlText(options.datesSummary)}).`,
      "Conservez ce document pour vos archives ou votre comptabilité."
    ],
    paddingBottom: "32px"
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    "Votre facture de réservation est jointe à cet e-mail.",
    "",
    `Logement : ${options.brandName}`,
    `Dates : ${options.datesSummary}`,
    `Fichier : ${options.filename}`
  ].join("\n")

  return {
    subject: `Facture — ${options.brandName}`,
    preheader: "Votre facture de réservation en pièce jointe.",
    html: buildTransactionalDocument({
      title: "Facture de réservation",
      preheader: "Facture jointe à cet e-mail.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivPublishSiteReminderEmail(options: {
  slug: string
  brandName: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Onboarding",
    title: "Publiez votre site quand vous êtes prêt",
    paragraphs: [
      `Votre site <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> est en brouillon. Ajoutez vos photos, vos textes et vos tarifs, puis publiez-le en un clic.`,
      "N’oubliez pas de configurer Stripe Connect dans Comptabilité avant la publication pour accepter les paiements par carte."
    ],
    cta: { label: "Continuer dans l’admin", href: adminUrl }
  })

  const text = [
    "Votre site Hostiv est encore en brouillon.",
    "",
    `Site : ${options.brandName} (/${options.slug})`,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: "Hostiv — Publiez votre site de location",
    preheader: "Votre site est prêt à être personnalisé et publié.",
    html: buildTransactionalDocument({
      title: "Publiez votre site",
      preheader: "Finalisez et mettez votre site en ligne.",
      bodyHtml
    }),
    text
  }
}

export function buildHostivStripeConnectReminderEmail(options: {
  slug: string
  brandName: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Paiements en ligne",
    title: "Activez Stripe pour encaisser vos réservations",
    paragraphs: [
      `Pour publier <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong> et recevoir les paiements des voyageurs, connectez votre compte Stripe dans la section Comptabilité.`,
      "L’onboarding Stripe prend généralement quelques minutes."
    ],
    cta: { label: "Configurer Stripe", href: adminUrl }
  })

  const text = [
    "Stripe Connect n’est pas encore activé sur votre site.",
    "",
    `Site : ${options.brandName} (/${options.slug})`,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: "Hostiv — Activez Stripe pour vos réservations",
    preheader: "Connectez Stripe pour publier et encaisser.",
    html: buildTransactionalDocument({
      title: "Configurer Stripe",
      preheader: "Paiements en ligne à activer.",
      bodyHtml
    }),
    text
  }
}

export function buildOwnerStripeDisputeEmail(options: {
  slug: string
  brandName: string
  amountEur: number
  reason: string
  dueBy: string
  guestEmail: string
  datesSummary: string
  disputeId: string
  stripeAccountId: string
}) {
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin`
  const amount = formatEuro(options.amountEur)
  const stripeDashboardUrl = options.stripeAccountId
    ? `https://dashboard.stripe.com/connect/accounts/${encodeURIComponent(options.stripeAccountId)}/disputes/${encodeURIComponent(options.disputeId)}`
    : adminUrl

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Litige Stripe",
    title: "Un voyageur a contesté un paiement",
    paragraphs: [
      `Un litige de <strong style="color:${C.ink};">${escapeHtmlText(amount)}</strong> a été ouvert pour <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong>.`,
      `Motif indiqué : ${escapeHtmlText(options.reason)}.`,
      options.datesSummary
        ? `Séjour concerné : ${escapeHtmlText(options.datesSummary)}.`
        : "",
      `Répondez avant le <strong style="color:${C.ink};">${escapeHtmlText(options.dueBy)}</strong> depuis votre tableau de bord Stripe, faute de quoi le montant pourrait être débité automatiquement.`
    ].filter(Boolean),
    cta: { label: "Voir le litige sur Stripe", href: stripeDashboardUrl }
  })

  const text = [
    "Un litige Stripe a été ouvert.",
    "",
    `Montant : ${amount}`,
    `Motif : ${options.reason}`,
    options.datesSummary ? `Dates : ${options.datesSummary}` : "",
    options.guestEmail ? `Voyageur : ${options.guestEmail}` : "",
    `Répondre avant : ${options.dueBy}`,
    "",
    `Stripe : ${stripeDashboardUrl}`
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: `Litige Stripe — ${amount} — ${options.brandName}`,
    preheader: `Répondez avant le ${options.dueBy}.`,
    html: buildTransactionalDocument({
      title: "Litige de paiement",
      preheader: "Action requise sur Stripe.",
      bodyHtml
    }),
    text
  }
}

export function buildPlatformStripeDisputeAlert(options: {
  disputeId: string
  slug: string
  brandName: string
  amountEur: number
  reason: string
  dueBy: string
  guestEmail: string
  datesSummary: string
  paymentIntentId: string
}) {
  return buildPlatformOpsDocument({
    title: `[Hostiv] Litige Stripe — ${options.slug}`,
    preheader: `${formatEuro(options.amountEur)} — ${options.reason}`,
    eyebrow: "Urgent",
    headline: "Nouveau litige de paiement",
    details: [
      { label: "Litige", value: options.disputeId },
      { label: "Site", value: `${options.brandName} (/${options.slug})` },
      { label: "Montant", value: formatEuro(options.amountEur) },
      { label: "Motif", value: options.reason },
      { label: "Échéance preuve", value: options.dueBy },
      ...(options.datesSummary ? [{ label: "Dates", value: options.datesSummary }] : []),
      ...(options.guestEmail ? [{ label: "Voyageur", value: options.guestEmail }] : []),
      ...(options.paymentIntentId
        ? [{ label: "PaymentIntent", value: options.paymentIntentId }]
        : [])
    ],
    note: "L’hôte a été notifié — surveillez la réponse côté Stripe Connect."
  })
}

export function buildGuestReviewRequestEmail(options: {
  firstName: string
  brandName: string
  slug: string
  departureDate: string
  expiresOn: string
  reviewUrl: string
}) {
  const firstName = options.firstName.trim() || "Bonjour"
  const departureLabel = formatStayDate(options.departureDate)
  const expiresLabel = formatStayDate(options.expiresOn)

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Votre avis compte",
    title: "Comment s’est passé votre séjour ?",
    greeting: `Bonjour ${firstName},`,
    paragraphs: [
      `Merci d’avoir séjourné chez <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong>.`,
      `Partagez votre expérience en quelques mots — vous avez jusqu’au <strong style="color:${C.ink};">${escapeHtmlText(expiresLabel)}</strong> (7 jours après votre départ du ${escapeHtmlText(departureLabel)}).`
    ],
    cta: { label: "Laisser mon avis", href: options.reviewUrl }
  })

  const text = [
    `Bonjour ${firstName},`,
    "",
    `Merci pour votre séjour chez ${options.brandName}.`,
    `Laissez votre avis avant le ${expiresLabel} :`,
    options.reviewUrl
  ].join("\n")

  return {
    subject: `Votre avis sur ${options.brandName}`,
    preheader: "Partagez votre expérience en quelques clics.",
    html: buildTransactionalDocument({
      title: "Demande d’avis",
      preheader: "Dites-nous comment s’est passé votre séjour.",
      bodyHtml
    }),
    text
  }
}

function formatGuestReviewRatingStars(rating: number) {
  const safe = Math.max(1, Math.min(5, Math.round(rating)))

  return `${"★".repeat(safe)}${"☆".repeat(5 - safe)} (${safe}/5)`
}

export function buildOwnerGuestReviewSubmittedEmail(options: {
  slug: string
  brandName: string
  guestName: string
  guestEmail: string
  rating: number
  comment: string
  arrivalDate: string
  departureDate: string
}) {
  const guest = options.guestName.trim() || "Voyageur"
  const dates = formatReservationDatesSummary(options.arrivalDate, options.departureDate)
  const ratingLabel = formatGuestReviewRatingStars(options.rating)
  const adminUrl = `${getHostivMarketingUrl().replace(/\/$/, "")}/${encodeURIComponent(options.slug)}/admin?section=guest-reviews`

  const bodyHtml = buildTransactionalBody({
    eyebrow: "Nouvel avis",
    title: `${ratingLabel} — ${guest}`,
    paragraphs: [
      `Un voyageur vient de laisser un avis sur <strong style="color:${C.ink};">${escapeHtmlText(options.brandName)}</strong>.`,
      `<em style="color:${C.ink};">«&nbsp;${escapeHtmlText(options.comment)}&nbsp;»</em>`
    ],
    cards: [
      { label: "Voyageur", primary: guest, secondary: options.guestEmail },
      { label: "Séjour", primary: dates },
      { label: "Note", primary: ratingLabel }
    ],
    cta: { label: "Voir les avis dans l’admin", href: adminUrl }
  })

  const text = [
    `Nouvel avis — ${ratingLabel}`,
    "",
    `Voyageur : ${guest}`,
    `E-mail : ${options.guestEmail}`,
    `Séjour : ${dates}`,
    `Logement : ${options.brandName}`,
    "",
    options.comment,
    "",
    `Admin : ${adminUrl}`
  ].join("\n")

  return {
    subject: `Nouvel avis — ${ratingLabel} — ${guest}`,
    preheader: `${guest} a laissé un avis sur ${options.brandName}.`,
    html: buildTransactionalDocument({
      title: "Nouvel avis voyageur",
      preheader: `${guest} a laissé un avis sur ${options.brandName}.`,
      bodyHtml
    }),
    text
  }
}
