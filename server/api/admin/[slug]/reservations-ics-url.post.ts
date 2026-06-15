import { requirePropertyOwner } from "../../../utils/admin-auth"
import {
  buildReservationsIcsFeedUrl,
  rotatePropertyReservationsIcsToken
} from "../../../utils/reservations-ics-token"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const token = await rotatePropertyReservationsIcsToken(slug)

  return {
    url: buildReservationsIcsFeedUrl(event, slug, token),
    rotated: true as const
  }
})
