import { requirePropertyOwner } from "../../../../utils/admin-auth"
import { createBookingPaymentIntent } from "../../../../utils/booking-create-payment-intent"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const body = await readBody(event)

  return createBookingPaymentIntent(event, body, {
    publishedOnly: false,
    propertySlug: slug
  })
})
