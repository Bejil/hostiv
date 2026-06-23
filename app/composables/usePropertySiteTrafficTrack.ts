function parisTodayDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now)
}

export function usePropertySiteTrafficTrack(
  slug: MaybeRefOrGetter<string>,
  options?: {
    enabled?: MaybeRefOrGetter<boolean>
  }
) {
  const route = useRoute()

  onMounted(() => {
    if (!import.meta.client) {
      return
    }

    if (toValue(options?.enabled) === false) {
      return
    }

    const normalizedSlug = String(toValue(slug) || "")
      .trim()
      .toLowerCase()

    if (!normalizedSlug) {
      return
    }

    const path = route.path
    const day = parisTodayDateString()
    const storageKey = `hostiv-traffic:${normalizedSlug}:${path}:${day}`

    if (sessionStorage.getItem(storageKey)) {
      return
    }

    sessionStorage.setItem(storageKey, "1")

    void $fetch(`/api/sites/${encodeURIComponent(normalizedSlug)}/traffic`, {
      method: "POST",
      body: { path }
    }).catch(() => {})
  })
}
