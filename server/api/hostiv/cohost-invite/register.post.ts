import { registerAndAcceptPropertyCohostInvite } from "../../../utils/property-cohost"

type RegisterBody = {
  token?: string
  first_name?: string
  last_name?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)
  const token = typeof body?.token === "string" ? body.token.trim() : ""
  const firstName = typeof body?.first_name === "string" ? body.first_name.trim() : ""
  const lastName = typeof body?.last_name === "string" ? body.last_name.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!token) {
    throw createError({ statusCode: 400, message: "Jeton manquant." })
  }

  if (!password) {
    throw createError({ statusCode: 400, message: "Choisissez un mot de passe." })
  }

  return await registerAndAcceptPropertyCohostInvite({
    token,
    firstName,
    lastName,
    password
  })
})
