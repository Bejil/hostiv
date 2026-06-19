import { validatePropertyCohostInviteToken } from "../../../utils/property-cohost"

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || "").trim()

  if (!token) {
    throw createError({ statusCode: 400, message: "Jeton manquant." })
  }

  return await validatePropertyCohostInviteToken(token)
})
