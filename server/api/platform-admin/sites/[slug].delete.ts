import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { logPlatformAdminAction } from "../../../utils/platform-admin-audit-log"
import { deletePlatformAdminSite } from "../../../utils/platform-admin-mutations"

export default defineEventHandler(async (event) => {
  const user = await requirePlatformAdmin(event)

  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const body = await readBody<{ confirm_slug?: string }>(event)
  const confirmSlug = typeof body?.confirm_slug === "string" ? body.confirm_slug : ""

  const result = await deletePlatformAdminSite(slug, confirmSlug)

  await logPlatformAdminAction({
    actor: user,
    action: "site.delete",
    targetType: "property",
    targetId: slug.trim().toLowerCase()
  })

  return result
})
