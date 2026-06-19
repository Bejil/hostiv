import { getBearerUser } from "../../utils/hostiv-auth"
import { listAccessiblePropertiesForUser } from "../../utils/hostiv-properties"

export default defineEventHandler(async (event) => {
  const user = await getBearerUser(event)
  const properties = await listAccessiblePropertiesForUser(user.id)

  return { properties }
})
