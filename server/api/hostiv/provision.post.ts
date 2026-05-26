import { getBearerUser } from "../../utils/hostiv-auth"
import { provisionPropertyForUser } from "../../utils/hostiv-provision-property"

export default defineEventHandler(async (event) => {
  const user = await getBearerUser(event)
  const body = await readBody(event)

  const propertyName =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).property_name === "string"
      ? (body as Record<string, string>).property_name.trim()
      : ""

  const propertySlug =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).property_slug === "string"
      ? (body as Record<string, string>).property_slug.trim()
      : ""

  const subscriptionPlan =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).subscription_plan === "string"
      ? (body as Record<string, string>).subscription_plan
      : null

  if (!propertyName || !propertySlug) {
    throw createError({
      statusCode: 400,
      message: "Indiquez un nom de bien pour créer votre site."
    })
  }

  const result = await provisionPropertyForUser({
    userId: user.id,
    propertyName,
    propertySlug,
    subscriptionPlan,
    notifyEmail: user.email ?? null
  })

  return {
    ok: true,
    slug: result.slug,
    created: result.created
  }
})
