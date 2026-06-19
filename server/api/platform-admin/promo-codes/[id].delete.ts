import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { logPlatformAdminAction } from "../../../utils/platform-admin-audit-log"
import { deleteHostivPromoCode, getHostivPromoCodeById } from "../../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  const actor = await requirePlatformAdmin(event)
  const id = getRouterParam(event, "id")

  if (!id) {
    throw createError({ statusCode: 400, message: "Identifiant manquant." })
  }

  const existing = await getHostivPromoCodeById(id)

  if (!existing) {
    throw createError({ statusCode: 404, message: "Code promo introuvable." })
  }

  await deleteHostivPromoCode(id)

  await logPlatformAdminAction({
    actor,
    action: "promo_code.delete",
    targetType: "promo_code",
    targetId: id,
    metadata: { code: existing.code }
  })

  return { ok: true as const }
})
