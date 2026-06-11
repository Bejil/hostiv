import { requirePropertyOwner } from "../../../../utils/admin-auth"
import { getPropertyAdminBySlug } from "../../../../utils/property-admin-repository"
import { buildWelcomeGuidePdf, welcomeGuidePdfFilename } from "../../../../utils/welcome-guide-pdf"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Paramètre manquant." })
  }

  await requirePropertyOwner(event, slug)

  const property = await getPropertyAdminBySlug(slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  try {
    const pdf = await buildWelcomeGuidePdf(property)
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
