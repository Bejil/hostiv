const STORAGE_KEY = "hostiv-signup-login"
const MAX_AGE_MS = 2 * 60 * 60 * 1000

export type HostivSignupLoginCredentials = {
  email: string
  password: string
  savedAt: number
}

export function saveHostivSignupLoginCredentials(input: { email: string; password: string }) {
  if (!import.meta.client) {
    return
  }

  const payload: HostivSignupLoginCredentials = {
    email: input.email.trim(),
    password: input.password,
    savedAt: Date.now()
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function readHostivSignupLoginCredentials(): HostivSignupLoginCredentials | null {
  if (!import.meta.client) {
    return null
  }

  const raw = sessionStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as HostivSignupLoginCredentials

    if (
      !parsed ||
      typeof parsed.email !== "string" ||
      typeof parsed.password !== "string" ||
      typeof parsed.savedAt !== "number"
    ) {
      clearHostivSignupLoginCredentials()
      return null
    }

    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearHostivSignupLoginCredentials()
      return null
    }

    return parsed
  } catch {
    clearHostivSignupLoginCredentials()
    return null
  }
}

export function clearHostivSignupLoginCredentials() {
  if (!import.meta.client) {
    return
  }

  sessionStorage.removeItem(STORAGE_KEY)
}

export function hostivSignupLoginEmailMatches(
  credentials: HostivSignupLoginCredentials,
  accountEmail: string | null | undefined
) {
  const expected = String(accountEmail || "").trim().toLowerCase()

  if (!expected) {
    return false
  }

  return credentials.email.trim().toLowerCase() === expected
}
