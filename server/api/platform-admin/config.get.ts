export default defineEventHandler(() => {
  const configured = readPlatformAdminEmails().size > 0

  return { configured }
})
