import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { isPromoCodeTaken, normalizePromoCode } from "../../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = getQuery(event)
  const code = normalizePromoCode(String(query.code || ""))
  const excludeId = String(query.exclude_id || "").trim() || null

  if (!code) {
    throw createError({ statusCode: 400, message: "Code manquant." })
  }

  const taken = await isPromoCodeTaken(code, excludeId)

  return {
    code,
    available: !taken
  }
})
