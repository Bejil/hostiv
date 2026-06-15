export type GuestReview = {
  id: string
  property_slug: string
  reservation_id: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  rating: number
  comment: string
  created_at: string
  arrival_date?: string
  departure_date?: string
}

export type GuestReviewSortField = "date" | "rating"

export type GuestReviewSortOrder = "asc" | "desc"

export type GuestReviewListResult = {
  reviews: GuestReview[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  summary?: GuestReviewSummary
}

export type GuestReviewSummary = {
  total: number
  averageRating: number
  withComment: number
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>
  latestReviewAt: string | null
}

export type GuestReviewFormContext = {
  brandName: string
  slug: string
  guestFirstName: string
  departureDate: string
  expiresOn: string
  alreadySubmitted: boolean
  expired: boolean
}
