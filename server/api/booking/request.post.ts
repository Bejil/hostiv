import {
  bookingSiteQueryOptions,
  isOwnerBookingPreview,
  readBookingPropertySlug
} from "../../utils/booking-owner-preview"
import {
  parseBookingRequestBody,
  sendBookingRequestEmail,
  sendResendEmail
} from "../../utils/booking-email"
import { getPropertyBookingNotifyEmail } from "../../utils/property-site-repository"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = String(config.bookingEmailFrom || "").trim()

  if (!resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message: "Envoi d’e-mails non configuré : renseignez RESEND_API_KEY sur le serveur."
    })
  }

  const body = await readBody(event)
  const propertySlug = readBookingPropertySlug(body)
  const ownerPreview = propertySlug ? await isOwnerBookingPreview(event, propertySlug) : false
  const parsed = await parseBookingRequestBody(body, bookingSiteQueryOptions(ownerPreview))

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      message: parsed.message
    })
  }

  const notifyTo = await getPropertyBookingNotifyEmail(parsed.propertySlug, {
    publishedOnly: !ownerPreview
  })

  if (!notifyTo) {
    throw createError({
      statusCode: 503,
      message:
        "E-mail hôte non configuré : associez un compte Hostiv au site ou vérifiez l’e-mail dans Mon compte > Paramètres."
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
