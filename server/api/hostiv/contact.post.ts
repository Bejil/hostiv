import { sendResendEmail } from "../../utils/booking-email"
import {
  buildHostivContactConfirmationEmailHtml,
  buildHostivContactConfirmationText,
  buildHostivContactEmailHtml
} from "../../utils/hostiv-email-theme"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Dotenv n’ignore pas les `#` en fin de ligne — évite un `from` invalide chez Resend. */
function stripEnvInlineComment(value: string) {
  return value.replace(/\s+#.*$/, "").trim()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = stripEnvInlineComment(String(config.bookingEmailFrom || ""))
  const to = stripEnvInlineComment(
    String(config.hostivContactEmail || "contact@hostiv.fr")
  )

  if (!resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message: "Envoi de message indisponible pour le moment."
    })
  }

  const body = await readBody(event)
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "Question générale"
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  const website = typeof body?.website === "string" ? body.website.trim() : ""

  if (website) {
    return { ok: true }
  }

  if (!name || name.length < 2) {
    throw createError({ statusCode: 400, message: "Indiquez votre nom." })
  }

  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: "Adresse e-mail invalide." })
  }

  if (!message || message.length < 10) {
    throw createError({
      statusCode: 400,
      message: "Votre message doit contenir au moins 10 caractères."
    })
  }

  const mailSubject = `[Hostiv] ${subject} — ${name}`
  const text = [
    `Nom : ${name}`,
    `E-mail : ${email}`,
    `Sujet : ${subject}`,
    "",
    message
  ].join("\n")

  const html = buildHostivContactEmailHtml({ name, email, subject, message })

  const confirmationSubject = "Hostiv — Nous avons bien reçu votre message"
  const confirmationText = buildHostivContactConfirmationText({ name, subject, message })
  const confirmationHtml = buildHostivContactConfirmationEmailHtml({ name, subject, message })

  function devResendHint(detail: string) {
    if (process.env.NODE_ENV === "production") {
      return ""
    }

    if (detail.includes("Invalid `from`")) {
      return " Vérifiez BOOKING_EMAIL_FROM : pas de commentaire # en fin de ligne dans .env."
    }

    if (
      detail.includes("only send testing emails") ||
      (from.includes("onboarding@resend.dev") &&
        (to === "contact@hostiv.fr" || !detail.includes(email)))
    ) {
      return " En mode test Resend (onboarding@resend.dev), HOSTIV_CONTACT_EMAIL et l’e-mail de confirmation doivent être l’adresse de votre compte Resend."
    }

    if (detail.startsWith("Resend ")) {
      return ` (${detail})`
    }

    return ""
  }

  try {
    await sendResendEmail({
      resendApiKey,
      from,
      to,
      replyTo: email,
      subject: mailSubject,
      text,
      html
    })

    try {
      await sendResendEmail({
        resendApiKey,
        from,
        to: email,
        replyTo: to,
        subject: confirmationSubject,
        text: confirmationText,
        html: confirmationHtml
      })
    } catch (confirmationCause) {
      const detail =
        confirmationCause instanceof Error ? confirmationCause.message : String(confirmationCause)

      console.error("[hostiv/contact] confirmation email failed:", detail)
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.error("[hostiv/contact]", detail)

    throw createError({
      statusCode: 502,
      message: `Impossible d’envoyer votre message. Réessayez plus tard.${devResendHint(detail)}`
    })
  }

  return { ok: true }
})
