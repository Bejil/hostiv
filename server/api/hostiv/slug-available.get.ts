import { slugifyPropertyName, validatePropertySlugFormat } from "../../../app/utils/property-slug"
import { isPropertySlugTaken } from "../../../server/utils/property-slug-repository"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawName = typeof query.name === "string" ? query.name : ""
  const rawSlug = typeof query.slug === "string" ? query.slug.trim() : ""

  const slug = rawSlug || slugifyPropertyName(rawName)
  const validity = validatePropertySlugFormat(slug)

  if (!validity.valid) {
    return {
      slug: "slug" in validity ? validity.slug : "",
      valid: false,
      available: false,
      reason: validity.reason
    }
  }

  const taken = await isPropertySlugTaken(validity.slug)

  return {
    slug: validity.slug,
    valid: true,
    available: !taken,
    reason: taken ? "taken" : "available"
  }
})
