import {
  parseBookingRequestBody,
  sendBookingRequestEmail,
  sendResendEmail
} from "./booking-email"
import type { ParsedBookingReservation } from "./booking-reservation"
import { reservationToEmailPayload } from "./booking-reservation"

export async function sendBookingReservationEmails(
  data: ParsedBookingReservation,
  config: {
    notifyTo: string
    resendApiKey: string
    from: string
  }
) {
  const parsed = parseBookingRequestBody(reservationToEmailPayload(data))

  if (!parsed.ok) {
    throw new Error(parsed.message)
  }

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
      text: parsed.guestText,
      html: parsed.guestHtml
    })
  ])
}
