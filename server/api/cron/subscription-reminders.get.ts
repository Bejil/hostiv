import { runHostivSubscriptionExpiryReminders } from "../../utils/hostiv-subscription-reminders"

export default defineEventHandler(async (event) => {
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
  const querySecret = String(getQuery(event).secret || "").trim()

  if (bearer !== cronSecret && querySecret !== cronSecret) {
    throw createError({ statusCode: 401, message: "Non autorisé." })
  }

  const result = await runHostivSubscriptionExpiryReminders()

  return {
    ok: true as const,
    ...result
  }
})
