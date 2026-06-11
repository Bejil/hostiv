import { validateHostivPasswordResetToken } from "../../../utils/hostiv-password-reset"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token || "").trim()

  if (!token) {
    throw createError({ statusCode: 400, message: "Lien incomplet." })
  }

  return validateHostivPasswordResetToken(token)
})
