import { normalizeCalendarConfig } from "../../../../app/utils/calendar-config"
import { listAdminBookingReservations } from "../../../utils/booking-reservation-repository"
import { getPropertyAdminBySlug } from "../../../utils/property-admin-repository"
import { buildReservationsIcsCalendar } from "../../../utils/reservations-ics"
import { verifyPropertyReservationsIcsToken } from "../../../utils/reservations-ics-token"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const query = getQuery(event)
  const token = typeof query.token === "string" ? query.token : ""

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  if (!(await verifyPropertyReservationsIcsToken(slug, token))) {
    throw createError({ statusCode: 403, message: "Lien ICS invalide." })
  }

  const property = await getPropertyAdminBySlug(slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const calendarConfig = normalizeCalendarConfig(property.calendar_config)
  const reservations = await listAdminBookingReservations(slug)
  const body = buildReservationsIcsCalendar(reservations, {
    calendarName: property.brand_name,
    propertySlug: property.slug,
    manualBlocks: calendarConfig.manual_blocks
  })

  setHeader(event, "Content-Type", "text/calendar; charset=utf-8")
  setHeader(event, "Cache-Control", "private, max-age=300")

  return body
})
