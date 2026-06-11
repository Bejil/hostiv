import { confirmHostivPasswordReset } from "../../../utils/hostiv-password-reset"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = typeof body?.token === "string" ? body.token.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!token) {
    throw createError({ statusCode: 400, message: "Lien incomplet." })
  }

  return confirmHostivPasswordReset({ token, password })
})
