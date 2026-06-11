import { randomBytes } from "node:crypto"
import { addDaysToInputDate, parisInputDateFromDate } from "../../app/utils/input-date"

export const GUEST_REVIEW_WINDOW_DAYS = 7

export function createGuestReviewToken() {
  return randomBytes(24).toString("base64url")
}

export function guestReviewDeadlineInputDate(departureDate: string) {
  return addDaysToInputDate(departureDate, GUEST_REVIEW_WINDOW_DAYS)
}

export function isGuestReviewWindowOpen(departureDate: string, now = new Date()) {
  const today = parisInputDateFromDate(now)
  const deadline = guestReviewDeadlineInputDate(departureDate)

  return today <= deadline
}
