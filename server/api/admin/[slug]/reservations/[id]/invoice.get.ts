import { requirePropertyPremiumTools } from "../../../../../utils/hostiv-premium-tools-access"
import {
  buildBookingInvoicePdf,
  bookingInvoiceDownloadFilename
} from "../../../../../utils/booking-invoice-pdf"
import { getAdminBookingReservationById } from "../../../../../utils/booking-reservation-repository"
import { hostivAccountProfileFromUser } from "../../../../../utils/hostiv-account"
import { getPropertyAdminBySlug } from "../../../../../utils/property-admin-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const id = getRouterParam(event, "id")

  if (!slug || !id) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  const { access } = await requirePropertyPremiumTools(event, slug)
  const user = access.user
  const reservation = await getAdminBookingReservationById(slug, id)

  if (!reservation) {
    throw createError({ statusCode: 404, message: "Réservation introuvable." })
  }

  const property = await getPropertyAdminBySlug(slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  try {
    const pdf = await buildBookingInvoicePdf({
      reservation,
      property,
      issuer: hostivAccountProfileFromUser(user)
    })

    const filename = bookingInvoiceDownloadFilename(reservation, slug)

    setResponseHeader(event, "Content-Type", "application/pdf")
    setResponseHeader(event, "Content-Disposition", `attachment; filename="${filename}"`)
    setResponseHeader(event, "Cache-Control", "no-store")

    return pdf
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur inconnue"

    console.error("[booking-invoice]", detail, error)

    throw createError({
      statusCode: 500,
      message: `Impossible de generer la facture PDF : ${detail}`
    })
  }
})
