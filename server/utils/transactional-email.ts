import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import type { HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { hostivPricing } from "../../app/data/hostivLanding"
import {
  hostivPlanCheckoutDescription,
  hostivPlanCheckoutLabel
} from "../../app/utils/hostiv-subscription-pricing"
import { sendResendEmail } from "./booking-email"
import {
  buildGuestPaymentFailedEmail,
  buildGuestReviewRequestEmail,
  buildOwnerGuestReviewSubmittedEmail,
  buildGuestReservationCancelledEmail,
  buildGuestReservationUpdatedEmail,
  buildHostivAccountDeletedEmail,
  buildHostivEmailChangedEmail,
  buildHostivPasswordChangedEmail,
  buildHostivPasswordResetEmail,
  buildHostivPlanPurchasedEmail,
  buildHostivPublishSiteReminderEmail,
  buildHostivSitePublishedEmail,
  buildHostivStripeConnectReminderEmail,
  buildHostivStripeConnectReadyEmail,
  buildOwnerStripeDisputeEmail,
  buildPlatformStripeDisputeAlert,
  buildHostivSubscriptionExpiredEmail,
  buildHostivSubscriptionExpiringSoonEmail,
  buildHostivWelcomeEmail,
  buildOwnerReservationCancelledEmail,
  buildOwnerReservationRefundedEmail,
  buildOwnerReservationUpdatedEmail,
  buildPlatformCheckoutFulfillmentAlert,
  buildPlatformNewReservationAlert,
  buildPlatformNewSignupAlert,
  buildPlatformPlanPaymentAlert,
  buildPlatformReservationCancelledAlert,
  buildPlatformSignupFailureAlert,
  buildSignupFailureApologyEmail,
  formatReservationDatesSummary
} from "./transactional-email-templates"
import { readPlatformContactEmail, readTransactionalEmailConfig } from "./transactional-email-config"
import { getPropertyBookingNotifyEmail, getPropertySiteBySlug } from "./property-site-repository"
import { requireSupabaseAdmin } from "./supabase"

async function trySendTransactionalEmail(params: {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  logLabel: string
}) {
  const config = readTransactionalEmailConfig()
  const to = params.to.trim()

  if (!config || !to) {
    return
  }

  try {
    await sendResendEmail({
      resendApiKey: config.resendApiKey,
      from: config.from,
      to,
      replyTo: params.replyTo,
      subject: params.subject,
      text: params.text,
      html: params.html
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)

    console.error(`[transactional-email] ${params.logLabel}:`, detail)
  }
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase.auth.admin.getUserById(userId)

  if (error) {
    console.error("[transactional-email] owner email:", error.message)
    return null
  }

  const email = data.user?.email?.trim() ?? ""

  return email || null
}

export async function sendHostivWelcomeEmail(options: {
  to: string
  fullName: string
  propertyName: string
  slug: string
  plan: HostivSubscriptionPlan
  verificationUrl?: string
}) {
  const mail = buildHostivWelcomeEmail({
    fullName: options.fullName,
    propertyName: options.propertyName,
    slug: options.slug,
    planLabel: hostivPlanCheckoutLabel(options.plan),
    verificationUrl: options.verificationUrl
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "welcome"
  })
}

export async function sendHostivPlanPurchasedEmail(options: {
  to: string
  slug: string
  plan: HostivSubscriptionPlan
}) {
  const mail = buildHostivPlanPurchasedEmail({
    planLabel: hostivPlanCheckoutLabel(options.plan),
    planDescription: hostivPlanCheckoutDescription(options.plan),
    slug: options.slug
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "plan-purchase"
  })
}

export async function sendHostivPremiumToolsPurchasedEmail(options: {
  to: string
  slug: string
}) {
  const addon = hostivPricing.premiumAddon
  const mail = buildHostivPlanPurchasedEmail({
    planLabel: `Hostiv ${addon.name}`,
    planDescription: `${addon.tagline} Paiement annuel unique, sans reconduction automatique.`,
    slug: options.slug,
    premiumTools: true
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "premium-tools-purchase"
  })
}

export async function sendHostivAccountDeletedEmail(options: { to: string; slug: string }) {
  const mail = buildHostivAccountDeletedEmail({ slug: options.slug })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "account-deleted"
  })
}

export async function sendHostivSitePublishedEmail(options: {
  to: string
  brandName: string
  slug: string
}) {
  const mail = buildHostivSitePublishedEmail({
    brandName: options.brandName,
    slug: options.slug
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "site-published"
  })
}

async function loadBrandNameForSlug(slug: string) {
  const site = await getPropertySiteBySlug(slug, { publishedOnly: false })

  return site?.brand_name?.trim() || slug
}

function formatSubscriptionExpiredOn(paidUntil: string | null) {
  if (!paidUntil) {
    return "récemment"
  }

  const date = new Date(paidUntil)

  if (Number.isNaN(date.getTime())) {
    return paidUntil
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date)
}

async function sendPlatformOpsEmail(
  mail: { subject: string; text: string; html: string },
  logLabel: string
) {
  await trySendTransactionalEmail({
    to: readPlatformContactEmail(),
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel
  })
}

export async function sendHostivSubscriptionExpiringSoonEmail(options: {
  to: string
  slug: string
  brandName: string
  paidUntil: string
  daysLeft: number
}) {
  const mail = buildHostivSubscriptionExpiringSoonEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "subscription-expiring-soon"
  })
}

export async function sendHostivSubscriptionExpiredEmail(options: {
  to: string
  slug: string
  brandName: string
  paidUntil: string | null
}) {
  const mail = buildHostivSubscriptionExpiredEmail({
    slug: options.slug,
    brandName: options.brandName,
    expiredOn: formatSubscriptionExpiredOn(options.paidUntil)
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "subscription-expired"
  })
}

export async function sendHostivPublishSiteReminderEmail(options: {
  to: string
  slug: string
  brandName: string
}) {
  const mail = buildHostivPublishSiteReminderEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "publish-site-reminder"
  })
}

export async function sendHostivStripeConnectReminderEmail(options: {
  to: string
  slug: string
  brandName: string
}) {
  const mail = buildHostivStripeConnectReminderEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "stripe-connect-reminder"
  })
}

export async function sendHostivStripeConnectReadyEmail(options: {
  to: string
  slug: string
  brandName: string
}) {
  const mail = buildHostivStripeConnectReadyEmail({
    slug: options.slug,
    brandName: options.brandName
  })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "stripe-connect-ready"
  })
}

export async function sendSignupFailureEmails(options: {
  email: string
  fullName: string
  propertyName: string
  slug: string
  reason: string
  stripeSessionId?: string
}) {
  const apology = buildSignupFailureApologyEmail({
    fullName: options.fullName,
    reason: options.reason
  })

  await trySendTransactionalEmail({
    to: options.email,
    subject: apology.subject,
    text: apology.text,
    html: apology.html,
    logLabel: "signup-failure-apology"
  })

  const alert = buildPlatformSignupFailureAlert({
    email: options.email,
    fullName: options.fullName,
    propertyName: options.propertyName,
    slug: options.slug,
    reason: options.reason,
    stripeSessionId: options.stripeSessionId
  })

  await sendPlatformOpsEmail(alert, "signup-failure-alert")
}

export async function sendPlatformNewSignupAlert(options: {
  email: string
  fullName: string
  propertyName: string
  slug: string
  plan: HostivSubscriptionPlan
}) {
  const mail = buildPlatformNewSignupAlert({
    email: options.email,
    fullName: options.fullName,
    propertyName: options.propertyName,
    slug: options.slug,
    planLabel: hostivPlanCheckoutLabel(options.plan)
  })

  await sendPlatformOpsEmail(mail, "new-signup-alert")
}

export async function sendPlatformCheckoutFulfillmentAlert(options: {
  sessionId: string
  checkoutType?: string
  errorMessage: string
}) {
  const mail = buildPlatformCheckoutFulfillmentAlert(options)

  await sendPlatformOpsEmail(mail, "checkout-fulfillment-alert")
}

export async function sendGuestReviewRequestEmail(options: {
  to: string
  firstName: string
  brandName: string
  slug: string
  departureDate: string
  expiresOn: string
  reviewUrl: string
}) {
  const mail = buildGuestReviewRequestEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "guest-review-request"
  })
}

export async function sendOwnerGuestReviewSubmittedEmail(options: {
  to: string
  slug: string
  brandName: string
  guestName: string
  guestEmail: string
  rating: number
  comment: string
  arrivalDate: string
  departureDate: string
}) {
  const mail = buildOwnerGuestReviewSubmittedEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    replyTo: options.guestEmail,
    logLabel: "owner-guest-review-submitted"
  })
}

export async function sendGuestPaymentFailedEmail(options: {
  to: string
  firstName: string
  brandName: string
  slug: string
  datesSummary: string
}) {
  const mail = buildGuestPaymentFailedEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "guest-payment-failed"
  })
}

export async function sendHostivEmailChangedEmails(options: {
  previousEmail: string
  nextEmail: string
}) {
  const previousMail = buildHostivEmailChangedEmail({
    previousEmail: options.previousEmail,
    nextEmail: options.nextEmail,
    recipient: "previous"
  })

  await trySendTransactionalEmail({
    to: options.previousEmail,
    subject: previousMail.subject,
    text: previousMail.text,
    html: previousMail.html,
    logLabel: "email-changed-previous"
  })

  const nextMail = buildHostivEmailChangedEmail({
    previousEmail: options.previousEmail,
    nextEmail: options.nextEmail,
    recipient: "next"
  })

  await trySendTransactionalEmail({
    to: options.nextEmail,
    subject: nextMail.subject,
    text: nextMail.text,
    html: nextMail.html,
    logLabel: "email-changed-next"
  })
}

export async function sendHostivPasswordChangedEmail(options: { to: string }) {
  const mail = buildHostivPasswordChangedEmail({ email: options.to })

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "password-changed"
  })
}

export async function sendHostivPasswordResetEmail(options: {
  to: string
  resetUrl: string
  locale: "fr" | "en"
}) {
  const config = readTransactionalEmailConfig()
  const to = options.to.trim()

  if (!config || !to) {
    throw createError({
      statusCode: 503,
      message: "Envoi d’e-mail non configuré."
    })
  }

  const mail = buildHostivPasswordResetEmail({
    resetUrl: options.resetUrl,
    locale: options.locale
  })

  try {
    await sendResendEmail({
      resendApiKey: config.resendApiKey,
      from: config.from,
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)

    console.error("[transactional-email] password-reset:", detail)

    throw createError({
      statusCode: 502,
      message: "Impossible d’envoyer l’e-mail pour le moment."
    })
  }
}

export async function sendPlatformNewReservationAlert(options: {
  slug: string
  brandName: string
  guestName: string
  guestEmail: string
  datesSummary: string
  totalEur: number
}) {
  const mail = buildPlatformNewReservationAlert(options)

  await sendPlatformOpsEmail(mail, "platform-new-reservation")
}

export async function sendOwnerStripeDisputeEmail(options: {
  to: string
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
  const mail = buildOwnerStripeDisputeEmail(options)

  await trySendTransactionalEmail({
    to: options.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    logLabel: "owner-stripe-dispute"
  })
}

export async function sendPlatformStripeDisputeAlert(options: {
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
  const mail = buildPlatformStripeDisputeAlert(options)

  await sendPlatformOpsEmail(mail, "platform-stripe-dispute")
}

export async function sendPlatformPlanPaymentAlert(options: {
  email: string
  slug: string
  planLabel: string
  paidUntil: string
}) {
  const mail = buildPlatformPlanPaymentAlert(options)

  await sendPlatformOpsEmail(mail, "platform-plan-payment")
}

function reservationGuestName(reservation: AdminBookingReservation) {
  return `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()
}

export async function sendReservationUpdatedEmails(options: {
  slug: string
  reservation: AdminBookingReservation
  changes: string[]
}) {
  const brandName = await loadBrandNameForSlug(options.slug)
  const ownerEmail = await getPropertyBookingNotifyEmail(options.slug, { publishedOnly: false })

  if (ownerEmail) {
    const ownerMail = buildOwnerReservationUpdatedEmail({
      reservation: options.reservation,
      brandName,
      changes: options.changes
    })

    await trySendTransactionalEmail({
      to: ownerEmail,
      subject: ownerMail.subject,
      text: ownerMail.text,
      html: ownerMail.html,
      replyTo: options.reservation.guest_email,
      logLabel: "owner-reservation-updated"
    })
  }

  const guestMail = buildGuestReservationUpdatedEmail({
    reservation: options.reservation,
    brandName,
    slug: options.slug,
    changes: options.changes
  })

  await trySendTransactionalEmail({
    to: options.reservation.guest_email,
    subject: guestMail.subject,
    text: guestMail.text,
    html: guestMail.html,
    replyTo: ownerEmail ?? undefined,
    logLabel: "guest-reservation-updated"
  })
}

export async function sendGuestPaymentFailedEmailFromStripeMetadata(metadata: Record<string, string>) {
  const guestEmail = metadata.guestEmail?.trim()
  const propertySlug = metadata.propertySlug?.trim()

  if (!guestEmail || !propertySlug) {
    return
  }

  await sendGuestPaymentFailedEmail({
    to: guestEmail,
    firstName: metadata.firstName?.trim() || "Bonjour",
    brandName: metadata.propertyBrandName?.trim() || propertySlug,
    slug: propertySlug,
    datesSummary: metadata.datesSummary?.trim() || "dates non précisées"
  })
}

export async function sendReservationCancelledEmails(options: {
  slug: string
  reservation: AdminBookingReservation
  refunded: boolean
  deleted?: boolean
}) {
  const brandName = await loadBrandNameForSlug(options.slug)
  const ownerEmail = await getPropertyBookingNotifyEmail(options.slug, { publishedOnly: false })

  if (ownerEmail) {
    const ownerMail = options.refunded
      ? buildOwnerReservationRefundedEmail({
          reservation: options.reservation,
          brandName
        })
      : buildOwnerReservationCancelledEmail({
          reservation: options.reservation,
          brandName
        })

    await trySendTransactionalEmail({
      to: ownerEmail,
      subject: ownerMail.subject,
      text: ownerMail.text,
      html: ownerMail.html,
      replyTo: options.reservation.guest_email,
      logLabel: options.refunded ? "owner-refund" : "owner-cancel"
    })
  }

  const guestMail = buildGuestReservationCancelledEmail({
    reservation: options.reservation,
    brandName,
    slug: options.slug,
    refunded: options.refunded
  })

  await trySendTransactionalEmail({
    to: options.reservation.guest_email,
    subject: guestMail.subject,
    text: guestMail.text,
    html: guestMail.html,
    replyTo: ownerEmail ?? undefined,
    logLabel: options.refunded ? "guest-refund" : "guest-cancel"
  })

  const datesSummary = formatReservationDatesSummary(
    options.reservation.arrival_date,
    options.reservation.departure_date
  )

  void sendPlatformOpsEmail(
    buildPlatformReservationCancelledAlert({
      slug: options.slug,
      brandName,
      guestName: reservationGuestName(options.reservation),
      guestEmail: options.reservation.guest_email,
      datesSummary,
      totalEur: options.reservation.total_eur,
      refunded: options.refunded,
      deleted: options.deleted
    }),
    options.deleted
      ? "platform-reservation-deleted"
      : options.refunded
        ? "platform-reservation-refund"
        : "platform-reservation-cancel"
  )
}

export async function sendReservationDeletedEmails(options: {
  slug: string
  reservation: AdminBookingReservation
}) {
  await sendReservationCancelledEmails({
    slug: options.slug,
    reservation: {
      ...options.reservation,
      status: "cancelled"
    },
    refunded: Boolean(options.reservation.refunded_at),
    deleted: true
  })
}
