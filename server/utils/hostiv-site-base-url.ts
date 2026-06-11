export function resolveHostivSiteBaseUrl(fallbackOrigin?: string) {
  const configured = process.env.NUXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return configured.replace(/\/+$/, "")
  }

  if (fallbackOrigin?.trim()) {
    return fallbackOrigin.trim().replace(/\/+$/, "")
  }

  return ""
}
