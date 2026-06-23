import {
  buildPropertyTrafficVisitorHash,
  parisTodayDateString,
  recordPropertyPageView,
  shouldSkipPropertyTrafficTracking
} from "../../../utils/property-traffic"

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "").trim().toLowerCase()

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  if (shouldSkipPropertyTrafficTracking(event)) {
    return { ok: true, recorded: false }
  }

  const body = await readBody<{ path?: string }>(event).catch(() => ({}))
  const path = String(body?.path || "").trim()

  if (path && !path.startsWith(`/${slug}`)) {
    throw createError({ statusCode: 400, message: "Chemin invalide." })
  }

  const day = parisTodayDateString()
  const visitorHash = buildPropertyTrafficVisitorHash(event, day)
  const userAgent = String(getHeader(event, "user-agent") || "")

  const result = await recordPropertyPageView({
    slug,
    visitorHash,
    userAgent,
    day
  })

  return { ok: true, recorded: result.recorded }
})
