import { requirePlatformAdmin } from "../../utils/platform-admin-auth"
import {
  getPlatformAdminReservationsSummary,
  listPlatformAdminReservations
} from "../../utils/platform-admin-repository"

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = getQuery(event)
  const limitRaw = Number(query.limit)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100

  const [summary, rows] = await Promise.all([
    getPlatformAdminReservationsSummary(),
    listPlatformAdminReservations(limit)
  ])

  return { summary, rows }
})
