import { runHostivOnboardingReminders } from "../../utils/hostiv-onboarding-reminders"
import { requireCronBearerAuth } from "../../utils/cron-auth"

export default defineEventHandler(async (event) => {
  requireCronBearerAuth(event)

  const result = await runHostivOnboardingReminders()

  return {
    ok: true as const,
    ...result
  }
})
