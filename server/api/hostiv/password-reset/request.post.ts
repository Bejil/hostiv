import type { HostivLocale } from "../../../app/types/hostiv-locale"
import { requestHostivPasswordReset } from "../../../utils/hostiv-password-reset"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body?.email === "string" ? body.email : ""
  const localeRaw = typeof body?.locale === "string" ? body.locale.trim() : "fr"
  const locale: HostivLocale = localeRaw === "en" ? "en" : "fr"

  return requestHostivPasswordReset({ email, locale })
})
