import { requirePropertyOwner } from "../../../utils/admin-auth"
import { getPropertyAdminBySlug } from "../../../utils/property-admin-repository"
import { uploadPropertyAsset } from "../../../utils/property-asset-upload"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const site = await getPropertyAdminBySlug(slug)

  if (!site) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const parts = await readMultipartFormData(event)

  if (!parts?.length) {
    throw createError({ statusCode: 400, message: "Fichier manquant." })
  }

  let filePart: (typeof parts)[number] | undefined
  let pathValue = ""

  for (const part of parts) {
    if (part.name === "file" && part.data) {
      filePart = part
    }

    if (part.name === "path" && part.data) {
      pathValue = part.data.toString("utf8").trim()
    }
  }

  if (!filePart?.data) {
    throw createError({ statusCode: 400, message: "Fichier manquant." })
  }

  if (!pathValue) {
    throw createError({
      statusCode: 400,
      message: "Chemin cible manquant (ex. gallery/hero-salon.jpeg)."
    })
  }

  const result = await uploadPropertyAsset(
    slug,
    {
      data: filePart.data,
      filename: filePart.filename,
      type: filePart.type
    },
    pathValue
  )

  return result
})
