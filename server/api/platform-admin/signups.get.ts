import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import { listPlatformAdminSignups } from "../../utils/platform-admin-repository"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  return listPlatformAdminSignups()
})
