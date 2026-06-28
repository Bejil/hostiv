import type { HostivLocale } from "../../../../../app/types/hostiv-locale"
import { requirePropertyPremiumTools } from "../../../../utils/hostiv-premium-tools-access"
import { buildWelcomeGuidePdf, welcomeGuidePdfFilename } from "../../../../utils/welcome-guide-pdf"
import { normalizePropertyAdminRecord } from "../../../../../app/utils/normalize-property-admin"
import type { PropertyAdminRecord } from "../../../../../app/types/property-admin"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Paramètre manquant." })
  }

  await requirePropertyPremiumTools(event, slug)

  const body = await readBody<{
    record?: PropertyAdminRecord
    assetRevision?: number
    locale?: HostivLocale
  } | PropertyAdminRecord>(event)

  const incoming =
    body && typeof body === "object" && "record" in body && body.record
      ? body.record
      : (body as PropertyAdminRecord)

  if (!incoming || typeof incoming !== "object") {
    throw createError({ statusCode: 400, message: "Brouillon manquant pour le PDF." })
  }

  const assetRevision =
    body && typeof body === "object" && "record" in body && typeof body.assetRevision === "number"
      ? body.assetRevision
      : 0

  const locale: HostivLocale =
    body && typeof body === "object" && "record" in body && body.locale === "en" ? "en" : "fr"

  const property = normalizePropertyAdminRecord({
    ...incoming,
    slug
  } as PropertyAdminRecord)

  try {
    const pdf = await buildWelcomeGuidePdf(property, undefined, { assetRevision, locale })
    const filename = welcomeGuidePdfFilename(slug)

    setResponseHeader(event, "Content-Type", "application/pdf")
    setResponseHeader(event, "Content-Disposition", `attachment; filename="${filename}"`)
    setResponseHeader(event, "Cache-Control", "no-store")

    return pdf
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur inconnue"

    console.error("[welcome-guide-pdf]", detail, error)

    throw createError({
      statusCode: 500,
      message: `Impossible de générer le guide d'accueil PDF : ${detail}`
    })
  }
})
