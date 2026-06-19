import { getAuthenticatedUserFromEvent } from "../../../utils/admin-auth"
import { acceptPropertyCohostInvite } from "../../../utils/property-cohost"

type AcceptBody = {
  token?: string
}

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUserFromEvent(event)

  if (!user) {
    throw createError({ statusCode: 401, message: "Connexion requise." })
  }

  const body = await readBody<AcceptBody>(event)
  const token = typeof body?.token === "string" ? body.token.trim() : ""

  if (!token) {
    throw createError({ statusCode: 400, message: "Jeton manquant." })
  }

  return await acceptPropertyCohostInvite({ token, user })
})
