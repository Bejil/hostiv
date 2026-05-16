import {
  parseBookingRequestBody,
  sendBookingRequestEmail,
  sendResendEmail
} from "../../utils/booking-email"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const notifyTo = String(config.bookingNotifyEmail || "").trim()
  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = String(config.bookingEmailFrom || "").trim()

  if (!notifyTo || !resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message:
        "Envoi d’e-mails non configuré : renseignez BOOKING_NOTIFY_EMAIL et RESEND_API_KEY sur le serveur."
    })
  }

  const body = await readBody(event)
  const parsed = parseBookingRequestBody(body)

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      message: parsed.message
    })
  }

  try {
    await Promise.all([
      sendBookingRequestEmail({
        resendApiKey,
        from,
        to: notifyTo,
        replyTo: parsed.guestEmail,
        subject: parsed.subject,
        text: parsed.text,
        html: parsed.html
      }),
      sendResendEmail({
        resendApiKey,
        from,
        to: parsed.guestEmail,
        replyTo: notifyTo,
        subject: parsed.guestSubject,
        text: parsed.guestText,
        html: parsed.guestHtml
      })
    ])
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur d’envoi."

    throw createError({
      statusCode: 502,
      message: detail
    })
  }

  return { ok: true as const }
})
