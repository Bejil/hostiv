import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { generateUniquePromoCode } from "../../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const code = await generateUniquePromoCode()

  return { code }
})
