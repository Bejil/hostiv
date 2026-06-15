import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import { listPlatformAdminAlerts } from "../../utils/platform-admin-repository"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  return listPlatformAdminAlerts()
})
