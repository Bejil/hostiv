import { requirePropertyPrimaryOwner } from "../../../../../utils/admin-auth"
import { refundAdminBookingReservation } from "../../../../../utils/booking-refund"
import { getAdminBookingReservationById } from "../../../../../utils/booking-reservation-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const id = getRouterParam(event, "id")

  if (!slug || !id) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  await requirePropertyPrimaryOwner(event, slug)

  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Stripe non configuré : renseignez STRIPE_SECRET_KEY."
    })
  }

  const existing = await getAdminBookingReservationById(slug, id)

  if (!existing) {
    throw createError({ statusCode: 404, message: "Réservation introuvable." })
  }

  const reservation = await refundAdminBookingReservation(slug, id, stripeSecretKey)

  return { reservation }
})
