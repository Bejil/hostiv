import { completeBookingPayment } from "../../utils/booking-complete-payment"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return completeBookingPayment(event, body)
})
