import type { HostivPromoCodeUpsertBody } from "../../../app/types/hostiv-promo-code"
import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import { logPlatformAdminAction } from "../../utils/platform-admin-audit-log"
import { createHostivPromoCode } from "../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  const actor = await requirePlatformAdmin(event)
  const body = await readBody<HostivPromoCodeUpsertBody>(event)
  const promoCode = await createHostivPromoCode(body)

  await logPlatformAdminAction({
    actor,
    action: "promo_code.create",
    targetType: "promo_code",
    targetId: promoCode.id,
    metadata: { code: promoCode.code }
  })

  return promoCode
})
