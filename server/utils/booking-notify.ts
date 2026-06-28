import {
  applyWelcomeGuideAttachmentToGuestEmail,
  parseBookingRequestBody,
  sendBookingRequestEmail,
  sendResendEmail
} from "./booking-email"
import type { ParsedBookingReservation } from "./booking-reservation"
import { reservationToEmailPayload } from "./booking-reservation"
import { buildBookingWelcomeGuideAttachment } from "./welcome-guide-booking-email"

export async function sendBookingReservationEmails(
  data: ParsedBookingReservation,
  config: {
    notifyTo: string
    resendApiKey: string
    from: string
    /** false en aperçu propriétaire / site non publié */
    publishedOnly?: boolean
  }
) {
  const publishedOnly = config.publishedOnly !== false
  const parsed = await parseBookingRequestBody(reservationToEmailPayload(data), {
    publishedOnly
  })

  if (!parsed.ok) {
    throw new Error(parsed.message)
  }

  const welcomeGuideAttachment = await buildBookingWelcomeGuideAttachment(data.propertySlug)
  const guestEmail = welcomeGuideAttachment
    ? applyWelcomeGuideAttachmentToGuestEmail({
        text: parsed.guestText,
        html: parsed.guestHtml
      })
    : { text: parsed.guestText, html: parsed.guestHtml }

  await Promise.all([
    sendBookingRequestEmail({
      resendApiKey: config.resendApiKey,
      from: config.from,
      to: config.notifyTo,
      replyTo: parsed.guestEmail,
      subject: parsed.subject,
      text: parsed.text,
      html: parsed.html
    }),
    sendResendEmail({
      resendApiKey: config.resendApiKey,
      from: config.from,
      to: parsed.guestEmail,
      replyTo: config.notifyTo,
      subject: parsed.guestSubject,
      text: guestEmail.text,
      html: guestEmail.html,
      attachments: welcomeGuideAttachment ? [welcomeGuideAttachment] : undefined
    })
  ])
}
