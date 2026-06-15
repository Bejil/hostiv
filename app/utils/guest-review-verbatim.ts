import type { GuestReview } from "../types/guest-review"
import type { PropertyReview } from "../types/property-site"
import type { HostivLocale } from "../types/hostiv-locale"
import { formatDisplayDate } from "./input-date"
import { formatRatingOnFive } from "./platform-rating-stars"

export function createPropertyReviewId() {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function importedGuestReviewIds(reviews: PropertyReview[]) {
  return new Set(
    reviews
      .map((review) => review.guest_review_id?.trim())
      .filter((value): value is string => Boolean(value))
  )
}

export function mapGuestReviewToPropertyReview(
  guestReview: GuestReview,
  locale: HostivLocale
): PropertyReview {
  const author = `${guestReview.guest_first_name} ${guestReview.guest_last_name}`.trim()
  const dateSource = guestReview.departure_date || guestReview.created_at.slice(0, 10)

  return {
    id: createPropertyReviewId(),
    author,
    date: dateSource ? formatDisplayDate(dateSource, locale) : "",
    quote: guestReview.comment.trim(),
    rating: formatRatingOnFive(guestReview.rating) || "5/5",
    guest_review_id: guestReview.id
  }
}
