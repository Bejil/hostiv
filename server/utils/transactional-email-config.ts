/** Dotenv n’ignore pas les `#` en fin de ligne — évite un `from` invalide chez Resend. */
export function stripEnvInlineComment(value: string) {
  return value.replace(/\s+#.*$/, "").trim()
}

export type TransactionalEmailConfig = {
  resendApiKey: string
  from: string
}

export function readTransactionalEmailConfig(): TransactionalEmailConfig | null {
  const resendApiKey = String(process.env.RESEND_API_KEY || "").trim()
  const from = stripEnvInlineComment(
    String(process.env.BOOKING_EMAIL_FROM || process.env.NUXT_BOOKING_EMAIL_FROM || "")
  )

  if (!resendApiKey || !from) {
    return null
  }

  return { resendApiKey, from }
}

/** Destinataire des alertes internes Hostiv (ops / support). */
export function readPlatformContactEmail() {
  return stripEnvInlineComment(
    String(process.env.HOSTIV_CONTACT_EMAIL || "contact@hostiv.fr")
  )
}
