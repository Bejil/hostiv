import { requirePropertyOwner } from "../../../utils/admin-auth"
import { buildReservationsIcsFeedUrl } from "../../../utils/reservations-ics-token"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  return {
    url: buildReservationsIcsFeedUrl(event, slug)
  }
})
