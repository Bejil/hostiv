import {
  buildBookingInvoicePdf,
  bookingInvoiceDownloadFilename
} from "./booking-invoice-pdf"
import { sendResendEmail } from "./booking-email"
import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import { hostivAccountProfileFromUser } from "./hostiv-account"
import {
  buildGuestBookingInvoiceEmail,
  formatReservationDatesSummary
} from "./transactional-email-templates"
import { getPropertyAdminBySlug, getPropertyOwnerUserId } from "./property-admin-repository"
import { readTransactionalEmailConfig } from "./transactional-email-config"
import { requireSupabaseAdmin } from "./supabase"

export async function sendGuestBookingInvoiceEmail(options: {
  slug: string
  reservation: AdminBookingReservation
  brandName: string
  replyTo?: string
}) {
  const config = readTransactionalEmailConfig()

  if (!config) {
    return
  }

  const property = await getPropertyAdminBySlug(options.slug)

  if (!property) {
    console.error("[booking-invoice-email] property not found:", options.slug)
    return
  }

  const ownerUserId = await getPropertyOwnerUserId(options.slug)
  const supabase = requireSupabaseAdmin()
  const ownerUser = ownerUserId
    ? (await supabase.auth.admin.getUserById(ownerUserId)).data.user
    : null

  if (!ownerUser) {
    console.error("[booking-invoice-email] owner not found:", options.slug)
    return
  }

  try {
    const pdf = await buildBookingInvoicePdf({
      reservation: options.reservation,
      property,
      issuer: hostivAccountProfileFromUser(ownerUser)
    })

    const filename = bookingInvoiceDownloadFilename(options.reservation, options.slug)
    const mail = buildGuestBookingInvoiceEmail({
      firstName: options.reservation.guest_first_name,
      brandName: options.brandName,
      datesSummary: formatReservationDatesSummary(
        options.reservation.arrival_date,
        options.reservation.departure_date
      ),
      filename
    })

    await sendResendEmail({
      resendApiKey: config.resendApiKey,
      from: config.from,
      to: options.reservation.guest_email,
      replyTo: options.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: [{ filename, content: pdf }]
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)

    console.error("[booking-invoice-email] send:", detail)
  }
}
