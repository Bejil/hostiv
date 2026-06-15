import { requirePlatformAdmin } from "../../../utils/platform-admin-auth"
import { logPlatformAdminAction } from "../../../utils/platform-admin-audit-log"
import {
  deletePlatformAdminMember,
  getPlatformAdminMemberDetailForAdmin,
  updatePlatformAdminMember
} from "../../../utils/platform-admin-mutations"
import type { HostivAccountUpdateBody } from "../../../../app/types/hostiv-account"

export default defineEventHandler(async (event) => {
  const user = await requirePlatformAdmin(event)

  const userId = getRouterParam(event, "userId")

  if (!userId) {
    throw createError({ statusCode: 400, message: "Identifiant membre manquant." })
  }

  if (event.method === "GET") {
    return getPlatformAdminMemberDetailForAdmin(userId)
  }

  if (event.method === "PATCH") {
    const body = await readBody<HostivAccountUpdateBody>(event)

    const profile = await updatePlatformAdminMember(userId, body ?? {})

    await logPlatformAdminAction({
      actor: user,
      action: "member.update",
      targetType: "user",
      targetId: userId,
      metadata: {
        fields: Object.keys(body ?? {})
      }
    })

    return profile
  }

  if (event.method === "DELETE") {
    const body = await readBody<{ confirm_email?: string }>(event)
    const confirmEmail = typeof body?.confirm_email === "string" ? body.confirm_email : ""

    const result = await deletePlatformAdminMember(userId, confirmEmail)

    await logPlatformAdminAction({
      actor: user,
      action: "member.delete",
      targetType: "user",
      targetId: userId,
      metadata: {
        confirm_email: confirmEmail.trim().toLowerCase()
      }
    })

    return result
  }

  throw createError({ statusCode: 405, message: "Méthode non autorisée." })
})
