import { runGuestReviewRequestEmails } from "../../utils/guest-review-service"
import { requireCronBearerAuth } from "../../utils/cron-auth"

export default defineEventHandler(async (event) => {
  requireCronBearerAuth(event)

  const result = await runGuestReviewRequestEmails()

  return {
    ok: true as const,
    ...result
  }
})
