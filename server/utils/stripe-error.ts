import Stripe from "stripe"

function isStripeLikeError(
  error: unknown
): error is { type?: string; message?: string; code?: string } {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as { type?: string; rawType?: string }

  if (error instanceof Stripe.errors.StripeError) {
    return true
  }

  const type = candidate.type ?? candidate.rawType ?? ""

  return typeof type === "string" && type.toLowerCase().includes("stripe")
}

function messageFromUnknown(error: unknown, depth = 0): string | null {
  if (!error || depth > 4) {
    return null
  }

  if (typeof error === "string" && error.trim() && error !== "Server Error") {
    return error.trim()
  }

  if (typeof error !== "object") {
    return null
  }

  const record = error as {
    message?: unknown
    statusMessage?: unknown
    data?: { message?: unknown }
    cause?: unknown
  }

  const candidates = [record.data?.message, record.message, record.statusMessage]

  for (const value of candidates) {
    if (typeof value === "string" && value.trim() && value !== "Server Error") {
      return value.trim()
    }
  }

  if (record.cause) {
    return messageFromUnknown(record.cause, depth + 1)
  }

  return null
}

/** Message lisible pour l’admin à partir d’une erreur Stripe ou HTTP. */
export function formatStripeErrorMessage(error: unknown): string {
  if (isStripeLikeError(error)) {
    const parts = [error.message]

    if (error.code) {
      parts.push(`(code: ${error.code})`)
    }

    return parts.filter(Boolean).join(" ")
  }

  const nested = messageFromUnknown(error)

  if (nested) {
    return nested
  }

  return "Erreur Stripe. Vérifiez que Stripe Connect est activé sur votre compte Live (Dashboard → Connect)."
}

export function throwStripeHandlerError(error: unknown): never {
  const message = formatStripeErrorMessage(error)

  let statusCode = 502

  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    statusCode = 503
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    statusCode = 400
  } else if (isStripeLikeError(error)) {
    statusCode = 400
  }

  throw createError({ statusCode, message })
}
