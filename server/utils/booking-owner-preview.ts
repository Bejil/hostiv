import type { H3Event } from "h3"
import { isPropertyOwnerUser } from "./admin-auth"

export function readBookingPropertySlug(body: unknown): string {
  if (!body || typeof body !== "object") {
    return ""
  }

  const propertySlug = (body as Record<string, unknown>).propertySlug

  return typeof propertySlug === "string" ? propertySlug.trim().toLowerCase() : ""
}

/** Réservation depuis `/[slug]/preview` : propriétaire connecté, site éventuellement non publié. */
export async function isOwnerBookingPreview(event: H3Event, propertySlug: string) {
  const slug = propertySlug.trim().toLowerCase()

  if (!slug) {
    return false
  }

  return isPropertyOwnerUser(event, slug)
}

export function bookingSiteQueryOptions(allowUnpublished: boolean) {
  return { publishedOnly: !allowUnpublished }
}
