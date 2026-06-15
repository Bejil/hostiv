import { requirePropertyPremiumTools } from "../../../../utils/hostiv-premium-tools-access"
import { buildWelcomeGuideHtml } from "../../../../utils/welcome-guide-html"
import { normalizePropertyAdminRecord } from "../../../../../app/utils/normalize-property-admin"
import { normalizeWelcomeGuide } from "../../../../../app/utils/welcome-guide-content"
import type { PropertyAdminRecord } from "../../../../../app/types/property-admin"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Paramètre manquant." })
  }

  await requirePropertyPremiumTools(event, slug)

  const body = await readBody<{ record?: PropertyAdminRecord } | PropertyAdminRecord>(event)
  const incoming = (body as { record?: PropertyAdminRecord })?.record ?? (body as PropertyAdminRecord)

  if (!incoming || typeof incoming !== "object") {
    throw createError({ statusCode: 400, message: "Brouillon manquant pour l’aperçu." })
  }

  const normalized = normalizePropertyAdminRecord({
    ...incoming,
    slug
  } as PropertyAdminRecord)
  const guide = normalizeWelcomeGuide(
    normalized.content.welcome_guide,
    normalized.brand_name,
    normalized
  )
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || ""
  const html = buildWelcomeGuideHtml(normalized, guide, { supabaseUrl })

  return { html }
})
