import { enforceRateLimit } from "../utils/rate-limit"

export default defineEventHandler((event) => {
  enforceRateLimit(event)
})
