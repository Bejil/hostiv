import { requirePropertyPrimaryOwner } from "../../../utils/admin-auth"
import {
  normalizePlatformFeePercent,
  refreshPropertyStripeStatus,
  stripeStatusFromRow
} from "../../../utils/stripe-connect"
import { getPropertyStripeBySlug } from "../../../utils/property-stripe-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyPrimaryOwner(event, slug)

  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()
  const platformFeePercent = normalizePlatformFeePercent(config.hestiaPlatformFeePercent)

  if (!stripeSecretKey) {
    const row = await getPropertyStripeBySlug(slug)

    if (!row) {
      throw createError({ statusCode: 404, message: "Site introuvable." })
    }

    return stripeStatusFromRow(row, platformFeePercent, { secretKey: "" })
  }

  return await refreshPropertyStripeStatus(stripeSecretKey, slug, platformFeePercent)
})
