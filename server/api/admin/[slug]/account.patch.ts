import { requirePropertyOwner } from "../../../utils/admin-auth"
import type { HostivAccountUpdateBody } from "../../../../app/types/hostiv-account"
import { updateHostivAccount } from "../../../utils/hostiv-account"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const user = await requirePropertyOwner(event, slug)
  const body = await readBody<HostivAccountUpdateBody>(event)

  return await updateHostivAccount(user, body ?? {})
})
