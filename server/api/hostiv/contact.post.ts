import { sendResendEmail } from "../../utils/booking-email"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Dotenv n’ignore pas les `#` en fin de ligne — évite un `from` invalide chez Resend. */
function stripEnvInlineComment(value: string) {
  return value.replace(/\s+#.*$/, "").trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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

  const html = `
    <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(email)}</p>
    <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
    <hr />
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `

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
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.error("[hostiv/contact]", detail)

    const devHint =
      process.env.NODE_ENV !== "production"
        ? detail.includes("Invalid `from`")
          ? " Vérifiez BOOKING_EMAIL_FROM : pas de commentaire # en fin de ligne dans .env."
          : detail.includes("only send testing emails") ||
              (from.includes("onboarding@resend.dev") && to === "contact@hostiv.fr")
            ? " Définissez HOSTIV_CONTACT_EMAIL sur l’e-mail de votre compte Resend (ce n’est pas l’adresse saisie dans le formulaire)."
            : detail.startsWith("Resend ")
              ? ` (${detail})`
              : ""
        : ""

    throw createError({
      statusCode: 502,
      message: `Impossible d’envoyer votre message. Réessayez plus tard.${devHint}`
    })
  }

  return { ok: true }
})
