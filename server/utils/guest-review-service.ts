import { addDaysToInputDate, parisInputDateFromDate } from "../../app/utils/input-date"
import { getPropertyPublicSiteUrl } from "./booking-email-layout"
import { getPropertyBookingNotifyEmail, getPropertySiteBySlug } from "./property-site-repository"
import { requireSupabaseAdmin } from "./supabase"
import {
  createGuestReviewToken,
  guestReviewDeadlineInputDate,
  isGuestReviewWindowOpen
} from "./guest-review-token"
import { getGuestReviewByReservationId, insertGuestReview } from "./guest-review-repository"
import { sendGuestReviewRequestEmail, sendOwnerGuestReviewSubmittedEmail } from "./transactional-email"
import type { GuestReviewFormContext } from "../../app/types/guest-review"

type ReservationReviewRow = {
  id: string
  property_id: string
  property_slug: string
  status: string
  arrival_date: string
  departure_date: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  review_token: string | null
}

async function loadReservationByReviewToken(token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("booking_reservations")
    .select(
      "id, property_id, property_slug, status, arrival_date, departure_date, guest_first_name, guest_last_name, guest_email, review_token"
    )
    .eq("review_token", normalizedToken)
    .maybeSingle()

  if (error) {
    console.error("[guest-review] load reservation:", error.message)
    return null
  }

  if (!data) {
    return null
  }

  return data as ReservationReviewRow
}

export function buildGuestReviewFormUrl(slug: string, token: string) {
  const base = getPropertyPublicSiteUrl(slug).replace(/\/$/, "")

  if (!base) {
    return ""
  }

  return `${base}/avis?token=${encodeURIComponent(token)}`
}

export async function getGuestReviewFormContext(
  slug: string,
  token: string
): Promise<GuestReviewFormContext | null> {
  const normalizedSlug = slug.trim().toLowerCase()
  const reservation = await loadReservationByReviewToken(token)

  if (!reservation || reservation.property_slug !== normalizedSlug) {
    return null
  }

  const site = await getPropertySiteBySlug(normalizedSlug, { publishedOnly: false })
  const brandName = site?.brand_name?.trim() || normalizedSlug
  const existingReview = await getGuestReviewByReservationId(reservation.id)
  const expired = !isGuestReviewWindowOpen(reservation.departure_date)
  const invalidStatus = reservation.status !== "confirmed"

  return {
    brandName,
    slug: normalizedSlug,
    guestFirstName: reservation.guest_first_name.trim(),
    departureDate: reservation.departure_date,
    expiresOn: guestReviewDeadlineInputDate(reservation.departure_date),
    alreadySubmitted: Boolean(existingReview),
    expired: expired || invalidStatus
  }
}

export async function submitGuestReview(input: {
  slug: string
  token: string
  rating: number
  comment: string
}) {
  const normalizedSlug = input.slug.trim().toLowerCase()
  const reservation = await loadReservationByReviewToken(input.token)

  if (!reservation || reservation.property_slug !== normalizedSlug) {
    throw createError({ statusCode: 404, message: "Lien d’avis invalide ou expiré." })
  }

  if (reservation.status !== "confirmed") {
    throw createError({ statusCode: 410, message: "Ce séjour ne permet plus de laisser un avis." })
  }

  if (!isGuestReviewWindowOpen(reservation.departure_date)) {
    throw createError({
      statusCode: 410,
      message: "Le délai pour laisser un avis est dépassé (7 jours après le départ)."
    })
  }

  const existingReview = await getGuestReviewByReservationId(reservation.id)

  if (existingReview) {
    throw createError({ statusCode: 409, message: "Vous avez déjà laissé un avis pour ce séjour." })
  }

  const rating = Math.round(Number(input.rating))
  const comment = input.comment.trim()

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, message: "Choisissez une note entre 1 et 5." })
  }

  if (comment.length < 10) {
    throw createError({ statusCode: 400, message: "Votre commentaire doit contenir au moins 10 caractères." })
  }

  if (comment.length > 2000) {
    throw createError({ statusCode: 400, message: "Commentaire trop long (2000 caractères max.)." })
  }

  const review = await insertGuestReview({
    propertyId: reservation.property_id,
    propertySlug: reservation.property_slug,
    reservationId: reservation.id,
    guestFirstName: reservation.guest_first_name,
    guestLastName: reservation.guest_last_name,
    guestEmail: reservation.guest_email,
    arrivalDate: reservation.arrival_date,
    departureDate: reservation.departure_date,
    rating,
    comment
  })

  void (async () => {
    const ownerEmail = await getPropertyBookingNotifyEmail(normalizedSlug, { publishedOnly: false })

    if (!ownerEmail) {
      return
    }

    const site = await getPropertySiteBySlug(normalizedSlug, { publishedOnly: false })
    const brandName = site?.brand_name?.trim() || normalizedSlug
    const guestName = `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()

    await sendOwnerGuestReviewSubmittedEmail({
      to: ownerEmail,
      slug: normalizedSlug,
      brandName,
      guestName,
      guestEmail: reservation.guest_email,
      rating,
      comment,
      arrivalDate: reservation.arrival_date,
      departureDate: reservation.departure_date
    })
  })()

  return review
}

export async function runGuestReviewRequestEmails(now = new Date()) {
  const today = parisInputDateFromDate(now)
  const supabase = requireSupabaseAdmin()

  const { data: reservations, error } = await supabase
    .from("booking_reservations")
    .select(
      "id, property_slug, departure_date, guest_first_name, guest_last_name, guest_email, review_token, review_request_sent_at, status"
    )
    .eq("status", "confirmed")
    .is("review_request_sent_at", null)
    .lt("departure_date", today)

  if (error) {
    console.error("[guest-review-requests] read:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les réservations."
    })
  }

  let sentCount = 0

  for (const row of reservations ?? []) {
    const departureDate = String(row.departure_date || "")

    if (!departureDate || !isGuestReviewWindowOpen(departureDate, now)) {
      continue
    }

    const reservationId = String(row.id)
    const existingReview = await getGuestReviewByReservationId(reservationId)

    if (existingReview) {
      await supabase
        .from("booking_reservations")
        .update({ review_request_sent_at: now.toISOString() })
        .eq("id", reservationId)

      continue
    }

    const token = typeof row.review_token === "string" && row.review_token.trim()
      ? row.review_token.trim()
      : createGuestReviewToken()

    if (!row.review_token) {
      const { error: tokenError } = await supabase
        .from("booking_reservations")
        .update({ review_token: token })
        .eq("id", reservationId)

      if (tokenError) {
        console.error("[guest-review-requests] token:", tokenError.message)
        continue
      }
    }

    const slug = String(row.property_slug).trim().toLowerCase()
    const site = await getPropertySiteBySlug(slug, { publishedOnly: false })
    const brandName = site?.brand_name?.trim() || slug
    const reviewUrl = buildGuestReviewFormUrl(slug, token)

    if (!reviewUrl) {
      continue
    }

    await sendGuestReviewRequestEmail({
      to: String(row.guest_email || "").trim(),
      firstName: String(row.guest_first_name || "").trim(),
      brandName,
      slug,
      departureDate,
      expiresOn: guestReviewDeadlineInputDate(departureDate),
      reviewUrl
    })

    const { error: markError } = await supabase
      .from("booking_reservations")
      .update({ review_request_sent_at: now.toISOString() })
      .eq("id", reservationId)

    if (markError) {
      console.error("[guest-review-requests] mark sent:", markError.message)
      continue
    }

    sentCount += 1
  }

  return { sentCount, checked: reservations?.length ?? 0 }
}
