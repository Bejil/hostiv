import type { H3Event } from "h3"

/** Authentifie une requête cron Vercel (Bearer CRON_SECRET uniquement). */
export function requireCronBearerAuth(event: H3Event) {
  const config = useRuntimeConfig()
  const cronSecret = String(config.cronSecret || "").trim()

  if (!cronSecret) {
    throw createError({
      statusCode: 503,
      message: "CRON_SECRET non configuré."
    })
  }

  const authorization = getHeader(event, "authorization")?.trim() ?? ""
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : ""

  if (bearer !== cronSecret) {
    throw createError({ statusCode: 401, message: "Non autorisé." })
  }
}
