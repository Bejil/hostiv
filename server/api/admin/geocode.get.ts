import { requirePropertyOwner } from "../../utils/admin-auth"
import { geocodeAddressQuery } from "../../utils/geocode-address"

export default defineEventHandler(async (event) => {
  const slug = String(getQuery(event).slug ?? "").trim()
  const address = String(getQuery(event).address ?? "").trim()

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  if (!address) {
    throw createError({ statusCode: 400, message: "Adresse requise." })
  }

  const result = await geocodeAddressQuery(address)

  if (!result) {
    throw createError({
      statusCode: 404,
      message: "Adresse introuvable. Vérifiez l’orthographe ou précisez la ville."
    })
  }

  return result
})
