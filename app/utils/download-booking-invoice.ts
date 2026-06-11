import type { AdminBookingReservation } from "../types/booking-reservation"

export async function downloadBookingInvoicePdf(
  slug: string,
  reservation: AdminBookingReservation,
  headers: Record<string, string>
) {
  const blob = await $fetch<Blob>(`/api/admin/${encodeURIComponent(slug)}/reservations/${reservation.id}/invoice`, {
    method: "GET",
    headers,
    responseType: "blob"
  })

  const guestSlug = `${reservation.guest_last_name}-${reservation.guest_first_name}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const shortId = reservation.id.replace(/-/g, "").slice(0, 8).toUpperCase()
  const year = new Date(reservation.created_at || Date.now()).getFullYear()
  const filename = `facture-${slug}-FAC-${year}-${shortId}${guestSlug ? `-${guestSlug}` : ""}.pdf`

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
