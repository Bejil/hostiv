import { translate } from "google-translate-api-x"
import { getAuthenticatedUserFromEvent } from "../../utils/admin-auth"

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Connexion requise."
    })
  }

  const body = await readBody(event)
  const text = String(body?.text ?? "").trim()
  const to = body?.to === "en" ? "en" : "fr"

  if (!text) {
    throw createError({
      statusCode: 400,
      message: "Texte vide."
    })
  }

  try {
    const result = await translate(text, { to })

    return {
      text: result.text
    }
  } catch {
    throw createError({
      statusCode: 502,
      message: "Traduction impossible."
    })
  }
})
