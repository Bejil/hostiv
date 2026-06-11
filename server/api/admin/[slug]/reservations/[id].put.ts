import { parseAdminBookingReservationUpdate } from "../../../../utils/admin-booking-reservation"
import { requirePropertyOwner } from "../../../../utils/admin-auth"
import {
  getAdminBookingReservationById,
  updateAdminBookingReservation
} from "../../../../utils/booking-reservation-repository"
import {
  describeReservationChanges,
  reservationMeaningfulFieldsChanged
} from "../../../../utils/admin-reservation-changes"
import {
  sendReservationCancelledEmails,
  sendReservationUpdatedEmails
} from "../../../../utils/transactional-email"

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

  const body = await readBody(event)
  const parsed = parseAdminBookingReservationUpdate(body)

  if (!parsed.ok) {
    throw createError({ statusCode: 400, message: parsed.message })
  }

  const reservation = await updateAdminBookingReservation(slug, id, parsed.data)

  if (existing.status === "confirmed" && reservation.status === "cancelled" && !reservation.refunded_at) {
    void sendReservationCancelledEmails({
      slug,
      reservation,
      refunded: false
    })
  } else if (reservationMeaningfulFieldsChanged(existing, reservation)) {
    void sendReservationUpdatedEmails({
      slug,
      reservation,
      changes: describeReservationChanges(existing, reservation)
    })
  }

  return { reservation }
})
