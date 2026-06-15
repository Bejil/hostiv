import { runHostivSubscriptionExpiryReminders } from "../../utils/hostiv-subscription-reminders"
import { requireCronBearerAuth } from "../../utils/cron-auth"

export default defineEventHandler(async (event) => {
  requireCronBearerAuth(event)

  const result = await runHostivSubscriptionExpiryReminders()

  return {
    ok: true as const,
    ...result
  }
})
