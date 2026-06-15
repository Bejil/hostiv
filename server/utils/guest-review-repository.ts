import type {
  GuestReview,
  GuestReviewListResult,
  GuestReviewSortField,
  GuestReviewSortOrder,
  GuestReviewSummary
} from "../../app/types/guest-review"
import { requireSupabaseAdmin } from "./supabase"

const GUEST_REVIEW_SELECT =
  "id, property_slug, reservation_id, guest_first_name, guest_last_name, guest_email, arrival_date, departure_date, rating, comment, created_at"

type GuestReviewRow = {
  id: string
  property_slug: string
  reservation_id: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  arrival_date: string
  departure_date: string
  rating: number
  comment: string
  created_at: string
}

function mapGuestReview(row: GuestReviewRow): GuestReview {
  return {
    id: String(row.id),
    property_slug: String(row.property_slug),
    reservation_id: String(row.reservation_id),
    guest_first_name: String(row.guest_first_name || ""),
    guest_last_name: String(row.guest_last_name || ""),
    guest_email: String(row.guest_email || ""),
    rating: Number(row.rating),
    comment: String(row.comment || ""),
    created_at: String(row.created_at || ""),
    arrival_date: String(row.arrival_date || ""),
    departure_date: String(row.departure_date || "")
  }
}

export function createEmptyGuestReviewSummary(): GuestReviewSummary {
  return {
    total: 0,
    averageRating: 0,
    withComment: 0,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    latestReviewAt: null
  }
}

export async function getGuestReviewSummaryForProperty(slug: string): Promise<GuestReviewSummary> {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("guest_reviews")
    .select("rating, comment, created_at")
    .eq("property_slug", normalizedSlug)

  if (error) {
    console.error("[guest-reviews] summary:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les statistiques des avis."
    })
  }

  const rows = data ?? []

  if (!rows.length) {
    return createEmptyGuestReviewSummary()
  }

  const distribution: GuestReviewSummary["distribution"] = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0
  }

  let ratingSum = 0
  let withComment = 0
  let latestReviewAt: string | null = null

  for (const row of rows) {
    const rawRating = Number(row.rating)
    const bucket = Number.isFinite(rawRating)
      ? (Math.min(5, Math.max(1, Math.trunc(rawRating))) as 1 | 2 | 3 | 4 | 5)
      : 1

    distribution[String(bucket) as keyof GuestReviewSummary["distribution"]] += 1
    ratingSum += Number.isFinite(rawRating) ? rawRating : bucket

    if (String(row.comment || "").trim()) {
      withComment += 1
    }

    const createdAt = String(row.created_at || "")

    if (createdAt && (!latestReviewAt || createdAt > latestReviewAt)) {
      latestReviewAt = createdAt
    }
  }

  return {
    total: rows.length,
    averageRating: Math.round((ratingSum / rows.length) * 10) / 10,
    withComment,
    distribution,
    latestReviewAt
  }
}

export async function listGuestReviewsForProperty(
  slug: string,
  options: {
    page?: number
    pageSize?: number
    sort?: GuestReviewSortField
    order?: GuestReviewSortOrder
  } = {}
): Promise<GuestReviewListResult> {
  const normalizedSlug = slug.trim().toLowerCase()
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 25))
  const sort = options.sort === "rating" ? "rating" : "date"
  const order = options.order === "asc" ? "asc" : "desc"
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = requireSupabaseAdmin()

  let query = supabase
    .from("guest_reviews")
    .select(GUEST_REVIEW_SELECT, { count: "exact" })
    .eq("property_slug", normalizedSlug)

  if (sort === "rating") {
    query = query.order("rating", { ascending: order === "asc" }).order("created_at", {
      ascending: false
    })
  } else {
    query = query.order("created_at", { ascending: order === "asc" })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error("[guest-reviews] list:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les avis."
    })
  }

  const total = count ?? 0

  return {
    reviews: (data ?? []).map((row) => mapGuestReview(row as GuestReviewRow)),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize))
  }
}

export async function deleteGuestReview(slug: string, reviewId: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const id = reviewId.trim()
  const supabase = requireSupabaseAdmin()

  const { error } = await supabase
    .from("guest_reviews")
    .delete()
    .eq("property_slug", normalizedSlug)
    .eq("id", id)

  if (error) {
    console.error("[guest-reviews] delete:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de supprimer cet avis."
    })
  }
}

export async function getGuestReviewByReservationId(reservationId: string) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("guest_reviews")
    .select(GUEST_REVIEW_SELECT)
    .eq("reservation_id", reservationId)
    .maybeSingle()

  if (error) {
    console.error("[guest-reviews] by reservation:", error.message)
    return null
  }

  if (!data) {
    return null
  }

  return mapGuestReview(data as GuestReviewRow)
}

export async function insertGuestReview(input: {
  propertyId: string
  propertySlug: string
  reservationId: string
  guestFirstName: string
  guestLastName: string
  guestEmail: string
  arrivalDate: string
  departureDate: string
  rating: number
  comment: string
}) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("guest_reviews")
    .insert({
      property_id: input.propertyId,
      property_slug: input.propertySlug.trim().toLowerCase(),
      reservation_id: input.reservationId,
      guest_first_name: input.guestFirstName,
      guest_last_name: input.guestLastName,
      guest_email: input.guestEmail,
      arrival_date: input.arrivalDate,
      departure_date: input.departureDate,
      rating: input.rating,
      comment: input.comment
    })
    .select(GUEST_REVIEW_SELECT)
    .single()

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        message: "Un avis a déjà été envoyé pour ce séjour."
      })
    }

    console.error("[guest-reviews] insert:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer votre avis."
    })
  }

  return mapGuestReview(data as GuestReviewRow)
}
