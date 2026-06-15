import { hostivAccountProfileFromUser } from "../../utils/hostiv-account"
import { requirePlatformAdmin } from "../../utils/platform-admin-auth"

export default defineEventHandler(async (event) => {
  const user = await requirePlatformAdmin(event)
  const profile = hostivAccountProfileFromUser(user)

  return {
    email: profile.email,
    full_name: profile.full_name || null
  }
})
