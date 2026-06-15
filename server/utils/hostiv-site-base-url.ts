function normalizeSiteBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "")
}

function isLocalDevOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local")
    )
  } catch {
    return false
  }
}

/** URL publique Hostiv pour les redirections Stripe (inscription, renouvellement). */
export function resolveHostivSiteBaseUrl(fallbackOrigin?: string) {
  const configured = process.env.NUXT_PUBLIC_SITE_URL?.trim()
  const fallback = fallbackOrigin?.trim() ? normalizeSiteBaseUrl(fallbackOrigin) : ""

  if (!configured) {
    return fallback
  }

  const normalizedConfigured = normalizeSiteBaseUrl(configured)

  if (!fallback) {
    return normalizedConfigured
  }

  if (isLocalDevOrigin(fallback)) {
    return fallback
  }

  try {
    const configuredHost = new URL(normalizedConfigured).hostname
    const fallbackHost = new URL(fallback).hostname

    if (configuredHost === fallbackHost) {
      return normalizedConfigured
    }
  } catch {
    return normalizedConfigured
  }

  return normalizedConfigured
}

/** Priorité : origine requête locale, puis success_url Stripe, puis NUXT_PUBLIC_SITE_URL. */
export function resolveHostivSiteBaseUrlForSignupFulfillment(input?: {
  requestOrigin?: string
  stripeSuccessUrl?: string | null
}) {
  const requestOrigin = input?.requestOrigin?.trim()

  if (requestOrigin) {
    return resolveHostivSiteBaseUrl(requestOrigin)
  }

  const successUrl = input?.stripeSuccessUrl?.trim()

  if (successUrl) {
    try {
      return resolveHostivSiteBaseUrl(new URL(successUrl).origin)
    } catch {
      /* ignore */
    }
  }

  return resolveHostivSiteBaseUrl()
}
