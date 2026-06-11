import { requirePropertyOwner } from "../../../../utils/admin-auth"
import {
  deleteAdminBookingReservation,
  getAdminBookingReservationById
} from "../../../../utils/booking-reservation-repository"
import { sendReservationDeletedEmails } from "../../../../utils/transactional-email"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const id = getRouterParam(event, "id")

  if (!slug || !id) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  await requirePropertyOwner(event, slug)

  const existing = await getAdminBookingReservationById(slug, id)

  if (!existing) {
    throw createError({ statusCode: 404, message: "Réservation introuvable." })
  }

  void sendReservationDeletedEmails({
    slug,
    reservation: existing
  })

  await deleteAdminBookingReservation(slug, id)

  return { ok: true as const }
})
