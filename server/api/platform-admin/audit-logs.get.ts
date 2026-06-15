import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import { listPlatformAdminAuditLogs } from "../../utils/platform-admin-audit-log"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = getQuery(event)
  const rawLimit = Number(query.limit)
  const limit = Number.isFinite(rawLimit) ? rawLimit : 100

  const logs = await listPlatformAdminAuditLogs(limit)

  return { logs }
})
