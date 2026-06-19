const STORAGE_KEY = "hostiv-active-property-slug"

export function readHostivActivePropertySlug(): string | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const slug = typeof raw === "string" ? raw.trim().toLowerCase() : ""

    return slug.length ? slug : null
  } catch {
    return null
  }
}

export function writeHostivActivePropertySlug(slug: string) {
  if (!import.meta.client) {
    return
  }

  const normalized = slug.trim().toLowerCase()

  if (!normalized) {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // ignore quota errors
  }
}

export function clearHostivActivePropertySlug() {
  if (!import.meta.client) {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
