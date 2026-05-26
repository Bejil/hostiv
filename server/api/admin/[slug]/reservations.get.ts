import { requirePropertyOwner } from "../../../utils/admin-auth"
import { listAdminBookingReservations } from "../../../utils/booking-reservation-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  return {
    reservations: await listAdminBookingReservations(slug)
  }
})
