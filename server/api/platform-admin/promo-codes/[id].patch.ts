import type { HostivPromoCodeUpsertBody } from "../../../../app/types/hostiv-promo-code"
import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { logPlatformAdminAction } from "../../../utils/platform-admin-audit-log"
import { updateHostivPromoCode } from "../../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  const actor = await requirePlatformAdmin(event)
  const id = getRouterParam(event, "id")

  if (!id) {
    throw createError({ statusCode: 400, message: "Identifiant manquant." })
  }

  const body = await readBody<HostivPromoCodeUpsertBody>(event)
  const promoCode = await updateHostivPromoCode(id, body)

  await logPlatformAdminAction({
    actor,
    action: "promo_code.update",
    targetType: "promo_code",
    targetId: promoCode.id,
    metadata: { code: promoCode.code }
  })

  return promoCode
})
