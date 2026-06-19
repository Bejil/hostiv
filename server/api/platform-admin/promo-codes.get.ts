import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import { listHostivPromoCodes } from "../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  return listHostivPromoCodes()
})
