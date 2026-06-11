import {
  bookingSiteQueryOptions,
  isOwnerBookingPreview,
  readBookingPropertySlug
} from "../../utils/booking-owner-preview"
import { createBookingPaymentIntent } from "../../utils/booking-create-payment-intent"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const propertySlug = readBookingPropertySlug(body)
  const ownerPreview = propertySlug ? await isOwnerBookingPreview(event, propertySlug) : false

  return createBookingPaymentIntent(event, body, bookingSiteQueryOptions(ownerPreview))
})
