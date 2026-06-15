import { applySecurityHeaders } from "../utils/security-headers"

export default defineEventHandler((event) => {
  applySecurityHeaders(event)
})
